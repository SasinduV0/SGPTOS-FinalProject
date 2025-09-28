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
const char* wifi_ip = "192.168.64.159";

// WebSocket server configuration
const char* websocket_server = wifi_ip; // Wi-fi Server IP
const int websocket_port = 8000;
const char* websocket_path = "/rfid-ws";

// HTTP API server configuration  
const char* http_server = wifi_ip; // Same IP as WebSocket server
const int http_port = 8001; // Express server port for API endpoints

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

// Duplicate scan prevention - stores last scanned UID for normal employee stations
String lastScannedUID_Station1 = "";
String lastScannedUID_Station2 = "";
// Note: QC station (Station 3) doesn't have duplicate prevention

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

// Dynamic QC Defect Configuration - loaded from database
struct DefectSubtype {
  uint8_t code;
  String name;
  
  DefectSubtype() : code(0), name("") {}
  DefectSubtype(uint8_t c, const char* n) : code(c), name(n) {}
};

struct DefectType {
  uint8_t code;
  String name;
  DefectSubtype* subtypes;
  int subtypeCount;
  
  DefectType() : code(0), name(""), subtypes(nullptr), subtypeCount(0) {}
  DefectType(uint8_t c, const char* n) : code(c), name(n), subtypes(nullptr), subtypeCount(0) {}
};

struct DefectSection {
  uint8_t code;
  String name;
  
  DefectSection() : code(0), name("") {}
  DefectSection(uint8_t c, const char* n) : code(c), name(n) {}
};

// Dynamic defect configuration variables
DefectSection* qcSections = nullptr;
int qcSectionsCount = 0;

DefectType* qcTypes = nullptr;
int qcTypesCount = 0;

String defectDefinitionsVersion = "";
bool defectDefinitionsLoaded = false;

// Flag to track if defect definitions have been successfully updated from database
// This prevents continuous database checking after first successful update
bool defect_def_updated = false;

// QC Parts selection variables (updated to use dynamic data)
volatile int qcSelectedPart = 0;
volatile int qcScrollOffset = 0;
volatile bool qcInPartsSelection = false;

// QC Selection state management
enum QCSelectionStep {
    QC_SELECT_SECTION,
    QC_SELECT_TYPE,
    QC_SELECT_SUBTYPE
};

volatile QCSelectionStep qcCurrentStep = QC_SELECT_SECTION;
volatile int qcSelectedType = 0;
volatile int qcSelectedSubtype = 0;
volatile int qcTypeScrollOffset = 0;
volatile int qcSubtypeScrollOffset = 0;

// Dynamic numeric conversion functions for defect schema
uint8_t getSectionCode(int sectionIndex) {
    if (!defectDefinitionsLoaded || sectionIndex < 0 || sectionIndex >= qcSectionsCount) {
        return 0; // Default to first section
    }
    return qcSections[sectionIndex].code;
}

uint8_t getTypeCode(int typeIndex) {
    if (!defectDefinitionsLoaded || typeIndex < 0 || typeIndex >= qcTypesCount) {
        return 0; // Default to first type
    }
    return qcTypes[typeIndex].code;
}

uint8_t getSubtypeCode(int typeIndex, int subtypeIndex) {
    if (!defectDefinitionsLoaded || typeIndex < 0 || typeIndex >= qcTypesCount) {
        return 0; // Default
    }
    
    DefectType& type = qcTypes[typeIndex];
    if (subtypeIndex < 0 || subtypeIndex >= type.subtypeCount) {
        return 0; // Default
    }
    
    return type.subtypes[subtypeIndex].code;
}

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

// Defect definitions refresh variables
unsigned long lastDefectDefinitionsSync = 0;
const unsigned long DEFECT_DEFINITIONS_RETRY_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

// WiFi and time synchronization status flags
volatile bool wifiConnected = false;
volatile bool timeInitialized = false;

// Forward declarations for FreeRTOS tasks
void connectivityTask(void *parameter);
void rfidScanningTask(void *parameter);

// Forward declarations for defect definitions functions
bool fetchDefectDefinitions();
bool parseDefectDefinitions(JsonDocument& doc);
void cleanupDefectDefinitions();
void loadFallbackDefectDefinitions();

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

// Forward declarations for QC navigation functions
bool isQCUpPressed();
bool isQCDownPressed();
void waitForQCButtonRelease();
void displayQCPartsList();
bool handleQCPartsSelection();

// Volatile variables for ISR-safe power detection
volatile bool powerStateChanged = false;
volatile bool currentPowerState = false;
volatile bool previousPowerState = false;
// Forward declarations for power detection functions
void initPowerDetection();
void IRAM_ATTR powerDetectISR();

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
    {33, 25}   // QC Station - OK: 27, Cancel: 26
};

// QC Navigation button pins
const uint8_t QC_UP_BUTTON = 26;
const uint8_t QC_DOWN_BUTTON = 27;

// Buzzer pin
const uint8_t BUZZER_PIN = 15;

// Power detection pin
const uint8_t POWER_DETECT_PIN = 16;

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

// Check if defect definitions need to be refreshed (Core 0 task)
void checkDefectDefinitionsSync() {
    if (!wifiConnected) return;
    
    // Only check database if not already updated successfully since startup
    if (!defect_def_updated && (millis() - lastDefectDefinitionsSync >= DEFECT_DEFINITIONS_RETRY_INTERVAL)) {
        
        Serial.println("Attempting to refresh defect definitions from server...");
        if (fetchDefectDefinitions()) {
            Serial.println("Successfully updated defect definitions from server!");
            defect_def_updated = true; // Set flag to prevent further automatic checks
        } else {
            Serial.println("Failed to refresh defect definitions, keeping fallback data");
        }
        lastDefectDefinitionsSync = millis();
    }
}

