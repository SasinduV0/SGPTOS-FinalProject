/*
 * ESP32 Multi-RFID Scanner with FreeRTOS Dual-Core Architecture
 * 
 * Core 0 (Pro Core): WiFi, NTP synchronization, connectivity tasks
 * Core 1 (App Core): RFID scanning, queue operations (time-critical)
 * 
 * Features:
 * - Supports 3 MFRC522 RFID scanners via shared SPI
 * - WiFi connectivity with NTP time synchronization (Sri Lanka timezone)
 * - FreeRTOS queue for thread-safe data passing between cores
 * - Automatic NTP re-synchronization every 2 hours
 * - Dual-core architecture for uninterrupted RFID scanning
 * 
 * Data Structure: ScannedData contains timestamp, station number, UID, and UID size
 * Queue: Thread-safe FreeRTOS queue with configurable size (default: 50 items)
 * 
 * Modified by: GitHub Copilot
 * Date: August 17, 2025
 */

#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <time.h>
#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>
#include <freertos/task.h>

// WiFi credentials - Replace with your network credentials
const char* ssid = "Redmi Note 9 Pro";
const char* password = "1234r65i";

// NTP server configuration for Sri Lanka timezone
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 19800;  // GMT+5:30 for Sri Lanka (5.5 hours * 3600 seconds)
const int daylightOffset_sec = 0;   // Sri Lanka doesn't use daylight saving time

// ScannedData structure for queue
struct ScannedData {
    time_t timestamp;             // Unix timestamp
    uint8_t stationNumber;       // Scanner ID (1, 2, or 3)
    uint8_t uid[10];            // RFID UID (max 10 bytes for MIFARE)
    uint8_t uidSize;           // Actual UID size
};

// FreeRTOS Queue handle
QueueHandle_t scannedDataQueue;
const int QUEUE_SIZE = 50;      // Maximum number of scanned data items in queue

// FreeRTOS Task handles
TaskHandle_t connectivityTaskHandle = NULL;
TaskHandle_t rfidScanningTaskHandle = NULL;

// Time synchronization variables
unsigned long lastNTPSync = 0;
const unsigned long NTP_SYNC_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

// WiFi and time synchronization status flags
volatile bool wifiConnected = false;
volatile bool timeInitialized = false;

// RFID Scanner pins
const struct {
    uint8_t ss;    // SDA
    uint8_t rst;
} SCANNER_PINS[] = {
    {5, 27},   // Scanner 1
    {4, 32},   // Scanner 2
    {2, 34}    // Scanner 3
};

// Shared SPI pins on ESP32
const uint8_t SCK_PIN = 18;
const uint8_t MOSI_PIN = 23;
const uint8_t MISO_PIN = 19;

// Create RFID instances
MFRC522 readers[] = {
    MFRC522(SCANNER_PINS[0].ss, SCANNER_PINS[0].rst),
    MFRC522(SCANNER_PINS[1].ss, SCANNER_PINS[1].rst),
    MFRC522(SCANNER_PINS[2].ss, SCANNER_PINS[2].rst)
};

void initRFID(MFRC522& rfid) {
    rfid.PCD_Init();
    delay(50);
    
    // Configure for reliable operation
    rfid.PCD_WriteRegister(MFRC522::TxASKReg, 0x40);     // Force 100% ASK modulation
    rfid.PCD_WriteRegister(MFRC522::RFCfgReg, 0x70);     // Receiver gain 48dB
    rfid.PCD_WriteRegister(MFRC522::ModeReg, 0x3D);      // CRC with 0x6363
    
    // Enable antenna
    rfid.PCD_WriteRegister(MFRC522::TxControlReg, 0x83);
}

// Initialize WiFi connection (Core 0 task)
void initWiFi() {
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    
    Serial.println();
    Serial.print("WiFi connected! IP address: ");
    Serial.println(WiFi.localIP());
    wifiConnected = true;
}

