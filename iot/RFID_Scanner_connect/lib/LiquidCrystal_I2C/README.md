
# LiquidCrystal_I2C (Custom Project Version)

This is a custom version of the LiquidCrystal_I2C library for 16x4 LCDs with the HD44780 controller.

## Custom Change
- **Row Offset Fix for 16x4 LCDs:**
	- For displays with 4 rows, lines 2 and 3 (index 2 and 3) are now mapped to start at the true left edge (column 0), not column 4.
	- This fixes the classic 4-character offset bug on many 1604 LCDs.
	- The change is in the `setCursor()` function: for row 2 and 3, the column is automatically shifted 4 characters back.

## Usage
- Use as a drop-in replacement for the standard LiquidCrystal_I2C library.
- No code changes needed in your main project files.
- Place this library in your project's `lib/` folder to ensure your custom changes are used and not overwritten by PlatformIO.

## Why?
- PlatformIO will overwrite libraries in `.pio/libdeps` on update/clean.
- Libraries in `lib/` are project-specific and safe for custom edits.

---
**This version is for use with 16x4 LCDs that show a 4-character indent on lines 2 and 3.**
