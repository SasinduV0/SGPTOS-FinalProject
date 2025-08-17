/*
 * ESP32 Multi-RFID Scanner with FreeRTOS Queue and NTP Synchronization
 * 
 * Features:
 * - Supports 3 MFRC522 RFID scanners via shared SPI
 * - WiFi connectivity with NTP time synchronization (Sri Lanka timezone)
 * - FreeRTOS queue for thread-safe data passing between cores
 * - Automatic NTP re-synchronization every 2 hours
 * - Optimized for Core 1 (App Core) performance
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

// WiFi credentials - Replace with your network credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// NTP server configuration for Sri Lanka timezone
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 19800;  // GMT+5:30 for Sri Lanka (5.5 hours * 3600 seconds)
const int daylightOffset_sec = 0;   // Sri Lanka doesn't use daylight saving time

// ScannedData structure for queue
struct ScannedData {
    time_t timestamp;           // Unix timestamp
    uint8_t stationNumber;      // Scanner ID (1, 2, or 3)
    uint8_t uid[10];           // RFID UID (max 10 bytes for MIFARE)
    uint8_t uidSize;           // Actual UID size
};

// FreeRTOS Queue handle
QueueHandle_t scannedDataQueue;
const int QUEUE_SIZE = 50;      // Maximum number of scanned data items in queue

// Time synchronization variables
unsigned long lastNTPSync = 0;
const unsigned long NTP_SYNC_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

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

// Initialize WiFi connection
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
}

// Initialize NTP and synchronize time
void initNTP() {
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
}

// Check if NTP resync is needed and perform it
void checkNTPSync() {
    if (millis() - lastNTPSync >= NTP_SYNC_INTERVAL) {
        Serial.println("Re-synchronizing time with NTP server...");
        configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
        lastNTPSync = millis();
    }
}

// Process scanned RFID card and add to queue
bool processScannedCard(MFRC522& rfid, uint8_t stationNumber) {
    // Get current timestamp
    time_t now;
    time(&now);
    
    // Create ScannedData structure
    ScannedData scannedData;
    scannedData.timestamp = now;
    scannedData.stationNumber = stationNumber;
    scannedData.uidSize = rfid.uid.size;
    
    // Copy UID to structure
    for (byte i = 0; i < rfid.uid.size && i < 10; i++) {
        scannedData.uid[i] = rfid.uid.uidByte[i];
    }
    
    // Try to add to queue (non-blocking)
    if (xQueueSend(scannedDataQueue, &scannedData, 0) == pdTRUE) {
        // Successfully added to queue
        Serial.print("Card queued - Station ");
        Serial.print(stationNumber);
        Serial.print(", UID: ");
        for (byte i = 0; i < rfid.uid.size; i++) {
            Serial.print(rfid.uid.uidByte[i] < 0x10 ? " 0" : " ");
            Serial.print(rfid.uid.uidByte[i], HEX);
        }
        Serial.print(", Timestamp: ");
        Serial.println(now);
        return true;
    } else {
        // Queue is full
        Serial.println("Warning: Queue is full, card data discarded!");
        return false;
    }
}

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("\nStarting RFID Scanner Setup...");
    
    // Initialize WiFi
    initWiFi();
    
    // Initialize NTP
    initNTP();
    
    // Create FreeRTOS queue for scanned data
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
    
    Serial.println("Setup complete!");
    Serial.println("Ready to scan RFID cards...");
}

// Optimized scanning function for Core 1 (App Core)
void scanCard(MFRC522& rfid, uint8_t stationNumber) {
    // Check if new card is present and can be read
    if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
        // Process the scanned card and add to queue
        if (processScannedCard(rfid, stationNumber)) {
            // Card successfully processed and queued
            // Additional processing can be added here if needed
        }
        
        // Halt the card and stop crypto communication
        rfid.PICC_HaltA();
        rfid.PCD_StopCrypto1();
    }
}

void loop() {
    // Check for NTP re-synchronization periodically
    checkNTPSync();
    
    // Check each reader in sequence - Optimized for Core 1 performance
    for (int i = 0; i < 3; i++) {
        // Set current reader's SS pin LOW, others HIGH
        for (int j = 0; j < 3; j++) {
            digitalWrite(SCANNER_PINS[j].ss, j == i ? LOW : HIGH);
        }
        delay(10);  // Allow SS to settle
        
        // Use the optimized scanCard function
        scanCard(readers[i], i + 1);  // Station numbers are 1-based
        
        digitalWrite(SCANNER_PINS[i].ss, HIGH);
        delay(50);  // Delay between readers for stability
    }
    
    // Optional: Print queue status periodically (every 10 seconds)
    static unsigned long lastQueueStatus = 0;
    if (millis() - lastQueueStatus >= 10000) {
        int queueCount = uxQueueMessagesWaiting(scannedDataQueue);
        Serial.print("Queue status: ");
        Serial.print(queueCount);
        Serial.print("/");
        Serial.print(QUEUE_SIZE);
        Serial.println(" items");
        lastQueueStatus = millis();
    }
}