// Fetch defect definitions from server (Core 0 task)
bool fetchDefectDefinitions() {
    if (!wifiConnected) {
        Serial.println("WiFi not connected, cannot fetch defect definitions");
        return false;
    }

    Serial.println("Fetching defect definitions from server...");
    Serial.printf("Connecting to: %s:%d\n", http_server, http_port);
    
    // Create HTTP client
    WiFiClient client;
    
    if (!client.connect(http_server, http_port)) {
        Serial.printf("!! Failed to connect to HTTP server %s:%d for defect definitions\n", http_server, http_port);
        Serial.println("Check if:");
        Serial.println("1. Backend server is running on port 8001");
        Serial.println("2. IP address is correct: " + String(http_server));
        Serial.println("3. Server is accessible from ESP32 network");
        return false;
    }

    Serial.println("Connected to server, sending HTTP request...");
    
    // Send HTTP GET request
    String request = "GET /api/defect-definitions/esp32 HTTP/1.1\r\n";
    request += "Host: " + String(http_server) + ":" + String(http_port) + "\r\n";
    request += "Connection: close\r\n\r\n";
    
    Serial.println("HTTP Request:");
    Serial.println(request);
    
    client.print(request);

    // Wait for response
    Serial.println("Waiting for server response...");
    unsigned long timeout = millis() + 10000; // 10 second timeout
    while (client.available() == 0) {
        if (millis() > timeout) {
            Serial.println("!! Timeout waiting for defect definitions response (10 seconds)");
            Serial.println("!! Server may be down or not responding");
            client.stop();
            return false;
        }
        delay(10);
    }

    Serial.println("Receiving response from server...");
    
    // Read response
    String response = "";
    String fullResponse = "";
    bool headersEnded = false;
    int statusCode = 0;
    
    while (client.available()) {
        String line = client.readStringUntil('\n');
        fullResponse += line + "\n";
        
        if (!headersEnded) {
            // Check HTTP status code
            if (line.startsWith("HTTP/1.1 ") && statusCode == 0) {
                statusCode = line.substring(9, 12).toInt();
                Serial.println("HTTP Status Code: " + String(statusCode));
            }
            
            if (line == "\r") {
                headersEnded = true;
                Serial.println("Headers received, reading body...");
            }
        } else {
            response += line;
        }
    }
    
    client.stop();
    
    Serial.println("Full HTTP Response:");
    Serial.println("==================");
    Serial.println(fullResponse.substring(0, 500) + "..."); // Print first 500 chars
    Serial.println("==================");

    if (statusCode != 200) {
        Serial.printf("!! HTTP Error: Status code %d\n", statusCode);
        Serial.println("!! Expected 200 OK, but got error response");
        return false;
    }

    if (response.length() == 0) {
        Serial.println("!! Empty response body from defect definitions endpoint");
        Serial.println("!! Check if the endpoint /api/iot/defect-definitions/esp32 exists");
        return false;
    }

    Serial.println("Response body received:");
    Serial.println(response.substring(0, 300) + "..."); // Print first 300 chars

    // Parse JSON response
    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, response);

    if (error) {
        Serial.print("Failed to parse defect definitions JSON: ");
        Serial.println(error.c_str());
        return false;
    }

    return parseDefectDefinitions(doc);
}

// Parse and store defect definitions (Core 0 task)
bool parseDefectDefinitions(JsonDocument& doc) {
    Serial.println("Parsing defect definitions...");

    // Check if we got an error response
    if (doc["error"].is<const char*>()) {
        Serial.println("Server returned error: " + String(doc["error"].as<const char*>()));
        
        // Try to use fallback data if provided
        if (doc["fallback"].is<JsonObject>()) {
            Serial.println("Using fallback defect definitions");
            doc = doc["fallback"];
        } else {
            return false;
        }
    }
    
    // Check if this is a valid defect definitions response
    if (!doc["sections"].is<JsonArray>() || !doc["types"].is<JsonArray>()) {
        Serial.println("!! Invalid defect definitions format - missing sections or types");
        Serial.println("!! Received: " + doc.as<String>());
        Serial.println("!! Using fallback defect definitions");
        return false; // This will trigger fallback in fetchDefectDefinitions
    }

    // Free existing memory
    cleanupDefectDefinitions();

    // Parse version
    if (doc["version"].is<const char*>()) {
        defectDefinitionsVersion = doc["version"].as<String>();
    }

    // Parse sections
    JsonArray sectionsArray = doc["sections"];
    qcSectionsCount = sectionsArray.size();
    
    if (qcSectionsCount > 0) {
        qcSections = new DefectSection[qcSectionsCount];
        
        for (int i = 0; i < qcSectionsCount; i++) {
            qcSections[i].code = sectionsArray[i]["code"];
            qcSections[i].name = sectionsArray[i]["name"].as<String>();
        }
        
        Serial.printf("Loaded %d sections\n", qcSectionsCount);
    }

    // Parse types and subtypes
    JsonArray typesArray = doc["types"];
    qcTypesCount = typesArray.size();
    
    if (qcTypesCount > 0) {
        qcTypes = new DefectType[qcTypesCount];
        
        for (int i = 0; i < qcTypesCount; i++) {
            qcTypes[i].code = typesArray[i]["code"];
            qcTypes[i].name = typesArray[i]["name"].as<String>();
            
            // Parse subtypes for this type
            JsonArray subtypesArray = typesArray[i]["subtypes"];
            qcTypes[i].subtypeCount = subtypesArray.size();
            
            if (qcTypes[i].subtypeCount > 0) {
                qcTypes[i].subtypes = new DefectSubtype[qcTypes[i].subtypeCount];
                
                for (int j = 0; j < qcTypes[i].subtypeCount; j++) {
                    qcTypes[i].subtypes[j].code = subtypesArray[j]["code"];
                    qcTypes[i].subtypes[j].name = subtypesArray[j]["name"].as<String>();
                }
            } else {
                qcTypes[i].subtypes = nullptr;
            }
            
            Serial.printf("Type %d (%s) has %d subtypes\n", 
                         qcTypes[i].code, qcTypes[i].name.c_str(), qcTypes[i].subtypeCount);
        }
        
        Serial.printf("Loaded %d types\n", qcTypesCount);
    }

    defectDefinitionsLoaded = true;
    Serial.println("Defect definitions loaded successfully!");
    Serial.println("Version: " + defectDefinitionsVersion);
    
    return true;
}