// Initialize NTP and synchronize time (Core 0 task)
void initNTP() {
    if (!wifiConnected) {
        Serial.println("WiFi not connected, cannot sync time");
        return;
    }
    
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
    
    Serial.print("Synchronizing time with NTP server");
    struct tm timeinfo;
    while (!getLocalTime(&timeinfo)) {
        delay(500);
        Serial.print(".");
    }
    
    Serial.println();
    Serial.println("Time synchronized successfully!");
    Serial.print("Current time: ");
    Serial.println(asctime(&timeinfo));
    lastNTPSync = millis();
    timeInitialized = true;
}

// Check if NTP resync is needed and perform it (Core 0 task)
void checkNTPSync() {
    if (!wifiConnected) return;
    
    if (millis() - lastNTPSync >= NTP_SYNC_INTERVAL) {
        Serial.println("Re-synchronizing time with NTP server...");
        configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
        lastNTPSync = millis();
    }
}

// Core 0 Task: Handle WiFi connectivity and time synchronization
void connectivityTask(void *parameter) {
    Serial.println("Core 0: Starting connectivity task...");
    
    // Initialize WiFi
    initWiFi();
    
    // Initialize NTP
    initNTP();
    
    // Main connectivity loop
    while (true) {
        // Check WiFi connection status
        if (WiFi.status() != WL_CONNECTED) {
            Serial.println("WiFi disconnected, attempting reconnection...");
            wifiConnected = false;
            WiFi.reconnect();
            delay(5000);
        } else if (!wifiConnected) {
            wifiConnected = true;
            Serial.println("WiFi reconnected!");
            // Re-sync time after reconnection
            initNTP();
        }
        
        // Check for NTP re-synchronization
        checkNTPSync();
        
        // Optional: Print queue status periodically (every 30 seconds)
        static unsigned long lastQueueStatus = 0;
        if (millis() - lastQueueStatus >= 30000) {
            int queueCount = uxQueueMessagesWaiting(scannedDataQueue);
            Serial.printf("Core 0 - Queue status: %d/%d items\n", queueCount, QUEUE_SIZE);
            lastQueueStatus = millis();
        }
        
        // Task delay to prevent watchdog issues
        vTaskDelay(pdMS_TO_TICKS(1000)); // Check every 1 second
    }
}

