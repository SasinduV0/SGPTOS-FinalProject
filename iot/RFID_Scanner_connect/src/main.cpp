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

// LCD configuration for Station 2 (1602A)
const uint8_t LCD_S2_I2C_ADDR = 0x27;
const uint8_t LCD_S2_COLS = 16;
const uint8_t LCD_S2_ROWS = 2;
LiquidCrystal_I2C lcdStation2(LCD_S2_I2C_ADDR, LCD_S2_COLS, LCD_S2_ROWS);

// LCD configuration for QC Station (1604A)
const uint8_t LCD_QC_I2C_ADDR = 0x26;
const uint8_t LCD_QC_COLS = 16;
const uint8_t LCD_QC_ROWS = 4;
LiquidCrystal_I2C lcdQC(LCD_QC_I2C_ADDR, LCD_QC_COLS, LCD_QC_ROWS);

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

// Shift confirmation states
enum ShiftState {
    WAITING_FOR_CARD,
    WAITING_START_CONFIRMATION,
    ACTIVE_SCANNING,
    WAITING_END_CONFIRMATION
};

volatile ShiftState station1State = WAITING_FOR_CARD;
volatile ShiftState station2State = WAITING_FOR_CARD;
volatile ShiftState qcState = WAITING_FOR_CARD;

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
void initLCDs();
void updateStation2Display(const char* uid, uint32_t scanCount);
void updateQCDisplay(const char* uid, uint32_t scanCount);
void displayStation2Message(String line1, String line2);
void displayQCMessage(String line1, String line2, String line3 = "", String line4 = "");

// Forward declarations for button functions
void initButtons();
bool isOKPressed(uint8_t stationNumber);
bool isCancelPressed(uint8_t stationNumber);
void waitForButtonRelease(uint8_t stationNumber);
bool waitForButtonPress(uint8_t stationNumber, unsigned long timeoutMs = 30000);

// Helper function to repeat a string
String repeatString(const char* str, int count) {
    String result = "";
    for (int i = 0; i < count; i++) {
        result += str;
    }
    return result;
}

// RFID Scanner pins
const uint8_t SCANNER_SS_PINS[] = {
    5,   // Station 1
    4,   // Station 2
    2    // QC Station
};

// Button pins for shift confirmation
const struct {
    uint8_t ok;
    uint8_t cancel;
} BUTTON_PINS[] = {
    {32, 34},  // Station 1 - OK: 32, Cancel: 34
    {13, 14},  // Station 2 - OK: 13, Cancel: 14
    {27, 26}   // QC Station - OK: 27, Cancel: 26
};

// Shared SPI pins on ESP32
const uint8_t SCK_PIN = 18;
const uint8_t MOSI_PIN = 23;
const uint8_t MISO_PIN = 19;