// Clean up dynamically allocated defect definitions memory
void cleanupDefectDefinitions() {
    if (qcSections) {
        delete[] qcSections;
        qcSections = nullptr;
    }
    
    if (qcTypes) {
        for (int i = 0; i < qcTypesCount; i++) {
            if (qcTypes[i].subtypes) {
                delete[] qcTypes[i].subtypes;
            }
        }
        delete[] qcTypes;
        qcTypes = nullptr;
    }
    
    qcSectionsCount = 0;
    qcTypesCount = 0;
    defectDefinitionsLoaded = false;
}

// Load fallback defect definitions (hardcoded)
void loadFallbackDefectDefinitions() {
    Serial.println("Loading fallback defect definitions...");
    
    // Clean up any existing data
    cleanupDefectDefinitions();
    
    // Create sections
    qcSectionsCount = 4;
    qcSections = new DefectSection[qcSectionsCount];
    
    qcSections[0] = DefectSection(0, "Body");
    qcSections[1] = DefectSection(1, "Hand");
    qcSections[2] = DefectSection(2, "Collar");
    qcSections[3] = DefectSection(3, "Upper Back");
    
    // Create types with subtypes
    qcTypesCount = 4;
    qcTypes = new DefectType[qcTypesCount];
    
    // Fabric type (4 subtypes)
    qcTypes[0] = DefectType(0, "Fabric");
    qcTypes[0].subtypeCount = 4;
    qcTypes[0].subtypes = new DefectSubtype[4];
    qcTypes[0].subtypes[0] = DefectSubtype(0, "Hole");
    qcTypes[0].subtypes[1] = DefectSubtype(1, "Stain");
    qcTypes[0].subtypes[2] = DefectSubtype(2, "Shading");
    qcTypes[0].subtypes[3] = DefectSubtype(3, "Slub");
    
    // Stitching type (4 subtypes)
    qcTypes[1] = DefectType(1, "Stitching");
    qcTypes[1].subtypeCount = 4;
    qcTypes[1].subtypes = new DefectSubtype[4];
    qcTypes[1].subtypes[0] = DefectSubtype(4, "Skipped");
    qcTypes[1].subtypes[1] = DefectSubtype(5, "Broken");
    qcTypes[1].subtypes[2] = DefectSubtype(6, "Uneven");
    qcTypes[1].subtypes[3] = DefectSubtype(7, "Loose");
    
    // Sewing type (5 subtypes)
    qcTypes[2] = DefectType(2, "Sewing");
    qcTypes[2].subtypeCount = 5;
    qcTypes[2].subtypes = new DefectSubtype[5];
    qcTypes[2].subtypes[0] = DefectSubtype(8, "Pluckering");
    qcTypes[2].subtypes[1] = DefectSubtype(9, "Misalignment");
    qcTypes[2].subtypes[2] = DefectSubtype(10, "Open_seam");
    qcTypes[2].subtypes[3] = DefectSubtype(11, "Backtak");
    qcTypes[2].subtypes[4] = DefectSubtype(12, "Seam_gap");
    
    // Other type (3 subtypes)
    qcTypes[3] = DefectType(3, "Other");
    qcTypes[3].subtypeCount = 3;
    qcTypes[3].subtypes = new DefectSubtype[3];
    qcTypes[3].subtypes[0] = DefectSubtype(13, "Measurement");
    qcTypes[3].subtypes[1] = DefectSubtype(14, "Button/Button_hole");
    qcTypes[3].subtypes[2] = DefectSubtype(15, "Twisted");
    
    defectDefinitionsLoaded = true;
    defectDefinitionsVersion = "Fallback v1.0";
    
    Serial.println("Fallback defect definitions loaded successfully!");
    Serial.printf("Loaded %d sections, %d types\n", qcSectionsCount, qcTypesCount);
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
            vTaskDelay(pdMS_TO_TICKS(2500)); // Use vTaskDelay instead of delay()
            displayStation2Message("Station 2", "Scan your card");
        }
        // Display message on LCD for QC Station
        else if (stationNumber == 3) {
            displayQCMessage("Wrong Station!", "Go to " + assignedStationName, "Access Denied", "");
            vTaskDelay(pdMS_TO_TICKS(2500)); // Use vTaskDelay instead of delay()
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
                    lastScannedUID_Station1 = ""; // Reset duplicate prevention for new shift
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
                    lastScannedUID_Station1 = ""; // Reset duplicate prevention
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
                    lastScannedUID_Station2 = ""; // Reset duplicate prevention for new shift
                    Serial.println("Station 2: Shift starting... - " + employeeName);
                    displayStation2Message("Shift starting...", employeeName);
                    delay(1500); // Reduced from 2000ms for faster login
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
                    lastScannedUID_Station2 = ""; // Reset duplicate prevention
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
                    delay(1500); // Reduced from 2000ms for faster login
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
    
    delay(1500); // Reduced from 2000ms for faster startup
    
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
    
    // Initialize QC navigation buttons
    pinMode(QC_UP_BUTTON, INPUT_PULLUP);
    pinMode(QC_DOWN_BUTTON, INPUT_PULLUP);
    
    // Initialize buzzer pin
    pinMode(BUZZER_PIN, OUTPUT);
    digitalWrite(BUZZER_PIN, LOW); // Ensure buzzer is off initially
}

