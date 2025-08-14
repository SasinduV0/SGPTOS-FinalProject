#include <SPI.h>
#include <MFRC522.h>

// RFID Scanner 1
#define SS_PIN_1 5
#define RST_PIN_1 27
#define IRQ_PIN_1 26

// RFID Scanner 2
#define SS_PIN_2 4
#define RST_PIN_2 32
#define IRQ_PIN_2 33

// RFID Scanner 3
#define SS_PIN_3 2
#define RST_PIN_3 34
#define IRQ_PIN_3 35

// Shared SPI pins on ESP32
#define SCK_PIN 18
#define MOSI_PIN 23
#define MISO_PIN 19

MFRC522 rfid1(SS_PIN_1, RST_PIN_1);
MFRC522 rfid2(SS_PIN_2, RST_PIN_2);
MFRC522 rfid3(SS_PIN_3, RST_PIN_3);

// Global flags to signal an interrupt has occurred
volatile bool card_ready_1 = false;
volatile bool card_ready_2 = false;
volatile bool card_ready_3 = false;

// Interrupt Service Routines (ISRs)
void isr1() {
  card_ready_1 = true;
}

void isr2() {
  card_ready_2 = true;
}

void isr3() {
  card_ready_3 = true;
}

void setup() {
  Serial.begin(115200);
  SPI.begin(SCK_PIN, MISO_PIN, MOSI_PIN);

  // Initialize all three RFID scanners
  rfid1.PCD_Init();
  rfid2.PCD_Init();
  rfid3.PCD_Init();

  // Configure interrupts for each scanner
  pinMode(IRQ_PIN_1, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(IRQ_PIN_1), isr1, FALLING);
  pinMode(IRQ_PIN_2, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(IRQ_PIN_2), isr2, FALLING);
  pinMode(IRQ_PIN_3, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(IRQ_PIN_3), isr3, FALLING);

  // Enable the IRQ on all RC522 modules for card detection
  rfid1.PCD_SetRegisterBitMask(MFRC522::ComIEnReg, MFRC522::IRqInv_IRQEn | MFRC522::RxIEn_IRQEn);
  rfid2.PCD_SetRegisterBitMask(MFRC522::ComIEnReg, MFRC522::IRqInv_IRQEn | MFRC522::RxIEn_IRQEn);
  rfid3.PCD_SetRegisterBitMask(MFRC522::ComIEnReg, MFRC522::IRqInv_IRQEn | MFRC522::RxIEn_IRQEn);

  Serial.println("Place a card on any scanner...");
}

void loop() {
  // Check global flags set by the ISRs
  if (card_ready_1) {
    scanCard(rfid1, 1);
    card_ready_1 = false;
  }
  if (card_ready_2) {
    scanCard(rfid2, 2);
    card_ready_2 = false;
  }
  if (card_ready_3) {
    scanCard(rfid3, 3);
    card_ready_3 = false;
  }
}

void scanCard(MFRC522& rfid, int scanner_id) {
  // Check if a new card is present
  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    Serial.print("Card found by Scanner ");
    Serial.print(scanner_id);
    Serial.print(": ");

    // Print the UID
    for (byte i = 0; i < rfid.uid.size; i++) {
      Serial.print(rfid.uid.uidByte[i] < 0x10 ? " 0" : " ");
      Serial.print(rfid.uid.uidByte[i], HEX);
    }
    Serial.println();

    // Reset the IRQ on the RC522 module
    rfid.PCD_ClearRegisterBitMask(MFRC522::DivIrqReg, MFRC522::IRqInv_IRQEn | MFRC522::RxIEn_IRQEn);
    rfid.PCD_WriteRegister(MFRC522::ComIEnReg, 0x80);

    // Halt PICC
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
  }
}