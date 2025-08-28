
#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <time.h>
#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>
#include <freertos/task.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>

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

// LCD configuration
const uint8_t LCD_I2C_ADDR = 0x27;
const uint8_t LCD_COLS = 16;
const uint8_t LCD_ROWS = 2;
LiquidCrystal_I2C lcd(LCD_I2C_ADDR, LCD_COLS, LCD_ROWS);

// Individual station scan counters
volatile uint32_t station1ScanCount = 0;
volatile uint32_t station2ScanCount = 0;
volatile uint32_t qcScanCount = 0;

// Station access control - tracks which employee is logged in to each station
bool station1Active = false;
bool station2Active = false;
bool qcActive = false;

String station1Employee = "";
String station2Employee = "";
String qcEmployee = "";

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
const int QUEUE_SIZE = 100;      // Increased to 100 for better offline storage

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

// Forward declarations for LCD functions
void initLCD();
void updateRFIDDisplay(const char* uid, uint32_t scanCount);

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
    {5, 27},   // Station 1
    {4, 32},   // Station 2
    {2, 34}    // QC Station
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

//These are the RFID card UIDs of employees that have been assigned to each station
String qcSta = "E9EB3903";       //QC station employee card
String emp1Sta = "F5A628A1";     //Employee 1 station card  
String emp2Sta = "E5B79BA1";     //Employee 2 station card

// Function to check if a scanned UID matches an employee card
bool isEmployeeCard(String scannedUID) {
    return (scannedUID == qcSta || scannedUID == emp1Sta || scannedUID == emp2Sta);
}

// Function to get employee name from UID
String getEmployeeName(String uid) {
    if (uid == qcSta) return "QC_Employee";
    if (uid == emp1Sta) return "Employee_1";
    if (uid == emp2Sta) return "Employee_2";
    return "Unknown";
}

// Function to get the assigned station number for an employee
uint8_t getAssignedStation(String uid) {
    if (uid == emp1Sta) return 1;  // Employee 1 -> Station 1
    if (uid == emp2Sta) return 2;  // Employee 2 -> Station 2
    if (uid == qcSta) return 3;    // QC Employee -> QC Station
    return 0; // Unknown
}

// Function to get station name
String getStationName(uint8_t stationNumber) {
    switch(stationNumber) {
        case 1: return "Station 1";
        case 2: return "Station 2"; 
        case 3: return "QC Station";
        default: return "Unknown";
    }
}

// Function to display message on LCD (for Station 2 only)
void displayLCDMessage(String line1, String line2) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print(line1.substring(0, 16)); // Truncate to 16 chars
    lcd.setCursor(0, 1);
    lcd.print(line2.substring(0, 16)); // Truncate to 16 chars
}

