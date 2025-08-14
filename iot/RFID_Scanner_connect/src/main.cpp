#include <SPI.h>
#include <MFRC522.h>

// RFID Scanner 1
#define SS_PIN_1 5   // SDA
#define RST_PIN_1 27
#define IRQ_PIN_1 26

// RFID Scanner 2
#define SS_PIN_2 4   // SDA
#define RST_PIN_2 32
#define IRQ_PIN_2 33

// RFID Scanner 3
#define SS_PIN_3 2   // SDA
#define RST_PIN_3 34
#define IRQ_PIN_3 35

// Shared SPI pins on ESP32
#define SCK_PIN 18
#define MOSI_PIN 23
#define MISO_PIN 19

// Create instances
MFRC522 rfid1(SS_PIN_1, RST_PIN_1);
MFRC522 rfid2(SS_PIN_2, RST_PIN_2);
MFRC522 rfid3(SS_PIN_3, RST_PIN_3);

// Global flags
volatile bool card_ready_1 = false;
volatile bool card_ready_2 = false;
volatile bool card_ready_3 = false;

// ISR handlers
void IRAM_ATTR isr1() {
    card_ready_1 = true;
}

void IRAM_ATTR isr2() {
    card_ready_2 = true;
}

void IRAM_ATTR isr3() {
    card_ready_3 = true;
}

void initRFID(MFRC522& rfid) {
    rfid.PCD_Init();
    delay(50);
    
    rfid.PCD_Reset();
    delay(50);
    
    rfid.PCD_WriteRegister(MFRC522::TModeReg, 0x80);
    rfid.PCD_WriteRegister(MFRC522::TPrescalerReg, 0xA9);
    rfid.PCD_WriteRegister(MFRC522::TReloadRegH, 0x03);
    rfid.PCD_WriteRegister(MFRC522::TReloadRegL, 0xE8);
    
    rfid.PCD_WriteRegister(MFRC522::TxASKReg, 0x40);
    rfid.PCD_WriteRegister(MFRC522::ModeReg, 0x3D);
    
    byte value = rfid.PCD_ReadRegister(MFRC522::TxControlReg);
    if ((value & 0x03) != 0x03) {
        rfid.PCD_WriteRegister(MFRC522::TxControlReg, value | 0x03);
    }
    
    rfid.PCD_WriteRegister(MFRC522::RFCfgReg, 0x70);
    delay(50);
}

void setup() {
    Serial.begin(9600);
    delay(1000);
    
    Serial.println("\nStarting RFID Scanner Setup...");
    
    // Configure SPI pins
    pinMode(SS_PIN_1, OUTPUT);
    pinMode(SS_PIN_2, OUTPUT);
    pinMode(SS_PIN_3, OUTPUT);
    digitalWrite(SS_PIN_1, HIGH);
    digitalWrite(SS_PIN_2, HIGH);
    digitalWrite(SS_PIN_3, HIGH);
    
    SPI.begin(SCK_PIN, MISO_PIN, MOSI_PIN);
    SPI.setFrequency(100000);
    SPI.setDataMode(SPI_MODE0);
    SPI.setBitOrder(MSBFIRST);
    
    delay(100);
    
    // Initialize RFID readers
    Serial.println("Initializing Reader 1...");
    initRFID(rfid1);
    byte ver1 = rfid1.PCD_ReadRegister(MFRC522::VersionReg);
    Serial.print("Reader 1 Version: 0x"); Serial.println(ver1, HEX);
    
    Serial.println("Initializing Reader 2...");
    initRFID(rfid2);
    byte ver2 = rfid2.PCD_ReadRegister(MFRC522::VersionReg);
    Serial.print("Reader 2 Version: 0x"); Serial.println(ver2, HEX);
    
    Serial.println("Initializing Reader 3...");
    initRFID(rfid3);
    byte ver3 = rfid3.PCD_ReadRegister(MFRC522::VersionReg);
    Serial.print("Reader 3 Version: 0x"); Serial.println(ver3, HEX);
    
    // Configure interrupts
    pinMode(IRQ_PIN_1, INPUT_PULLUP);
    pinMode(IRQ_PIN_2, INPUT_PULLUP);
    pinMode(IRQ_PIN_3, INPUT_PULLUP);
    
    attachInterrupt(digitalPinToInterrupt(IRQ_PIN_1), isr1, FALLING);
    attachInterrupt(digitalPinToInterrupt(IRQ_PIN_2), isr2, FALLING);
    attachInterrupt(digitalPinToInterrupt(IRQ_PIN_3), isr3, FALLING);

    Serial.println("Setup complete!");
}

void loop() {
    // Check Reader 1
    digitalWrite(SS_PIN_1, LOW);
    digitalWrite(SS_PIN_2, HIGH);
    delay(10);
    
    if (rfid1.PICC_IsNewCardPresent() && rfid1.PICC_ReadCardSerial()) {
        Serial.print("\nCard detected on Reader 1 - UID: ");
        for (byte i = 0; i < rfid1.uid.size; i++) {
            Serial.print(rfid1.uid.uidByte[i] < 0x10 ? " 0" : " ");
            Serial.print(rfid1.uid.uidByte[i], HEX);
        }
        Serial.println();
        rfid1.PICC_HaltA();
        rfid1.PCD_StopCrypto1();
    }
    digitalWrite(SS_PIN_1, HIGH);
    
    delay(50);
    
    // Check Reader 2
    digitalWrite(SS_PIN_1, HIGH);
    digitalWrite(SS_PIN_2, LOW);
    delay(10);
    
    if (rfid2.PICC_IsNewCardPresent() && rfid2.PICC_ReadCardSerial()) {
        Serial.print("\nCard detected on Reader 2 - UID: ");
        for (byte i = 0; i < rfid2.uid.size; i++) {
            Serial.print(rfid2.uid.uidByte[i] < 0x10 ? " 0" : " ");
            Serial.print(rfid2.uid.uidByte[i], HEX);
        }
        Serial.println();
        rfid2.PICC_HaltA();
        rfid2.PCD_StopCrypto1();
    }
    digitalWrite(SS_PIN_2, HIGH);
    
    delay(50);
    
    // Check Reader 3
    digitalWrite(SS_PIN_1, HIGH);
    digitalWrite(SS_PIN_2, HIGH);
    digitalWrite(SS_PIN_3, LOW);
    delay(10);
    
    if (rfid3.PICC_IsNewCardPresent() && rfid3.PICC_ReadCardSerial()) {
        Serial.print("\nCard detected on Reader 3 - UID: ");
        for (byte i = 0; i < rfid3.uid.size; i++) {
            Serial.print(rfid3.uid.uidByte[i] < 0x10 ? " 0" : " ");
            Serial.print(rfid3.uid.uidByte[i], HEX);
        }
        Serial.println();
        rfid3.PICC_HaltA();
        rfid3.PCD_StopCrypto1();
    }
    digitalWrite(SS_PIN_3, HIGH);
    
    delay(50);
}