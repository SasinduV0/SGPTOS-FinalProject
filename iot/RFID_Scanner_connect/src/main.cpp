#include <SPI.h>
#include <MFRC522.h>

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

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("\nStarting RFID Scanner Setup...");
    
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
        Serial.print("Initializing Reader "); Serial.println(i + 1);
        initRFID(readers[i]);
        byte ver = readers[i].PCD_ReadRegister(MFRC522::VersionReg);
        Serial.print("Version: 0x"); Serial.println(ver, HEX);
        delay(50);
    }
    
    Serial.println("Setup complete!");
}

void printUID(MFRC522& rfid, int readerNum) {
    Serial.print("Card on Reader ");
    Serial.print(readerNum + 1);
    Serial.print(" - UID:");
    for (byte i = 0; i < rfid.uid.size; i++) {
        Serial.print(rfid.uid.uidByte[i] < 0x10 ? " 0" : " ");
        Serial.print(rfid.uid.uidByte[i], HEX);
    }
    Serial.println();
}

void loop() {
    // Check each reader in sequence
    for (int i = 0; i < 3; i++) {
        // Set current reader's SS pin LOW, others HIGH
        for (int j = 0; j < 3; j++) {
            digitalWrite(SCANNER_PINS[j].ss, j == i ? LOW : HIGH);
        }
        delay(10);  // Allow SS to settle
        
        if (readers[i].PICC_IsNewCardPresent() && readers[i].PICC_ReadCardSerial()) {
            printUID(readers[i], i);
            readers[i].PICC_HaltA();
            readers[i].PCD_StopCrypto1();
        }
        
        digitalWrite(SCANNER_PINS[i].ss, HIGH);
        delay(50);  // Delay between readers
    }
}