// Function to handle employee login/logout with station assignment validation
void handleEmployeeAccess(String scannedUID, uint8_t stationNumber) {
    String employeeName = getEmployeeName(scannedUID);
    uint8_t assignedStation = getAssignedStation(scannedUID);
    String stationName = getStationName(stationNumber);
    String assignedStationName = getStationName(assignedStation);
    
    // Check if employee is trying to access their assigned station
    if (assignedStation != stationNumber) {
        String message = "Wrong station, Go to " + assignedStationName;
        Serial.println(employeeName + " tried to access " + stationName + " - " + message);
        
        // Display message on LCD for Station 2
        if (stationNumber == 2) {
            displayLCDMessage("Wrong Station!", "Go to " + assignedStationName);
            delay(3000); // Show message for 3 seconds
            displayLCDMessage("Station 2", "Scan your card");
        }
        return;
    }
    
    // Employee is at their correct station
    switch(stationNumber) {
        case 1: // Station 1 - Employee 1
            if (!station1Active) {
                station1Active = true;
                station1Employee = employeeName;
                Serial.println("Station 1: Shift starting... - " + employeeName);
            } else if (station1Employee == employeeName) {
                station1Active = false;
                station1Employee = "";
                Serial.println("Station 1: Shift ended - " + employeeName);
            }
            break;
            
        case 2: // Station 2 - Employee 2
            if (!station2Active) {
                station2Active = true;
                station2Employee = employeeName;
                Serial.println("Station 2: Shift starting... - " + employeeName);
                displayLCDMessage("Shift starting...", employeeName);
                delay(2000); // Show message for 2 seconds
                displayLCDMessage("Station 2", "Ready to scan");
            } else if (station2Employee == employeeName) {
                station2Active = false;
                station2Employee = "";
                Serial.println("Station 2: Shift ended - " + employeeName);
                displayLCDMessage("Shift ended", employeeName);
                delay(2000); // Show message for 2 seconds
                displayLCDMessage("Station 2", "Scan your card");
            }
            break;
            
        case 3: // QC Station - QC Employee
            if (!qcActive) {
                qcActive = true;
                qcEmployee = employeeName;
                Serial.println("QC Station: Shift starting... - " + employeeName);
            } else if (qcEmployee == employeeName) {
                qcActive = false;
                qcEmployee = "";
                Serial.println("QC Station: Shift ended - " + employeeName);
            }
            break;
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

// Initialize LCD display
void initLCD() {
    Wire.begin();
    lcd.init();
    lcd.backlight();
    
    // Display startup message
    lcd.setCursor(0, 0);
    lcd.print("ESP32 RFID");
    lcd.setCursor(0, 1);
    lcd.print("Scanner Ready");
    delay(2000);
    
    // Clear and show initial state
    lcd.clear();
    displayLCDMessage("Station 2", "Scan your card");
}

// Update LCD with latest RFID UID and scan count from Station 2 only
void updateRFIDDisplay(const char* uid, uint32_t scanCount) {
    char line1[17];
    char line2[17];
    
    // Format UID for display (truncate if too long)
    if (strlen(uid) <= 12) {
        snprintf(line1, sizeof(line1), "S2: %s", uid);
    } else {
        // Show first 10 chars if longer (accounting for "S2: " prefix)
        char truncatedUid[11];
        strncpy(truncatedUid, uid, 10);
        truncatedUid[10] = '\0';
        snprintf(line1, sizeof(line1), "S2: %s..", truncatedUid);
    }
    
    // Format scan count for Station 2
    snprintf(line2, sizeof(line2), "Count: %lu", scanCount);
    
    // Update display
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print(line1);
    lcd.setCursor(0, 1);
    lcd.print(line2);
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

// Generate station ID based on station type
String generateStationID(uint8_t stationNumber) {
    switch(stationNumber) {
        case 1: return "1A01";  // Station 1
        case 2: return "1A02";  // Station 2
        case 3: return "1AQC";  // QC Station
        default: return "1A00"; // Unknown
    }
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
        Serial.println("RFID scanning will work in OFFLINE mode - scans will be queued");
        Serial.println("Data will be sent when WiFi/WebSocket connection is restored");
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
                    WiFi.disconnect();
                    delay(1000);
                    WiFi.begin(ssid, password);
                    lastReconnectAttempt = millis();
                }
            }
        }
        
        // Process queue and send data via WebSocket (only when connected)
        if (wsConnected) {
            ScannedData queueData;
            // Try to send one item from queue per loop iteration
            if (xQueueReceive(scannedDataQueue, &queueData, 0) == pdTRUE) {
                // Try to send data via WebSocket
                if (sendRFIDDataViaWebSocket(queueData)) {
                    Serial.println("Core 0: Data sent via WebSocket successfully");
                } else {
                    Serial.println("Core 0: Failed to send data, will retry next cycle");
                    // Put the failed item back at front of queue to retry later
                    xQueueSendToFront(scannedDataQueue, &queueData, 0);
                    // Don't break - let scanning continue
                }
            }
        }
        // If WebSocket not connected, just let the queue fill up - scanning continues
        
        // Optional: Print status periodically (every 30 seconds)
        static unsigned long lastStatus = 0;
        if (millis() - lastStatus >= 30000) {
            int queueCount = uxQueueMessagesWaiting(scannedDataQueue);
            uint32_t totalScans = station1ScanCount + station2ScanCount + qcScanCount;
            Serial.printf("Core 0 - Queue: %d/%d | WiFi: %s | WebSocket: %s | Total: %lu (S1:%lu S2:%lu QC:%lu)\n", 
                         queueCount, QUEUE_SIZE,
                         wifiConnected ? "OK" : "Not-OK",
                         wsConnected ? "OK" : "Not-OK",
                         totalScans, station1ScanCount, station2ScanCount, qcScanCount);
            
            // Show station status
            Serial.printf("Station Status - S1: %s%s | S2: %s%s | QC: %s%s\n",
                         station1Active ? "ACTIVE" : "INACTIVE",
                         station1Active ? (" (" + station1Employee + ")").c_str() : "",
                         station2Active ? "ACTIVE" : "INACTIVE", 
                         station2Active ? (" (" + station2Employee + ")").c_str() : "",
                         qcActive ? "ACTIVE" : "INACTIVE",
                         qcActive ? (" (" + qcEmployee + ")").c_str() : "");
            
            // Warn if queue is getting full
            if (queueCount > QUEUE_SIZE * 0.8) {
                Serial.printf("!! WARNING: Queue is %d%% full - %d items pending\n", 
                             (queueCount * 100) / QUEUE_SIZE, queueCount);
            }
            lastStatus = millis();
        }
        
        // Task delay to prevent watchdog issues
        vTaskDelay(pdMS_TO_TICKS(100)); // Check every 100ms for responsive WebSocket
    }
}