// Create RFID instances
MFRC522 readers[] = {
    MFRC522(SCANNER_SS_PINS[0], 0), // RST pin not used
    MFRC522(SCANNER_SS_PINS[1], 0),
    MFRC522(SCANNER_SS_PINS[2], 0)
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

// Function to display message on Station 2 LCD
void displayStation2Message(String line1, String line2) {
    lcdStation2.clear();
    lcdStation2.setCursor(0, 0);
    lcdStation2.print(line1.substring(0, 16)); // Truncate to 16 chars
    lcdStation2.setCursor(0, 1);
    lcdStation2.print(line2.substring(0, 16)); // Truncate to 16 chars
}

// Function to display message on QC LCD (supports up to 4 lines)
void displayQCMessage(String line1, String line2, String line3, String line4) {
    lcdQC.clear();
    lcdQC.setCursor(0, 0);
    lcdQC.print(line1.substring(0, 16)); // Truncate to 16 chars
    lcdQC.setCursor(0, 1);
    lcdQC.print(line2.substring(0, 16)); // Truncate to 16 chars
    if (line3.length() > 0) {
        lcdQC.setCursor(0, 2);
        lcdQC.print(line3.substring(0, 16)); // Truncate to 16 chars
    }
    if (line4.length() > 0) {
        lcdQC.setCursor(0, 3);
        lcdQC.print(line4.substring(0, 16)); // Truncate to 16 chars
    }
}

// Function to handle employee login/logout with station assignment validation and button confirmation
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
            displayStation2Message("Wrong Station!", "Go to " + assignedStationName);
            delay(3000); // Show message for 3 seconds
            displayStation2Message("Station 2", "Scan your card");
        }
        // Display message on LCD for QC Station
        else if (stationNumber == 3) {
            displayQCMessage("Wrong Station!", "Go to " + assignedStationName, "Access Denied", "");
            delay(3000); // Show message for 3 seconds
            displayQCMessage("QC Station", "Scan your card", "", "");
        }
        return;
    }
    
    // Employee is at their correct station - handle state-based logic
    switch(stationNumber) {
        case 1: // Station 1 - Employee 1
            if (station1State == WAITING_FOR_CARD && !station1Active) {
                // Request confirmation to start shift
                Serial.println("Station 1: " + employeeName + " requesting to start shift");
                station1State = WAITING_START_CONFIRMATION;
                
                // Wait for button press (OK to start, Cancel to postpone)
                if (waitForButtonPress(1, 30000)) { // 30 second timeout
                    // OK pressed - start shift
                    station1Active = true;
                    station1Employee = employeeName;
                    station1State = ACTIVE_SCANNING;
                    Serial.println("Station 1: Shift starting... - " + employeeName);
                } else {
                    // Cancel pressed or timeout - postpone
                    station1State = WAITING_FOR_CARD;
                    Serial.println("Station 1: Shift postponed - " + employeeName);
                }
            } else if (station1State == ACTIVE_SCANNING && station1Employee == employeeName) {
                // Request confirmation to end shift
                Serial.println("Station 1: " + employeeName + " requesting to end shift");
                station1State = WAITING_END_CONFIRMATION;
                
                // Wait for button press (OK to end, Cancel to continue)
                if (waitForButtonPress(1, 30000)) { // 30 second timeout
                    // OK pressed - end shift
                    station1Active = false;
                    station1Employee = "";
                    station1State = WAITING_FOR_CARD;
                    Serial.println("Station 1: Shift ended - " + employeeName);
                } else {
                    // Cancel pressed or timeout - continue working
                    station1State = ACTIVE_SCANNING;
                    Serial.println("Station 1: Shift ending denied - " + employeeName);
                }
            }
            break;
            
        case 2: // Station 2 - Employee 2
            if (station2State == WAITING_FOR_CARD && !station2Active) {
                // Request confirmation to start shift
                Serial.println("Station 2: " + employeeName + " requesting to start shift");
                station2State = WAITING_START_CONFIRMATION;
                displayStation2Message("Press OK to", "Start the Shift");
                
                // Wait for button press (OK to start, Cancel to postpone)
                if (waitForButtonPress(2, 30000)) { // 30 second timeout
                    // OK pressed - start shift
                    station2Active = true;
                    station2Employee = employeeName;
                    station2State = ACTIVE_SCANNING;
                    Serial.println("Station 2: Shift starting... - " + employeeName);
                    displayStation2Message("Shift starting...", employeeName);
                    delay(2000);
                    displayStation2Message("Station 2", "Ready to scan");
                } else {
                    // Cancel pressed or timeout - postpone
                    station2State = WAITING_FOR_CARD;
                    Serial.println("Station 2: Shift postponed - " + employeeName);
                    displayStation2Message("Postponed Shift!", "Scan again to start");
                    delay(3000);
                    displayStation2Message("Station 2", "Scan your card");
                }
            } else if (station2State == ACTIVE_SCANNING && station2Employee == employeeName) {
                // Request confirmation to end shift
                Serial.println("Station 2: " + employeeName + " requesting to end shift");
                station2State = WAITING_END_CONFIRMATION;
                displayStation2Message("Press OK to", "End the Shift");
                
                // Wait for button press (OK to end, Cancel to continue)
                if (waitForButtonPress(2, 30000)) { // 30 second timeout
                    // OK pressed - end shift
                    station2Active = false;
                    station2Employee = "";
                    station2State = WAITING_FOR_CARD;
                    Serial.println("Station 2: Shift ended - " + employeeName);
                    displayStation2Message("Shift Ending...", employeeName);
                    delay(2000);
                    displayStation2Message("Station 2", "Scan your card");
                } else {
                    // Cancel pressed or timeout - continue working
                    station2State = ACTIVE_SCANNING;
                    Serial.println("Station 2: Shift ending denied - " + employeeName);
                    displayStation2Message("Denied ending!", "Back to Tag scanning");
                    delay(3000);
                    displayStation2Message("Station 2", "Ready to scan");
                }
            }
            break;
            
        case 3: // QC Station - QC Employee
            if (qcState == WAITING_FOR_CARD && !qcActive) {
                // Request confirmation to start shift
                Serial.println("QC Station: " + employeeName + " requesting to start shift");
                qcState = WAITING_START_CONFIRMATION;
                displayQCMessage("Press OK to", "Start the Shift", "", "");
                
                // Wait for button press (OK to start, Cancel to postpone)
                if (waitForButtonPress(3, 30000)) { // 30 second timeout
                    // OK pressed - start shift
                    qcActive = true;
                    qcEmployee = employeeName;
                    qcState = ACTIVE_SCANNING;
                    Serial.println("QC Station: Shift starting... - " + employeeName);
                    displayQCMessage("QC Station", "Shift starting...", employeeName, "Ready to scan");
                    delay(2000);
                    displayQCMessage("QC Station", "Ready to scan", "", "");
                } else {
                    // Cancel pressed or timeout - postpone
                    qcState = WAITING_FOR_CARD;
                    Serial.println("QC Station: Shift postponed - " + employeeName);
                    displayQCMessage("Postponed Shift!", "Scan again to start", "", "");
                    delay(3000);
                    displayQCMessage("QC Station", "Scan your card", "", "");
                }
            } else if (qcState == ACTIVE_SCANNING && qcEmployee == employeeName) {
                // Request confirmation to end shift
                Serial.println("QC Station: " + employeeName + " requesting to end shift");
                qcState = WAITING_END_CONFIRMATION;
                displayQCMessage("Press OK to", "End the Shift", "", "");
                
                // Wait for button press (OK to end, Cancel to continue)
                if (waitForButtonPress(3, 30000)) { // 30 second timeout
                    // OK pressed - end shift
                    qcActive = false;
                    qcEmployee = "";
                    qcState = WAITING_FOR_CARD;
                    Serial.println("QC Station: Shift ended - " + employeeName);
                    displayQCMessage("QC Station", "Shift Ending...", employeeName, "");
                    delay(2000);
                    displayQCMessage("QC Station", "Scan your card", "", "");
                } else {
                    // Cancel pressed or timeout - continue working
                    qcState = ACTIVE_SCANNING;
                    Serial.println("QC Station: Shift ending denied - " + employeeName);
                    displayQCMessage("Denied ending!", "Back to Tag scanning", "", "");
                    delay(3000);
                    displayQCMessage("QC Station", "Ready to scan", "", "");
                }
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

// Initialize both LCD displays
void initLCDs() {
    Wire.begin();
    
    // Initialize Station 2 LCD (1602A)
    lcdStation2.init();
    lcdStation2.backlight();
    lcdStation2.setCursor(0, 0);
    lcdStation2.print("Station 2 LCD");
    lcdStation2.setCursor(0, 1);
    lcdStation2.print("Ready");
    
    // Initialize QC LCD (1604A)
    lcdQC.init();
    lcdQC.backlight();
    lcdQC.setCursor(0, 0);
    lcdQC.print("QC Station LCD");
    lcdQC.setCursor(0, 1);
    lcdQC.print("Ready");
    
    delay(2000);
    
    // Clear and show initial state
    displayStation2Message("Station 2", "Scan your card");
    displayQCMessage("QC Station", "Scan your card", "", "");
}

// Initialize button pins with internal pull-up resistors
void initButtons() {
    for (int i = 0; i < 3; i++) {
        pinMode(BUTTON_PINS[i].ok, INPUT_PULLUP);
        pinMode(BUTTON_PINS[i].cancel, INPUT_PULLUP);
    }
}

// Check if OK button is pressed (LOW when pressed due to pull-up)
bool isOKPressed(uint8_t stationNumber) {
    if (stationNumber < 1 || stationNumber > 3) return false;
    return digitalRead(BUTTON_PINS[stationNumber - 1].ok) == LOW;
}

// Check if Cancel button is pressed (LOW when pressed due to pull-up)
bool isCancelPressed(uint8_t stationNumber) {
    if (stationNumber < 1 || stationNumber > 3) return false;
    return digitalRead(BUTTON_PINS[stationNumber - 1].cancel) == LOW;
}

// Wait for button to be released (for debouncing)
void waitForButtonRelease(uint8_t stationNumber) {
    if (stationNumber < 1 || stationNumber > 3) return;
    
    while (digitalRead(BUTTON_PINS[stationNumber - 1].ok) == LOW || 
           digitalRead(BUTTON_PINS[stationNumber - 1].cancel) == LOW) {
        delay(50);
    }
    delay(100); // Additional debounce delay
}

// Wait for button press with timeout, returns true if OK pressed, false if Cancel or timeout
bool waitForButtonPress(uint8_t stationNumber, unsigned long timeoutMs) {
    if (stationNumber < 1 || stationNumber > 3) return false;
    
    unsigned long startTime = millis();
    
    while (millis() - startTime < timeoutMs) {
        if (isOKPressed(stationNumber)) {
            waitForButtonRelease(stationNumber);
            return true;
        }
        if (isCancelPressed(stationNumber)) {
            waitForButtonRelease(stationNumber);
            return false;
        }
        delay(50); // Small delay to prevent tight loop
    }
    
    return false; // Timeout - treat as cancel
}

// Update Station 2 LCD with latest RFID UID and scan count
void updateStation2Display(const char* uid, uint32_t scanCount) {
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
    lcdStation2.clear();
    lcdStation2.setCursor(0, 0);
    lcdStation2.print(line1);
    lcdStation2.setCursor(0, 1);
    lcdStation2.print(line2);
}

// Update QC LCD with latest RFID UID and scan count
void updateQCDisplay(const char* uid, uint32_t scanCount) {
    char line1[17];
    char line2[17];
    char line3[17];
    
    // Format UID for display (truncate if too long)
    if (strlen(uid) <= 13) {
        snprintf(line1, sizeof(line1), "QC: %s", uid);
    } else {
        // Show first 11 chars if longer (accounting for "QC: " prefix)
        char truncatedUid[12];
        strncpy(truncatedUid, uid, 11);
        truncatedUid[11] = '\0';
        snprintf(line1, sizeof(line1), "QC: %s..", truncatedUid);
    }
    
    // Format scan count and timestamp
    snprintf(line2, sizeof(line2), "Count: %lu", scanCount);
    
    // Get current time if available
    struct tm timeinfo;
    if (getLocalTime(&timeinfo)) {
        strftime(line3, sizeof(line3), "%H:%M:%S", &timeinfo);
    } else {
        snprintf(line3, sizeof(line3), "Time: N/A");
    }
    
    // Update display
    lcdQC.clear();
    lcdQC.setCursor(0, 0);
    lcdQC.print(line1);
    lcdQC.setCursor(0, 1);
    lcdQC.print(line2);
    lcdQC.setCursor(0, 2);
    lcdQC.print(line3);
    lcdQC.setCursor(0, 3);
    lcdQC.print("QC Active");
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
            
            // Show shift states
            const char* stateNames[] = {"WAITING_CARD", "WAIT_START_CONF", "ACTIVE_SCAN", "WAIT_END_CONF"};
            Serial.printf("Shift States - S1: %s | S2: %s | QC: %s\n",
                         stateNames[station1State], stateNames[station2State], stateNames[qcState]);
            
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
    ShiftState currentState;
    
    switch(stationNumber) {
        case 1:
            stationActive = station1Active;
            stationName = "Station 1";
            stationCounter = &station1ScanCount;
            currentState = station1State;
            break;
        case 2:
            stationActive = station2Active;
            stationName = "Station 2";
            stationCounter = &station2ScanCount;
            currentState = station2State;
            break;
        case 3:
            stationActive = qcActive;
            stationName = "QC Station";
            stationCounter = &qcScanCount;
            currentState = qcState;
            break;
    }
    
    if (!stationActive || currentState != ACTIVE_SCANNING) {
        String message = stationName + " is not active - First scan your card";
        Serial.println(message);
        
        // Display message on LCD for Station 2
        if (stationNumber == 2) {
            displayStation2Message("First scan", "your card");
            delay(2000); // Show message for 2 seconds
            displayStation2Message("Station 2", "Scan your card");
        }
        // Display message on LCD for QC Station
        else if (stationNumber == 3) {
            displayQCMessage("First scan", "your card", "", "");
            delay(2000); // Show message for 2 seconds
            displayQCMessage("QC Station", "Scan your card", "", "");
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
        
        // Update LCD display for Station 2 and QC scans
        if (stationNumber == 2) {
            updateStation2Display(uidString.c_str(), station2ScanCount);
        } else if (stationNumber == 3) {
            updateQCDisplay(uidString.c_str(), qcScanCount);
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
                // Update display for respective stations
                if (stationNumber == 2) {
                    updateStation2Display(uidString.c_str(), station2ScanCount);
                } else if (stationNumber == 3) {
                    updateQCDisplay(uidString.c_str(), qcScanCount);
                }
                Serial.println("Core 1 - New scan added after removing oldest");
                return true;
            }
        }
        
        // Show error on appropriate display
        if (stationNumber == 2) {
            updateStation2Display("Queue Error", station2ScanCount);
        } else if (stationNumber == 3) {
            updateQCDisplay("Queue Error", qcScanCount);
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
    Serial.print("Configuring RFID scanner SS pins... ");
    for (int i = 0; i < 3; i++) {
        pinMode(SCANNER_SS_PINS[i], OUTPUT);
        digitalWrite(SCANNER_SS_PINS[i], HIGH);
    }
    Serial.println("<> Done!");
    
    // Initialize button pins
    Serial.print("Configuring button pins... ");
    initButtons();
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
    
    // Initialize LCD displays
    Serial.print("Initializing LCD displays... ");
    initLCDs();
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
    Serial.println("> Use OK/Cancel buttons to confirm shift start/end");
    Serial.println("> LCD will show Station 2 and QC scans");
    
    // Main RFID scanning loop - optimized for maximum speed
    while (true) {
        // Check each reader in sequence - Optimized for Core 1 performance
        for (int i = 0; i < 3; i++) {
            // Set current reader's SS pin LOW, others HIGH
            for (int j = 0; j < 3; j++) {
                digitalWrite(SCANNER_SS_PINS[j], j == i ? LOW : HIGH);
            }
            delayMicroseconds(10000);  // 10ms delay in microseconds for precision
            
            // Use the optimized scanCard function
            scanCard(readers[i], i + 1);  // Station numbers are 1-based
            
            digitalWrite(SCANNER_SS_PINS[i], HIGH);
            delayMicroseconds(50000);  // 50ms delay between readers for stability
        }
        
        // Minimal task delay to prevent watchdog issues while maintaining speed
        vTaskDelay(pdMS_TO_TICKS(1)); // 1ms delay
    }
}

void loop() {
    delay(1000); // Prevent tight loop
}