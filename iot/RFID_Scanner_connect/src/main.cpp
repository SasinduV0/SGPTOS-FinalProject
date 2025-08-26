
#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <time.h>
#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>
#include <freertos/task.h>

// WiFi credentials - Replace with your network credentials
const char* ssid = "Redmi Note 9 Pro";
const char* password = "1234r65i";

// WebSocket server configuration
const char* websocket_server = "192.168.211.159"; // Replace with your server IP
const int websocket_port = 8000;
const char* websocket_path = "/rfid-ws";

// NTP server configuration for Sri Lanka timezone
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 19800;    // GMT+5:30 for Sri Lanka (5.5 hours * 3600 seconds)
const int daylightOffset_sec = 0;   // Sri Lanka doesn't use daylight saving time

// WebSocket client
WebSocketsClient webSocket;

// Daily scan counter for ID generation
volatile uint16_t dailyScanCount = 0;
String lastDateString = "";

// WebSocket connection status
volatile bool wsConnected = false;

// ScannedData structure for queue
struct ScannedData {
    time_t timestamp;             // Unix timestamp
    uint8_t stationNumber;       // Scanner ID (1, 2, or 3)
    uint8_t uid[10];            // RFID UID (max 10 bytes for MIFARE)
    uint8_t uidSize;           // Actual UID size
    char scanID[16];           // Generated scan ID
    char stationID[8];         // Station ID (e.g., "1A01")
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

// Forward declarations for FreeRTOS tasks
void connectivityTask(void *parameter);
void rfidScanningTask(void *parameter);

// Helper function to repeat a string
String repeatString(const char* str, int count) {
    String result = "";
    for (int i = 0; i < count; i++) {
        result += str;
    }
    return result;
}

// RFID Scanner pins
const struct {
    uint8_t ss;    // SDA
    uint8_t rst;
}

SCANNER_PINS[] = {
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
    rfid.PCD_WriteRegister(MFRC522::TxASKReg, 0x40);       // Force 100% ASK modulation
    rfid.PCD_WriteRegister(MFRC522::RFCfgReg, 0x70);      // Receiver gain 48dB
    rfid.PCD_WriteRegister(MFRC522::ModeReg, 0x3D);      // CRC with 0x6363
    
    // Enable antenna
    rfid.PCD_WriteRegister(MFRC522::TxControlReg, 0x83);
}

// Initialize WiFi connection (Core 0 task)
void initWiFi() {
    Serial.printf("Attempting to connect to WiFi network: %s\n", ssid);
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    
    int attempts = 0;
    const int maxAttempts = 40; // 20 seconds timeout
    
    while (WiFi.status() != WL_CONNECTED && attempts < maxAttempts) {
        delay(500);
        Serial.print(".");
        attempts++;
        
        // Print status every 10 attempts (5 seconds)
        if (attempts % 10 == 0) {
            Serial.printf("\nWiFi Status: %d, Attempts: %d/%d\n", WiFi.status(), attempts, maxAttempts);
            Serial.print("Continuing");
        }
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println();
        Serial.print("WiFi connected! IP address: ");
        Serial.println(WiFi.localIP());
        Serial.printf("RSSI: %d dBm\n", WiFi.RSSI());
        wifiConnected = true;
    } else {
        Serial.println();
        Serial.println("!!! WiFi connection failed after timeout !!!");
        Serial.printf("Final WiFi Status: %d\n", WiFi.status());
        Serial.println("Please check:");
        Serial.println("1. WiFi network name (SSID) is correct");
        Serial.println("2. WiFi password is correct");
        Serial.println("3. WiFi network is 2.4GHz (ESP32 doesn't support 5GHz)");
        Serial.println("4. ESP32 is close enough to the router/hotspot");
        wifiConnected = false;
    }
}

// Initialize NTP and synchronize time (Core 0 task)
void initNTP() {
    if (!wifiConnected) {
        Serial.println("WiFi not connected, cannot sync time");
        return;
    }
    
    Serial.printf("Configuring NTP with server: %s\n", ntpServer);
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
    
    Serial.print("Synchronizing time with NTP server");
    struct tm timeinfo;
    int attempts = 0;
    const int maxAttempts = 40; // 20 seconds timeout
    
    while (!getLocalTime(&timeinfo) && attempts < maxAttempts) {
        delay(500);
        Serial.print(".");
        attempts++;
        
        // Print status every 10 attempts (5 seconds)
        if (attempts % 10 == 0) {
            Serial.printf("\nNTP sync attempts: %d/%d\n", attempts, maxAttempts);
            Serial.print("Continuing");
        }
    }
    
    if (getLocalTime(&timeinfo)) {
        Serial.println();
        Serial.println("Time synchronized successfully!");
        Serial.print("Current time: ");
        Serial.println(asctime(&timeinfo));
        lastNTPSync = millis();
        timeInitialized = true;
    } else {
        Serial.println();
        Serial.println("!! NTP synchronization failed after timeout !!");
        Serial.println("Continuing without time sync (timestamps will be 0)");
        timeInitialized = false;
    }
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

// Handle incoming WebSocket messages
void handleWebSocketMessage(const char* message) {
    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, message);

    if (error) {
        Serial.println("! Failed to parse WebSocket message !");
        return;
    }    String type = doc["type"];
    String status = doc["status"];
    
    if (type == "connection" && status == "success") {
        Serial.println("WebSocket connection confirmed");
    } else if (type == "rfid_scan_success") {
        Serial.println("RFID scan saved successfully");
        String scanId = doc["data"]["scanId"];
        Serial.println("Database ID: " + scanId);
    } else if (type == "error") {
        String errorType = doc["error"]["type"];
        String errorMsg = doc["error"]["message"];
        Serial.println("!! Server Error: " + errorType + " - " + errorMsg);
    }
}

// WebSocket event handler
void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_DISCONNECTED:
            Serial.println("!! WebSocket Disconnected");
            wsConnected = false;
            break;
            