// Process scanned RFID card and add to queue (Core 1 task)
bool processScannedCard(MFRC522& rfid, uint8_t stationNumber) {
    // Convert UID to string for comparison
    String uidString = uidToString((uint8_t*)rfid.uid.uidByte, rfid.uid.size);
    
    // Check if this is an employee card
    if (isEmployeeCard(uidString)) {
        // Handle employee login/logout
        handleEmployeeAccess(uidString, stationNumber);
        return false; // Don't queue employee cards
    }
    
    // Check if station is active before scanning regular cards
    bool stationActive = false;
    String stationName = "";
    volatile uint32_t* stationCounter = nullptr;
    
    switch(stationNumber) {
        case 1:
            stationActive = station1Active;
            stationName = "Station 1";
            stationCounter = &station1ScanCount;
            break;
        case 2:
            stationActive = station2Active;
            stationName = "Station 2";
            stationCounter = &station2ScanCount;
            break;
        case 3:
            stationActive = qcActive;
            stationName = "QC Station";
            stationCounter = &qcScanCount;
            break;
    }
    
    if (!stationActive) {
        String message = stationName + " is not active - First scan your card";
        Serial.println(message);
        
        // Display message on LCD for Station 2
        if (stationNumber == 2) {
            displayLCDMessage("First scan", "your card");
            delay(2000); // Show message for 2 seconds
            displayLCDMessage("Station 2", "Scan your card");
        }
        return false;
    }
    
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
        (*stationCounter)++; // Increment respective station counter
        
        // Update LCD display only for Station 2 scans
        if (stationNumber == 2) {
            updateRFIDDisplay(uidString.c_str(), station2ScanCount);
        }
        
        Serial.print("Core 1 - Card queued - " + stationName);
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
        
        // Show queue status and station counters
        int queueCount = uxQueueMessagesWaiting(scannedDataQueue);
        Serial.printf("Queue: %d/%d | S1: %lu | S2: %lu | QC: %lu\n", 
                     queueCount, QUEUE_SIZE, station1ScanCount, station2ScanCount, qcScanCount);
        
        return true;
    } else {
        // Queue is full - remove oldest item to make space for new scan
        ScannedData oldestData;
        if (xQueueReceive(scannedDataQueue, &oldestData, 0) == pdTRUE) {
            Serial.println("Core 1 - Queue full! Removed oldest scan to make space");
            // Now try to add the new scan
            if (xQueueSend(scannedDataQueue, &scannedData, 0) == pdTRUE) {
                (*stationCounter)++;
                if (stationNumber == 2) {
                    updateRFIDDisplay(uidString.c_str(), station2ScanCount);
                }
                Serial.println("Core 1 - New scan added after removing oldest");
                return true;
            }
        }
        
        // If we still can't add, show error but don't block scanning
        if (stationNumber == 2) {
            updateRFIDDisplay("Queue Error", station2ScanCount);
        }
        Serial.println("Core 1 - Queue management failed, but continuing to scan...");
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
    
    // Initialize LCD display
    Serial.print("Initializing LCD display... ");
    initLCD();
    Serial.println("<> Done!");
    
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
    Serial.println("> Ready to scan RFID cards on all 3 stations!");
    Serial.println("> Station 1, Station 2, and QC Station");
    Serial.println("> First scan employee cards to activate stations");
    Serial.println("> LCD will show only Station 2 scans");
    
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