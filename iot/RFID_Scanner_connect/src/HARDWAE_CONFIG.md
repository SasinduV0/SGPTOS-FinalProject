# Hardware Connection & Pinout Guide for RFID Scanning System

This document provides the detailed hardware connections for the ESP32-based multi-station RFID scanning system.

## 1. Core Components
- **Microcontroller:** 1x ESP32 DevKit V1
- **RFID Readers:** 3x MFRC522 RFID Scanner Modules
- **Displays:**
  - 1x LCD 16x02 Display with I2C Module
  - 1x LCD 16x04 Display with I2C Module
- **Buttons:** 8x Push Buttons (for OK, Cancel, and Navigation)
- **Resistors:** 2x 4.7kΩ (for I2C pull-up)
- **Buzzer:** 1x Active or Passive Buzzer
- **Power Supply:** 3.3V and 5V power source
- **Ancillaries:** Breadboard, Connecting Wires

---

## 2. Pin Configuration Details

### I2C Bus (Shared for both LCDs)
The I2C bus is used for communication with the LCD displays. Pull-up resistors are required for stable operation.

| ESP32 Pin | Connection        | Notes                               |
|-----------|-------------------|-------------------------------------|
| **GPIO 22** | **SCL** (Both LCDs) | Requires a 4.7kΩ pull-up to 3.3V    |
| **GPIO 21** | **SDA** (Both LCDs) | Requires a 4.7kΩ pull-up to 3.3V    |

### SPI Bus (Shared for all RFID Readers)
The SPI bus is shared by all three MFRC522 modules. Each module is selected using its unique Slave Select (SS) pin.

| ESP32 Pin | Connection          |
|-----------|---------------------|
| **GPIO 18** | **SCK** (All RC522s)  |
| **GPIO 23** | **MOSI** (All RC522s) |
| **GPIO 19** | **MISO** (All RC522s) |

### Peripherals and Station Mapping

#### Station 1 (Employee Scan-In)
- **Display:** None
- **RFID Reader:** MFRC522 #1

| ESP32 Pin | Connection          | Purpose                     |
|-----------|---------------------|-----------------------------|
| **GPIO 5**  | RC522 #1 **SDA (SS)** | Selects the RFID reader     |
| **GPIO 32** | Button **OK**         | Confirm shift start/end     |
| **GPIO 34** | Button **Cancel**     | Cancel operation            |

#### Station 2 (Employee Scan-In)
- **Display:** 16x02 LCD (I2C Address: `0x27`)
- **RFID Reader:** MFRC522 #2

| ESP32 Pin | Connection          | Purpose                     |
|-----------|---------------------|-----------------------------|
| **GPIO 4**  | RC522 #2 **SDA (SS)** | Selects the RFID reader     |
| **GPIO 13** | Button **OK**         | Confirm shift start/end     |
| **GPIO 14** | Button **Cancel**     | Cancel operation            |

#### Station 3 (QC Defect Entry)
- **Display:** 16x04 LCD (I2C Address: `0x26`)
- **RFID Reader:** MFRC522 #3

| ESP32 Pin | Connection          | Purpose                     |
|-----------|---------------------|-----------------------------|
| **GPIO 2**  | RC522 #3 **SDA (SS)** | Selects the RFID reader     |
| **GPIO 33** | Button **OK**         | Confirm defect selection    |
| **GPIO 25** | Button **Cancel**     | Cancel defect selection     |
| **GPIO 26** | Button **Up**         | Navigate menus up           |
| **GPIO 27** | Button **Down**       | Navigate menus down         |

#### System-Wide Peripherals

| ESP32 Pin | Connection    | Purpose                                     |
|-----------|---------------|---------------------------------------------|
| **GPIO 15** | **Buzzer**    | Provides audible feedback for scans/errors  |
| **GPIO 16** | **Power Sense** | **(Available)** For detecting battery vs. mains power |

---

## 3. Important Setup & Wiring Notes

1.  **Power Connections:**
    - All modules must share a **common ground (GND)**.
    - The **ESP32** is powered by a **5V** supply connected to the `VIN` pin.
    - The **RC522 modules** and **I2C pull-up resistors** are powered by the **3.3V** output from the ESP32's `3V3` pin.
    - The **LCDs** can be powered by **5V**.

2.  **Button Wiring:**
    - The code configures the button pins with an internal pull-up resistor (`INPUT_PULLUP`).
    - Wire each button to connect its assigned GPIO pin to **GND** when pressed. No external resistors are needed for the buttons.

3.  **RFID Reader Setup:**
    - The **RST (Reset)** and **IRQ (Interrupt)** pins on the MFRC522 modules are **not used** in this project's code. They can be left disconnected.
    - Keep the SPI bus wires (SCK, MOSI, MISO) as short as possible to minimize signal interference.

4.  **I2C LCD Setup:**
    - Ensure the I2C addresses of your LCD modules are set to `0x27` (for the 16x02) and `0x26` (for the 16x04). These can usually be changed via jumpers or by soldering pads on the I2C backpack.
    - The 4.7kΩ pull-up resistors on the SDA and SCL lines are critical for reliable communication. Some modules have them built-in, but it's best to add them externally if you face issues.

5.  **Safety First:**
    - Always double-check all wiring connections before applying power.
    - Verify you are connecting components to the correct voltage (3.3V vs. 5V) to prevent damage.

6.  **LCD Library Modification (16x4 Display):**
    - The `LiquidCrystal_I2C` library in this project has been **modified** to work correctly with the specific 16x04 LCD module used.
    - If you experience issues with the 16x04 display (e.g., text appearing on the wrong lines), you may need to adjust the `row_offsets` in the library file: `lib\LiquidCrystal_I2C\LiquidCrystal_I2C.cpp`.
    - For this project, the `setCursor` function was updated with the following line:
      `int row_offsets[] = { 0x00, 0x40, 0x10, 0x50 };`