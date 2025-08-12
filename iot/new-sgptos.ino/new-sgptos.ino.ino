#include <MFRC522v2.h>
#include <MFRC522DriverSPI.h>
#include <MFRC522DriverPinSimple.h>
#include <SPI.h>

// Pin Definitions
#define SS_1 5     // Station 1
#define SS_2 4     // Station 2
#define SS_3 2     // QC

// Create SS pin wrappers
MFRC522DriverPinSimple ssPin1(SS_1);
MFRC522DriverPinSimple ssPin2(SS_2);
MFRC522DriverPinSimple ssPin3(SS_3);

// Create SPI drivers for each reader
MFRC522DriverSPI driver1(ssPin1); // Only SS pin required
MFRC522DriverSPI driver2(ssPin2);
MFRC522DriverSPI driver3(ssPin3);

// Create reader instances
MFRC522 reader1(driver1);
MFRC522 reader2(driver2);
MFRC522 reader3(driver3);

void setup() {
  Serial.begin(115200);
  SPI.begin(); // Default SPI: SCK=18, MISO=19, MOSI=23

  reader1.PCD_Init();
  reader2.PCD_Init();
  reader3.PCD_Init();

  Serial.println("System Ready. Scan a tag at Station 1 or 2...");
}

void loop() {
  checkReader(reader1, "1");
  checkReader(reader2, "2");
  checkReader(reader3, "QC");
}

void checkReader(MFRC522 &reader, const char* station) {
  if (!reader.PICC_IsNewCardPresent()) return;
  if (!reader.PICC_ReadCardSerial()) return;

  Serial.print("Station: ");
  Serial.println(station);
  Serial.print("Tag UID: ");
  for (byte i = 0; i < reader.uid.size; i++) {
    Serial.printf("%02X ", reader.uid.uidByte[i]);
  }
  Serial.println("\n--------------------");

  reader.PICC_HaltA();  // Stop reading the same card
  delay(1000);          // Prevent flooding
}