// Power detection interrupt service routine
void IRAM_ATTR powerDetectISR() {
    bool newState = digitalRead(POWER_DETECT_PIN);
    if (newState != currentPowerState) {
        previousPowerState = currentPowerState;
        currentPowerState = newState;
        powerStateChanged = true;
    }
}

// Initialize power detection with interrupt
void initPowerDetection() {
    // Configure GPIO 16 as input with pull-down resistor
    pinMode(POWER_DETECT_PIN, INPUT_PULLDOWN);
    // Attach interrupt for both rising and falling edges
    attachInterrupt(digitalPinToInterrupt(POWER_DETECT_PIN), powerDetectISR, CHANGE);
    // Initialize both current and previous state
    currentPowerState = digitalRead(POWER_DETECT_PIN);
    previousPowerState = currentPowerState;
    Serial.print("Initial power state: ");
    Serial.println(currentPowerState ? "Available" : "Out");
}

// Buzzer beep function
void beepBuzzer(int duration = 200) {
    digitalWrite(BUZZER_PIN, HIGH);
    vTaskDelay(pdMS_TO_TICKS(duration)); // Use vTaskDelay instead of delay()
    digitalWrite(BUZZER_PIN, LOW);
}

// Double beep function for consecutive scan notification
void doubleBeepBuzzer() {
    digitalWrite(BUZZER_PIN, HIGH);
    vTaskDelay(pdMS_TO_TICKS(50)); // 50ms beep
    digitalWrite(BUZZER_PIN, LOW);
    vTaskDelay(pdMS_TO_TICKS(50)); // 50ms pause
    digitalWrite(BUZZER_PIN, HIGH);
    vTaskDelay(pdMS_TO_TICKS(50)); // 50ms beep
    digitalWrite(BUZZER_PIN, LOW);
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
        vTaskDelay(pdMS_TO_TICKS(50)); // Use vTaskDelay instead of delay()
    }
    vTaskDelay(pdMS_TO_TICKS(100)); // Use vTaskDelay for additional debounce delay
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
        vTaskDelay(pdMS_TO_TICKS(50)); // Use vTaskDelay instead of delay()
    }
    
    return false; // Timeout - treat as cancel
}

// Check if QC Up button is pressed
bool isQCUpPressed() {
    return digitalRead(QC_UP_BUTTON) == LOW;
}

// Check if QC Down button is pressed
bool isQCDownPressed() {
    return digitalRead(QC_DOWN_BUTTON) == LOW;
}

// Wait for QC navigation buttons to be released
void waitForQCButtonRelease() {
    while (digitalRead(QC_UP_BUTTON) == LOW || digitalRead(QC_DOWN_BUTTON) == LOW) {
        vTaskDelay(pdMS_TO_TICKS(50)); // Use vTaskDelay instead of delay()
    }
    vTaskDelay(pdMS_TO_TICKS(100)); // Use vTaskDelay for additional debounce delay
}

// Display QC parts selection list
void displayQCPartsList() {
    if (!defectDefinitionsLoaded || qcSectionsCount == 0) {
        lcdQC.clear();
        lcdQC.setCursor(0, 0);
        lcdQC.print("No defect data");
        lcdQC.setCursor(0, 1);
        lcdQC.print("Check connection");
        return;
    }

    lcdQC.clear();
    
    // First line: Title at index 3
    lcdQC.setCursor(3, 0);
    lcdQC.print("-SECTION-");
    
    // Display 3 items starting from scroll offset
    for (int i = 0; i < 3; i++) {
        int partIndex = qcScrollOffset + i;
        if (partIndex < qcSectionsCount) {
            int row = i + 1;
            
            // Selected item indented by 1 space, others at index 0
            if (partIndex == qcSelectedPart) {
                lcdQC.setCursor(1, row); // Selected item at index 1
                lcdQC.print(qcSections[partIndex].name);
            } else {
                lcdQC.setCursor(0, row); // Non-selected items at index 0
                lcdQC.print(qcSections[partIndex].name);
            }
        }
    }
}