// Process scanned RFID card and add to queue (Core 1 task)
bool processScannedCard(MFRC522& rfid, uint8_t stationNumber) {
    // Get current timestamp (only if time is initialized)
    time_t now = 0;
    if (timeInitialized) {
        time(&now);
    }
    
    // Create ScannedData structure
    ScannedData scannedData;
    scannedData.timestamp = now;
    scannedData.stationNumber = stationNumber;
    scannedData.uidSize = rfid.uid.size;
    
    // Copy UID to structure
    for (byte i = 0; i < rfid.uid.size && i < 10; i++) {
        scannedData.uid[i] = rfid.uid.uidByte[i];
    }
    
    // Try to add to queue (non-blocking for maximum speed)
    if (xQueueSend(scannedDataQueue, &scannedData, 0) == pdTRUE) {
        // Successfully added to queue
        Serial.print("Core 1 - Card queued - Station ");
        Serial.print(stationNumber);
        Serial.print(", UID: ");
        for (byte i = 0; i < rfid.uid.size; i++) {
            Serial.print(rfid.uid.uidByte[i] < 0x10 ? " 0" : " ");
            Serial.print(rfid.uid.uidByte[i], HEX);
        }
        
        // Format and print actual date and time (only if available)
        if (timeInitialized && now > 0) {
            struct tm timeinfo;
            localtime_r(&now, &timeinfo);
            char timeString[64];
            strftime(timeString, sizeof(timeString), "%Y-%m-%d %H:%M:%S", &timeinfo);
            Serial.print(", Date & Time: ");
            Serial.println(timeString);
        } else {
            Serial.println(", Time: Not synchronized");
        }
        return true;
    } else {
        // Queue is full
        Serial.println("Core 1 - Warning: Queue is full, card data discarded!");
        return false;
    }
}

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("\nStarting ESP32 Dual-Core RFID Scanner Setup...");
    
    // Create FreeRTOS queue for scanned data (must be created before tasks)
    scannedDataQueue = xQueueCreate(QUEUE_SIZE, sizeof(ScannedData));
    if (scannedDataQueue == NULL) {
        Serial.println("ERROR: Failed to create queue!");
        while (1); // Halt execution
    }
    Serial.println("FreeRTOS queue created successfully");
    
    // Configure all SS pins as OUTPUT and HIGH
    for (auto& pin : SCANNER_PINS) {
        pinMode(pin.ss, OUTPUT);
        digitalWrite(pin.ss, HIGH);
    }
    
    // Initialize SPI
    SPI.begin(SCK_PIN, MISO_PIN, MOSI_PIN);
    SPI.setFrequency(100000);  // 100kHz for stability
    SPI.setDataMode(SPI_MODE0);
    SPI.setBitOrder(MSBFIRST);
    
    // Initialize all readers
    for (int i = 0; i < 3; i++) {
        Serial.print("Initializing Reader "); 
        Serial.println(i + 1);
        initRFID(readers[i]);
        byte ver = readers[i].PCD_ReadRegister(MFRC522::VersionReg);
        Serial.print("Version: 0x"); 
        Serial.println(ver, HEX);
        delay(50);
    }
    
    // Create Core 0 task for WiFi and connectivity (Pro Core)
    xTaskCreatePinnedToCore(
        connectivityTask,           // Task function
        "ConnectivityTask",         // Task name
        4096,                       // Stack size (bytes)
        NULL,                       // Task parameter
        1,                          // Task priority
        &connectivityTaskHandle,    // Task handle
        0                           // Core 0 (Pro Core)
    );
    
    // Create Core 1 task for RFID scanning (App Core)
    xTaskCreatePinnedToCore(
        rfidScanningTask,           // Task function
        "RFIDScanningTask",         // Task name
        4096,                       // Stack size (bytes)
        NULL,                       // Task parameter
        2,                          // Task priority (higher than connectivity)
        &rfidScanningTaskHandle,    // Task handle
        1                           // Core 1 (App Core)
    );
    
    Serial.println("Setup complete!");
    Serial.println("Core 0: Handling WiFi, NTP synchronization");
    Serial.println("Core 1: Handling RFID scanning operations");
    Serial.println("Dual-core architecture active for optimal performance!");
}

// Optimized scanning function for Core 1 (App Core)
void scanCard(MFRC522& rfid, uint8_t stationNumber) {
    // Check if new card is present and can be read
    if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
        // Process the scanned card and add to queue
        processScannedCard(rfid, stationNumber);
        
        // Halt the card and stop crypto communication
        rfid.PICC_HaltA();
        rfid.PCD_StopCrypto1();
    }
}

// Core 1 Task: Handle RFID scanning operations (time-critical)
void rfidScanningTask(void *parameter) {
    Serial.println("Core 1: Starting RFID scanning task...");
    
    // Wait a moment for Core 0 to initialize
    vTaskDelay(pdMS_TO_TICKS(2000));
    
    Serial.println("Core 1: RFID scanning task ready!");
    
    // Main RFID scanning loop - optimized for maximum speed
    while (true) {
        // Check each reader in sequence - Optimized for Core 1 performance
        for (int i = 0; i < 3; i++) {
            // Set current reader's SS pin LOW, others HIGH
            for (int j = 0; j < 3; j++) {
                digitalWrite(SCANNER_PINS[j].ss, j == i ? LOW : HIGH);
            }
            delayMicroseconds(10000);  // 10ms delay in microseconds for precision
            
            // Use the optimized scanCard function
            scanCard(readers[i], i + 1);  // Station numbers are 1-based
            
            digitalWrite(SCANNER_PINS[i].ss, HIGH);
            delayMicroseconds(50000);  // 50ms delay between readers for stability
        }
        
        // Minimal task delay to prevent watchdog issues while maintaining speed
        vTaskDelay(pdMS_TO_TICKS(1)); // 1ms delay
    }
}

void loop() {
    // Main loop is now empty as tasks handle everything
    // Tasks are running on both cores independently
    
    // Optional: Add any main loop monitoring or watchdog feeding here
    // Keep this minimal to avoid interfering with core tasks
    
    delay(1000); // Prevent tight loop
}