        case WStype_CONNECTED:
            Serial.printf("WebSocket Connected to: %s\n", payload);
            wsConnected = true;
            break;
            
        case WStype_TEXT:
            Serial.printf("Received: %s\n", payload);
            handleWebSocketMessage((char*)payload);
            break;
            
        case WStype_ERROR:
            Serial.printf("!! WebSocket Error: %s\n", payload);
            wsConnected = false;
            break;
            
        default:
            break;
    }
}

// Initialize WebSocket connection
void initWebSocket() {
    webSocket.begin(websocket_server, websocket_port, websocket_path);
    webSocket.onEvent(webSocketEvent);
    webSocket.setReconnectInterval(5000);
    Serial.println("<- WebSocket client initialized ->");
}

// Generate unique scan ID (format: YYMMDDSA# where A# is hex counter)
String generateScanID() {
    struct tm timeinfo;
    if (!getLocalTime(&timeinfo)) {
        return "000000S00"; // Fallback if time not available
    }
    
    char dateStr[7];
    strftime(dateStr, sizeof(dateStr), "%y%m%d", &timeinfo);
    
    String currentDate = String(dateStr);
    if (currentDate != lastDateString) {
        dailyScanCount = 0; // Reset counter for new day
        lastDateString = currentDate;
    }
    
    dailyScanCount++;
    String scanID = currentDate + "S" + String(dailyScanCount, HEX);
    scanID.toUpperCase();
    return scanID;
}

// Generate station ID (format: UAss where U=Unit, A=Line, ss=Station)
String generateStationID(uint8_t stationNumber) {
    return "1A0" + String(stationNumber);
}

// Convert UID bytes to hex string
String uidToString(uint8_t* uid, uint8_t uidSize) {
    String uidStr = "";
    for (byte i = 0; i < uidSize; i++) {
        if (uid[i] < 0x10) uidStr += "0";
        uidStr += String(uid[i], HEX);
    }
    uidStr.toUpperCase();
    return uidStr;
}

