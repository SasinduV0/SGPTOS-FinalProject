# Hardware Connection Setup Guide

## Components Required
1. ESP32 DevKit V1
2. 3x RC522 RFID Scanner Modules
3. 1x LCD 16x02 Display with I2C Module
4. 1x LCD 16x04 Display with I2C Module
5. 4.7kΩ pull-up resistors (2x)
6. 0.1µF ceramic capacitors (3x)
7. Connecting wires
8. Breadboard or PCB

## Pin Configuration

### SPI Bus (Shared between all RC522 modules)
```
ESP32 Pin | Connection
----------|------------
GPIO 23   | MOSI (All RC522s)
GPIO 19   | MISO (All RC522s)
GPIO 18   | SCK (All RC522s)
```

### RFID Scanners
```
Scanner 1 (with 16x02 LCD):
ESP32 Pin | RC522 Pin
----------|------------
GPIO 5    | SDA (SS)
GPIO 27   | RST
GPIO 26   | IRQ

Scanner 2 (with 16x04 LCD):
ESP32 Pin | RC522 Pin
----------|------------
GPIO 4    | SDA (SS)
GPIO 32   | RST
GPIO 33   | IRQ

Scanner 3 (No Display):
ESP32 Pin | RC522 Pin
----------|------------
GPIO 2    | SDA (SS)
GPIO 34   | RST
GPIO 35   | IRQ
```

### I2C Bus for LCDs
```
ESP32 Pin | Connection
----------|------------
GPIO 21   | SDA (Both LCDs)
GPIO 22   | SCL (Both LCDs)

LCD Configuration:
Type      | Address | Associated Scanner
----------|---------|-------------------
16x02 LCD | 0x27   | Scanner 1
16x04 LCD | 0x26   | Scanner 2
```

## Important Setup Notes

1. Power Connections:
   - Connect 3.3V and GND to all modules
   - Add 0.1µF bypass capacitor between VCC and GND for each RC522
   - Ensure stable power supply

2. I2C Setup:
   - Add 4.7kΩ pull-up resistors between:
     * 3.3V and SDA (GPIO 21)
     * 3.3V and SCL (GPIO 22)
   - Configure unique I2C addresses for each LCD

3. SPI Considerations:
   - Keep SPI wires short and organized
   - Only one RC522 will be active at a time
   - All RC522s share MOSI, MISO, and SCK lines

4. Safety Notes:
   - Double-check all connections before power-up
   - Verify voltage levels (3.3V)
   - Check for shorts before powering on

## Testing Steps

1. Individual Testing:
   - Test each LCD separately
   - Test each RC522 separately
   - Verify I2C addresses
   - Check interrupt pins

2. System Testing:
   - Test multiple card reads
   - Verify display updates
   - Check interrupt handling

## Troubleshooting Tips

1. Display Issues:
   - Verify I2C addresses
   - Check pull-up resistors
   - Test I2C connections

2. RFID Reader Issues:
   - Check SS pin connections
   - Verify SPI connections
   - Test power supply

3. System Issues:
   - Check for interference
   - Verify ground connections
   - Test timing of operations