// Display QC defect types selection list
void displayQCTypesList() {
    if (!defectDefinitionsLoaded || qcTypesCount == 0) {
        lcdQC.clear();
        lcdQC.setCursor(0, 0);
        lcdQC.print("No types data");
        lcdQC.setCursor(0, 1);
        lcdQC.print("Check connection");
        return;
    }

    lcdQC.clear();
    
    // First line: Title at index 2
    lcdQC.setCursor(2, 0);
    lcdQC.print("-DEFECT TYPES-");
    
    // Display 3 items starting from scroll offset
    for (int i = 0; i < 3; i++) {
        int typeIndex = qcTypeScrollOffset + i;
        if (typeIndex < qcTypesCount) {
            int row = i + 1;
            
            // Selected item indented by 1 space, others at index 0
            if (typeIndex == qcSelectedType) {
                lcdQC.setCursor(1, row); // Selected item at index 1
                lcdQC.print(qcTypes[typeIndex].name);
            } else {
                lcdQC.setCursor(0, row); // Non-selected items at index 0
                lcdQC.print(qcTypes[typeIndex].name);
            }
        }
    }
}

// Get subtypes array and count based on selected type (dynamic version)
bool getSubtypesForType(int typeIndex, DefectSubtype*& subtypes, int& count) {
    if (!defectDefinitionsLoaded || typeIndex < 0 || typeIndex >= qcTypesCount) {
        subtypes = nullptr;
        count = 0;
        return false;
    }
    
    subtypes = qcTypes[typeIndex].subtypes;
    count = qcTypes[typeIndex].subtypeCount;
    return true;
}

// Display QC defect subtypes selection list
void displayQCSubtypesList() {
    lcdQC.clear();
    
    // First line: Title at index 4
    lcdQC.setCursor(4, 0);
    lcdQC.print("-DEFECT-");
    
    // Get subtypes for selected type
    DefectSubtype* subtypes;
    int subtypesCount;
    if (!getSubtypesForType(qcSelectedType, subtypes, subtypesCount)) {
        lcdQC.setCursor(0, 1);
        lcdQC.print("No subtypes");
        return;
    }
    
    // Display 3 items starting from scroll offset
    for (int i = 0; i < 3; i++) {
        int subtypeIndex = qcSubtypeScrollOffset + i;
        if (subtypeIndex < subtypesCount) {
            int row = i + 1;
            
            // Selected item indented by 1 space, others at index 0
            if (subtypeIndex == qcSelectedSubtype) {
                lcdQC.setCursor(1, row); // Selected item at index 1
                lcdQC.print(subtypes[subtypeIndex].name);
            } else {
                lcdQC.setCursor(0, row); // Non-selected items at index 0
                lcdQC.print(subtypes[subtypeIndex].name);
            }
        }
    }
}