// Send RFID data via WebSocket
bool sendRFIDDataViaWebSocket(const ScannedData& data) {
    if (!wsConnected) {
        Serial.println("!! WebSocket not connected, cannot send data");
        return false;
    }
    
    JsonDocument doc;
    doc["action"] = "rfid_scan";
    doc["data"]["ID"] = String(data.scanID);
    doc["data"]["Tag_UID"] = uidToString((uint8_t*)data.uid, data.uidSize);
    doc["data"]["Station_ID"] = String(data.stationID);
    doc["data"]["Time_Stamp"] = data.timestamp;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    Serial.println("Sending via WebSocket: " + jsonString);
    webSocket.sendTXT(jsonString);
    return true;
}

// Core 0 Task: Handle WiFi connectivity and time synchronization
void connectivityTask(void *parameter) {
    Serial.println("Core 0: Starting connectivity task...");
    
    // Initialize WiFi
    initWiFi();
    
    // Initialize NTP (only if WiFi connected)
    if (wifiConnected) {
        initNTP();
        // Initialize WebSocket
        initWebSocket();
    } else {
        Serial.println("!! Skipping NTP and WebSocket due to WiFi failure");
        Serial.println("RFID scanning will work in offline mode");
    }
    
    // Signal that connectivity task is ready
    Serial.println("Core 0 connectivity task is ready!");
    
    // Main connectivity loop
    while (true) {
        if (wifiConnected) {
            // Handle WebSocket events
            webSocket.loop();
            
            // Check WiFi connection status
            if (WiFi.status() != WL_CONNECTED) {
                Serial.println("!! WiFi disconnected, attempting reconnection...");
                wifiConnected = false;
                wsConnected = false;
                WiFi.reconnect();
                delay(5000);
            }
            
            // Check for NTP re-synchronization
            checkNTPSync();
        } else {
            // Try to reconnect WiFi periodically
            if (WiFi.status() == WL_CONNECTED) {
                wifiConnected = true;
                Serial.println("WiFi reconnected!");
                // Re-sync time after reconnection
                initNTP();
                // Reconnect WebSocket
                initWebSocket();
            } else {
                // Try to reconnect every 30 seconds
                static unsigned long lastReconnectAttempt = 0;
                if (millis() - lastReconnectAttempt >= 30000) {
                    Serial.println("Attempting WiFi reconnection...");
                    initWiFi();
                    lastReconnectAttempt = millis();
                }
            }
        }
        
        // Process queue and send data via WebSocket
        ScannedData queueData;
        while (xQueueReceive(scannedDataQueue, &queueData, 0) == pdTRUE) {
            // Try to send data via WebSocket
            if (sendRFIDDataViaWebSocket(queueData)) {
                Serial.println("Core 0: Data sent via WebSocket successfully");
            } else {
                Serial.println("Core 0: Failed to send data, re-queuing...");
                // Re-queue the data if sending failed
                xQueueSendToFront(scannedDataQueue, &queueData, pdMS_TO_TICKS(10));
                break; // Stop processing queue if WebSocket issues
            }
        }
        
        // Optional: Print status periodically (every 30 seconds)
        static unsigned long lastStatus = 0;
        if (millis() - lastStatus >= 30000) {
            int queueCount = uxQueueMessagesWaiting(scannedDataQueue);
            Serial.printf("Core 0 - Queue: %d/%d | WiFi: %s | WebSocket: %s\n", 
                         queueCount, QUEUE_SIZE,
                         wifiConnected ? "OK" : "Not-OK",
                         wsConnected ? "OK" : "Not-OK");
            lastStatus = millis();
        }
        
        // Task delay to prevent watchdog issues
        vTaskDelay(pdMS_TO_TICKS(100)); // Check every 100ms for responsive WebSocket
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
    
    // Generate scan ID and station ID
    String scanID = generateScanID();
    String stationID = generateStationID(stationNumber);
    
    scanID.toCharArray(scannedData.scanID, sizeof(scannedData.scanID));
    stationID.toCharArray(scannedData.stationID, sizeof(scannedData.stationID));
    
    // Try to add to queue (non-blocking for maximum speed)
    if (xQueueSend(scannedDataQueue, &scannedData, 0) == pdTRUE) {
        // Successfully added to queue
        Serial.print("Core 1 - Card queued - Station ");
        Serial.print(stationNumber);
        Serial.print(" (");
        Serial.print(stationID);
        Serial.print("), ID: ");
        Serial.print(scanID);
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
    Serial.println("\n" + repeatString("=", 50));
    Serial.println("<-> ESP32 Dual-Core RFID Scanner Starting...");
    Serial.println(repeatString("=", 50));
    Serial.printf("> Target WiFi: %s\n", ssid);
    Serial.printf("> WebSocket Server: %s:%d%s\n", websocket_server, websocket_port, websocket_path);
    Serial.println(repeatString("=", 50));
    
    // Create FreeRTOS queue for scanned data (must be created before tasks)
    Serial.print("Creating FreeRTOS queue... ");
    scannedDataQueue = xQueueCreate(QUEUE_SIZE, sizeof(ScannedData));
    if (scannedDataQueue == NULL) {
        Serial.println("!! FAILED !!");
        Serial.println("ERROR: Failed to create queue!");
        while (1); // Halt execution
    }
    Serial.println("<> Success!");
    
    // Configure all SS pins as OUTPUT and HIGH
    Serial.print("Configuring RFID scanner pins... ");
    for (auto& pin : SCANNER_PINS) {
        pinMode(pin.ss, OUTPUT);
        digitalWrite(pin.ss, HIGH);
    }
    Serial.println("<> Done!");
    
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
    
    Serial.println("\n" + repeatString("=", 50));
    Serial.println("<> Hardware setup complete!");
    Serial.println("-> Creating dual-core tasks...");
    
    // Create Core 0 task for WiFi and connectivity (Pro Core)
    Serial.print("Creating Core 0 (Connectivity) task... ");
    xTaskCreatePinnedToCore(
        connectivityTask,           // Task function
        "ConnectivityTask",         // Task name
        4096,                       // Stack size (bytes)
        NULL,                       // Task parameter
        1,                          // Task priority
        &connectivityTaskHandle,    // Task handle
        0                           // Core 0 (Pro Core)
    );
    Serial.println("<> Created!");
    
    // Create Core 1 task for RFID scanning (App Core)
    Serial.print("Creating Core 1 (RFID Scanning) task... ");
    xTaskCreatePinnedToCore(
        rfidScanningTask,           // Task function
        "RFIDScanningTask",         // Task name
        4096,                       // Stack size (bytes)
        NULL,                       // Task parameter
        2,                          // Task priority (higher than connectivity)
        &rfidScanningTaskHandle,    // Task handle
        1                           // Core 1 (App Core)
    );
    Serial.println("<> Created!");
    
    Serial.println("\n" + repeatString("=", 50));
    Serial.println("<-> ESP32 Dual-Core RFID Scanner is starting up!");
    Serial.println("> Core 0: WiFi, NTP sync, and WebSocket communication");
    Serial.println("> Core 1: RFID scanning operations");
    Serial.println(repeatString("=", 50));
    Serial.println("! Please wait for connectivity and scanning tasks to initialize...");
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
    vTaskDelay(pdMS_TO_TICKS(3000)); // Increased to 3 seconds
    
    Serial.println("> Core 1: RFID scanning task ready!");
    Serial.println("> Ready to scan RFID cards on all 3 readers!");
    Serial.println("> Place an RFID card near any scanner to test...");
    
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
    delay(1000); // Prevent tight loop
}