// Handle QC multi-step selection navigation: Section -> Type -> Subtype
// Returns true if complete selection confirmed, false if cancelled
bool handleQCPartsSelection() {
    qcInPartsSelection = true;
    qcCurrentStep = QC_SELECT_SECTION;
    
    // Reset all selections and scroll offsets
    qcSelectedPart = 0;
    qcSelectedType = 0;
    qcSelectedSubtype = 0;
    qcScrollOffset = 0;
    qcTypeScrollOffset = 0;
    qcSubtypeScrollOffset = 0;
    
    Serial.println("QC: Starting multi-step selection - Section -> Type -> Subtype");
    displayQCPartsList();
    
    unsigned long startTime = millis();
    const unsigned long selectionTimeout = 120000; // 2 minutes timeout for complete selection
    
    while (millis() - startTime < selectionTimeout) {
        // Handle navigation based on current step
        switch(qcCurrentStep) {
            case QC_SELECT_SECTION:
                // Navigation UP
                if (isQCUpPressed()) {
                    waitForQCButtonRelease();
                    qcSelectedPart--;
                    if (qcSelectedPart < 0) {
                        qcSelectedPart = qcSectionsCount - 1; // Wrap to bottom
                    }

                    // Adjust scroll offset if needed
                    if (qcSelectedPart < qcScrollOffset) {
                        qcScrollOffset = qcSelectedPart;
                    } else if (qcSelectedPart >= qcScrollOffset + 3) {
                        qcScrollOffset = qcSelectedPart - 2;
                    }

                    Serial.println("QC: Section UP - Selected: " + qcSections[qcSelectedPart].name);
                    displayQCPartsList();
                    startTime = millis(); // Reset timeout
                }
                
                // Navigation DOWN
                if (isQCDownPressed()) {
                    waitForQCButtonRelease();
                    qcSelectedPart++;
                    if (qcSelectedPart >= qcSectionsCount) {
                        qcSelectedPart = 0; // Wrap to top
                        qcScrollOffset = 0;
                    }

                    // Adjust scroll offset if needed
                    if (qcSelectedPart >= qcScrollOffset + 3) {
                        qcScrollOffset = qcSelectedPart - 2;
                    } else if (qcSelectedPart < qcScrollOffset) {
                        qcScrollOffset = qcSelectedPart;
                    }
                    
                    Serial.println("QC: Section DOWN - Selected: " + qcSections[qcSelectedPart].name);
                    displayQCPartsList();
                    startTime = millis(); // Reset timeout
                }
                
                // OK button - proceed to type selection
                if (isOKPressed(3)) {
                    waitForButtonRelease(3);
                    Serial.println("QC: Section confirmed - " + qcSections[qcSelectedPart].name + " -> Moving to Type selection");
                    qcCurrentStep = QC_SELECT_TYPE;
                    qcSelectedType = 0;
                    qcTypeScrollOffset = 0;
                    displayQCTypesList();
                    startTime = millis(); // Reset timeout
                }
                
                // Cancel button - exit selection
                if (isCancelPressed(3)) {
                    waitForButtonRelease(3);
                    Serial.println("QC: Section selection cancelled");
                    qcInPartsSelection = false;
                    return false;
                }
                break;
                
            case QC_SELECT_TYPE:
                // Navigation UP
                if (isQCUpPressed()) {
                    waitForQCButtonRelease();
                    qcSelectedType--;
                    if (qcSelectedType < 0) {
                        qcSelectedType = qcTypesCount - 1; // Wrap to bottom
                    }
                    
                    // Adjust scroll offset if needed
                    if (qcSelectedType < qcTypeScrollOffset) {
                        qcTypeScrollOffset = qcSelectedType;
                    } else if (qcSelectedType >= qcTypeScrollOffset + 3) {
                        qcTypeScrollOffset = qcSelectedType - 2;
                    }
                    
                    Serial.println("QC: Type UP - Selected: " + qcTypes[qcSelectedType].name);
                    displayQCTypesList();
                    startTime = millis(); // Reset timeout
                }
                
                // Navigation DOWN
                if (isQCDownPressed()) {
                    waitForQCButtonRelease();
                    qcSelectedType++;
                    if (qcSelectedType >= qcTypesCount) {
                        qcSelectedType = 0; // Wrap to top
                        qcTypeScrollOffset = 0;
                    }
                    
                    // Adjust scroll offset if needed
                    if (qcSelectedType >= qcTypeScrollOffset + 3) {
                        qcTypeScrollOffset = qcSelectedType - 2;
                    } else if (qcSelectedType < qcTypeScrollOffset) {
                        qcTypeScrollOffset = qcSelectedType;
                    }
                    
                    Serial.println("QC: Type DOWN - Selected: " + qcTypes[qcSelectedType].name);
                    displayQCTypesList();
                    startTime = millis(); // Reset timeout
                }
                
                // OK button - proceed to subtype selection
                if (isOKPressed(3)) {
                    waitForButtonRelease(3);
                    Serial.println("QC: Type confirmed - " + qcTypes[qcSelectedType].name + " -> Moving to Subtype selection");
                    qcCurrentStep = QC_SELECT_SUBTYPE;
                    qcSelectedSubtype = 0;
                    qcSubtypeScrollOffset = 0;
                    displayQCSubtypesList();
                    startTime = millis(); // Reset timeout
                }
                
                // Cancel button - go back to section selection
                if (isCancelPressed(3)) {
                    waitForButtonRelease(3);
                    Serial.println("QC: Type selection cancelled - Back to Section selection");
                    qcCurrentStep = QC_SELECT_SECTION;
                    displayQCPartsList();
                    startTime = millis(); // Reset timeout
                }
                break;
                
            case QC_SELECT_SUBTYPE:
                // Get subtypes count for current type
                DefectSubtype* subtypes;
                int subtypesCount;
                if (!getSubtypesForType(qcSelectedType, subtypes, subtypesCount)) {
                    // Handle error case
                    qcInPartsSelection = false;
                    return false;
                }
                
                // Navigation UP
                if (isQCUpPressed()) {
                    waitForQCButtonRelease();
                    qcSelectedSubtype--;
                    if (qcSelectedSubtype < 0) {
                        qcSelectedSubtype = subtypesCount - 1; // Wrap to bottom
                    }
                    
                    // Adjust scroll offset if needed
                    if (qcSelectedSubtype < qcSubtypeScrollOffset) {
                        qcSubtypeScrollOffset = qcSelectedSubtype;
                    } else if (qcSelectedSubtype >= qcSubtypeScrollOffset + 3) {
                        qcSubtypeScrollOffset = qcSelectedSubtype - 2;
                    }
                    
                    Serial.println("QC: Subtype UP - Selected: " + subtypes[qcSelectedSubtype].name);
                    displayQCSubtypesList();
                    startTime = millis(); // Reset timeout
                }
                
                // Navigation DOWN
                if (isQCDownPressed()) {
                    waitForQCButtonRelease();
                    qcSelectedSubtype++;
                    if (qcSelectedSubtype >= subtypesCount) {
                        qcSelectedSubtype = 0; // Wrap to top
                        qcSubtypeScrollOffset = 0;
                    }
                    
                    // Adjust scroll offset if needed
                    if (qcSelectedSubtype >= qcSubtypeScrollOffset + 3) {
                        qcSubtypeScrollOffset = qcSelectedSubtype - 2;
                    } else if (qcSelectedSubtype < qcSubtypeScrollOffset) {
                        qcSubtypeScrollOffset = qcSelectedSubtype;
                    }
                    
                    Serial.println("QC: Subtype DOWN - Selected: " + subtypes[qcSelectedSubtype].name);
                    displayQCSubtypesList();
                    startTime = millis(); // Reset timeout
                }
                
                // OK button - complete selection
                if (isOKPressed(3)) {
                    waitForButtonRelease(3);
                    Serial.println("QC: Complete selection confirmed!");
                    Serial.println("Section: " + qcSections[qcSelectedPart].name);
                    Serial.println("Type: " + qcTypes[qcSelectedType].name);
                    
                    // Get selected subtype name
                    DefectSubtype* subtypes;
                    int subtypesCount;
                    if (getSubtypesForType(qcSelectedType, subtypes, subtypesCount) && 
                        qcSelectedSubtype < subtypesCount) {
                        Serial.println("Subtype: " + subtypes[qcSelectedSubtype].name);
                    }
                    
                    qcInPartsSelection = false;
                    return true;
                }
                
                // Cancel button - go back to type selection
                if (isCancelPressed(3)) {
                    waitForButtonRelease(3);
                    Serial.println("QC: Subtype selection cancelled - Back to Type selection");
                    qcCurrentStep = QC_SELECT_TYPE;
                    displayQCTypesList();
                    startTime = millis(); // Reset timeout
                }
                break;
        }
        
        vTaskDelay(pdMS_TO_TICKS(50)); // Use vTaskDelay instead of delay()
    }
    
    // Timeout
    Serial.println("QC: Multi-step selection timeout");
    qcInPartsSelection = false;
    return false;
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

// Convert UID bytes to hex string with bounds checking
String uidToString(uint8_t* uid, uint8_t uidSize) {
    if (uid == nullptr || uidSize == 0 || uidSize > 10) {
        return "INVALID_UID"; // Safety check
    }
    
    String uidStr = "";
    uidStr.reserve(uidSize * 2); // Pre-allocate memory for efficiency
    
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

// Send Defect data via WebSocket
bool sendDefectDataViaWebSocket(String scanID, String tagUID, String stationID, time_t timestamp, 
                               uint8_t sectionCode, uint8_t typeCode, uint8_t subtypeCode) {
    if (!wsConnected) {
        Serial.println("!! WebSocket not connected, cannot send defect data");
        return false;
    }
    
    JsonDocument doc;
    doc["action"] = "defect_scan";
    doc["data"]["ID"] = scanID;
    doc["data"]["Section"] = sectionCode;
    doc["data"]["Type"] = typeCode;
    doc["data"]["Subtype"] = subtypeCode;
    doc["data"]["Tag_UID"] = tagUID;
    doc["data"]["Station_ID"] = stationID;
    doc["data"]["Time_Stamp"] = timestamp;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    Serial.println("Sending Defect via WebSocket: " + jsonString);
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
        
        // Attempt to update defect definitions from server (only once after startup)
        Serial.println("Attempting to update defect definitions from server...");
        if (fetchDefectDefinitions()) {
            Serial.println("Successfully updated defect definitions from server!");
            defect_def_updated = true; // Mark as updated to prevent further automatic checks
        } else {
            Serial.println("Failed to update from server, keeping fallback defect definitions");
        }
    } else {
        Serial.println("!! Skipping NTP, WebSocket, and database defect definitions due to WiFi failure");
        Serial.println("RFID scanning will work in OFFLINE mode with fallback defect definitions");
        Serial.println("Scans will be queued and sent when WiFi/WebSocket connection is restored");
    }
    
    // Signal that connectivity task is ready
    Serial.println("Core 0 connectivity task is ready!");
    
    // Main connectivity loop
    while (true) {
        // Check for serial commands for manual refresh
        if (Serial.available()) {
            String command = Serial.readStringUntil('\n');
            command.trim();
            
            if (command == "refresh" || command == "REFRESH") {
                Serial.println("\n>> Manual defect definitions refresh requested!");
                if (wifiConnected) {
                    if (fetchDefectDefinitions()) {
                        Serial.println(">> Manual refresh successful!");
                        defect_def_updated = true; // Update flag after successful manual refresh
                    } else {
                        Serial.println(">> Manual refresh failed!");
                    }
                } else {
                    Serial.println(">> WiFi not connected, cannot refresh");
                }
            } else if (command == "status" || command == "STATUS") {
                Serial.println("\n>> System Status:");
                Serial.printf("   WiFi: %s\n", wifiConnected ? "Connected" : "Disconnected");
                Serial.printf("   WebSocket: %s\n", wsConnected ? "Connected" : "Disconnected");
                Serial.printf("   Defect Definitions: %s\n", defectDefinitionsLoaded ? "Loaded" : "Not loaded");
                Serial.printf("   Database Updated: %s\n", defect_def_updated ? "Yes" : "No");
                Serial.printf("   Version: %s\n", defectDefinitionsVersion.c_str());
                Serial.printf("   Sections: %d, Types: %d\n", qcSectionsCount, qcTypesCount);
                Serial.println("   Commands: 'refresh' to update defects, 'status' for info");
            }
        }
        
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
            
            // Check for defect definitions refresh
            checkDefectDefinitionsSync();
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
            Serial.printf("Core 0 - Queue: %d/%d | WiFi: %s | WebSocket: %s | DefDB: %s | Total: %lu (S1:%lu S2:%lu QC:%lu)\n", 
                         queueCount, QUEUE_SIZE,
                         wifiConnected ? "OK" : "Not-OK",
                         wsConnected ? "OK" : "Not-OK",
                         defect_def_updated ? "Updated" : "Fallback",
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
        // Beep for employee card scan
        beepBuzzer(200); // 200ms beep for employee cards (reduced from 300ms)
        // Handle employee login/logout
        handleEmployeeAccess(uidString, stationNumber);
        return false; // Don't queue employee cards
    }
    
    // Beep immediately for product card detection (instant feedback)
    beepBuzzer(100); // 100ms beep for immediate scan confirmation
    
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
            vTaskDelay(pdMS_TO_TICKS(1500)); // Use vTaskDelay instead of delay()
            displayStation2Message("Station 2", "Scan your card");
        }
        // Display message on LCD for QC Station
        else if (stationNumber == 3) {
            displayQCMessage("First scan", "your card", "", "");
            vTaskDelay(pdMS_TO_TICKS(1500)); // Use vTaskDelay instead of delay()
            displayQCMessage("QC Station", "Scan your card", "", "");
        }
        return false;
    }
    
    // Check for consecutive duplicate scans for normal employee stations only (Station 1 & 2)
    // This check happens AFTER station is confirmed to be active
    if (stationNumber == 1 || stationNumber == 2) {
        String* lastScannedUID = (stationNumber == 1) ? &lastScannedUID_Station1 : &lastScannedUID_Station2;
        
        if (*lastScannedUID == uidString) {
            // Consecutive duplicate scan detected - double beep and reject
            doubleBeepBuzzer();
            
            Serial.println(stationName + " - Consecutive duplicate scan rejected: " + uidString);
            
            // Display message on Station 2 LCD
            if (stationNumber == 2) {
                displayStation2Message("Already scanned", "Try different tag");
                vTaskDelay(pdMS_TO_TICKS(1500)); // Show message for 1.5 seconds
                // Restore the count display instead of "Ready to scan"
                updateStation2Display(uidString.c_str(), station2ScanCount);
            }
            
            return false; // Don't process consecutive duplicates
        }
        
        // Update last scanned UID for this station
        *lastScannedUID = uidString;
    }
    // Note: QC station (stationNumber == 3) has no duplicate prevention
    
    // Special handling for QC Station - show parts selection
    if (stationNumber == 3) {
        Serial.println("QC: Product tag scanned - " + uidString);
        displayQCMessage("Product scanned!", "UID: " + uidString.substring(0, 12), "Select section", "Use UP/DOWN + OK");
        vTaskDelay(pdMS_TO_TICKS(1000)); // Use vTaskDelay instead of delay()
        
        // Show multi-step selection and wait for user choice
        bool selectionConfirmed = handleQCPartsSelection();
        
        if (!selectionConfirmed) {
            // User cancelled or timeout
            displayQCMessage("Selection", "Cancelled", "Scan next product", "");
            vTaskDelay(pdMS_TO_TICKS(1500)); // Use vTaskDelay instead of delay()
            displayQCMessage("QC Station", "Ready to scan", "", "");
            return false;
        }
        
        // Get selected subtype name for display
        DefectSubtype* subtypes;
        int subtypesCount;
        String selectedSubtype = "";
        if (getSubtypesForType(qcSelectedType, subtypes, subtypesCount) && 
            qcSelectedSubtype < subtypesCount) {
            selectedSubtype = subtypes[qcSelectedSubtype].name;
        }
        
        // User confirmed complete selection - process as defect
        Serial.println("QC: Processing defect scan with complete selection:");
        Serial.println("  Section: " + qcSections[qcSelectedPart].name);
        Serial.println("  Type: " + qcTypes[qcSelectedType].name); 
        Serial.println("  Subtype: " + selectedSubtype);
        
        displayQCMessage("Processing...", "Sec:" + qcSections[qcSelectedPart].name, "Typ:" + qcTypes[qcSelectedType].name, "Sub:" + selectedSubtype.substring(0, 12));
        vTaskDelay(pdMS_TO_TICKS(1500)); // Use vTaskDelay instead of delay()
        
        // Generate scan ID and get timestamp
        String scanID = generateScanID();
        String stationID = generateStationID(stationNumber);
        time_t now = 0;
        if (timeInitialized) {
            time(&now);
        }
        
        // Convert selections to numeric codes
        uint8_t sectionCode = getSectionCode(qcSelectedPart);
        uint8_t typeCode = getTypeCode(qcSelectedType);
        uint8_t subtypeCode = getSubtypeCode(qcSelectedType, qcSelectedSubtype);
        
        // Send defect data immediately if connected
        if (wsConnected) {
            bool defectSent = sendDefectDataViaWebSocket(scanID, uidString, stationID, now, 
                                                        sectionCode, typeCode, subtypeCode);
            if (defectSent) {
                qcScanCount++; // Increment QC scan counter
                updateQCDisplay(uidString.c_str(), qcScanCount);
                Serial.println("QC: Defect data sent successfully - ID: " + scanID);
                
                // Beep for successful defect scan
                beepBuzzer(100); // 100ms beep for successful defect (reduced from 150ms)
                
                // Show success message
                displayQCMessage("Defect Logged!", "ID: " + scanID, "Scan next product", "");
                delay(2000); // Reduced from 3000ms for faster next scan
                displayQCMessage("QC Station", "Ready to scan", "", "");
                return true;
            } else {
                Serial.println("QC: Failed to send defect data");
                displayQCMessage("Send Failed!", "Try again", "", "");
                delay(2000);
                displayQCMessage("QC Station", "Ready to scan", "", "");
                return false;
            }
        } else {
            // If not connected, show offline message
            Serial.println("QC: Offline - Defect data will be queued when connection restored");
            displayQCMessage("Offline Mode", "Data will sync", "when connected", "");
            delay(3000);
            displayQCMessage("QC Station", "Ready to scan", "", "");
            return false;
        }
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
    
    // Initialize power detection
    Serial.print("Configuring power detection on GPIO 16... ");
    initPowerDetection();
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
    
    // Load fallback defect definitions immediately for offline QC functionality
    Serial.print("Loading fallback defect definitions... ");
    loadFallbackDefectDefinitions();
    Serial.println("<> Done! QC station ready for offline operation!");
    
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
    // Handle power state change detected in ISR
    if (powerStateChanged) {
        powerStateChanged = false; // Reset the flag immediately
        // Check if this is a rising edge (power became available)
        if (currentPowerState && !previousPowerState) {
            Serial.println("Power available");
        }
        // Check if this is a falling edge (power went out)
        else if (!currentPowerState && previousPowerState) {
            Serial.println("Power out");
        }
    }
    delay(1000); // Prevent tight loop
}