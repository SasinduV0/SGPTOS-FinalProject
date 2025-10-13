# ESP32 RFID Scanner System - Serial Monitor Commands

This document describes all available serial monitor commands and the automatic status information provided by the ESP32 RFID scanner system.

## Manual Commands

### `refresh` or `REFRESH`
**Purpose:** Manually refresh defect definitions from the database server

**Usage:** Type `refresh` or `REFRESH` in the serial monitor and press Enter

**What it does:**
- Forces an immediate attempt to fetch latest defect definitions from the backend server
- Updates the `defect_def_updated` flag if successful
- Only works when WiFi is connected

**Responses:**
- `>> Manual defect definitions refresh requested!`
- `>> Manual refresh successful!` (if update successful)
- `>> Manual refresh failed!` (if server not reachable or error occurred)
- `>> WiFi not connected, cannot refresh` (if WiFi offline)

---

### `status` or `STATUS`
**Purpose:** Display comprehensive system status information

**Usage:** Type `status` or `STATUS` in the serial monitor and press Enter

**What it displays:**
- **WiFi:** Connection status (Connected/Disconnected)
- **WebSocket:** Connection status (Connected/Disconnected)  
- **Defect Definitions:** Whether loaded (Loaded/Not loaded)
- **Database Updated:** Whether defect definitions were updated from server (Yes/No)
- **Version:** Current defect definitions version (e.g., "Fallback v1.0" or database version)
- **Sections:** Number of defect sections loaded
- **Types:** Number of defect types loaded
- **Commands:** Available commands reminder

**Example Output:**
```
>> System Status:
   WiFi: Connected
   WebSocket: Connected
   Defect Definitions: Loaded
   Database Updated: Yes
   Version: Database v2.1
   Sections: 4, Types: 4
   Commands: 'refresh' to update defects, 'status' for info
```

---

## Automatic Status Information

### Startup Messages
The system provides detailed startup information including:
- Hardware initialization status
- WiFi connection attempts and results
- NTP time synchronization status
- WebSocket connection status
- Defect definitions loading status
- Task creation confirmation

### Periodic Status Updates (Every 30 seconds)
**Format:** `Core 0 - Queue: [count]/[max] | WiFi: [status] | WebSocket: [status] | DefDB: [status] | Total: [total_scans] (S1:[station1] S2:[station2] QC:[qc])`

**Example:** `Core 0 - Queue: 5/100 | WiFi: OK | WebSocket: OK | DefDB: Updated | Total: 147 (S1:52 S2:48 QC:47)`

**Includes:**
- **Queue:** Current/Maximum queue capacity
- **WiFi:** Connection status (OK/Not-OK)
- **WebSocket:** Connection status (OK/Not-OK)
- **DefDB:** Defect database status (Updated/Fallback)
- **Total:** Total scans across all stations
- **Individual Counters:** Scans per station (S1, S2, QC)

### Station Status Updates
**Format:** `Station Status - S1: [status] | S2: [status] | QC: [status]`

**Example:** `Station Status - S1: ACTIVE (Employee_1) | S2: INACTIVE | QC: ACTIVE (QC_Employee)`

**Shows:**
- Station activity status (ACTIVE/INACTIVE)
- Employee logged into each active station

### Shift State Information
**Format:** `Shift States - S1: [state] | S2: [state] | QC: [state]`

**States:**
- `WAITING_CARD` - Waiting for employee card scan
- `WAIT_START_CONF` - Waiting for start shift confirmation (OK button)
- `ACTIVE_SCAN` - Actively scanning products
- `WAIT_END_CONF` - Waiting for end shift confirmation

### RFID Scan Messages
**Product Scans:** `Core 1 - Card queued - Station X (StationID), ID: ScanID, UID: CardUID, Time: DateTime`

**Employee Access:** Messages about employee login/logout, shift confirmations, and station assignments

### Error and Warning Messages
- **Queue Warnings:** When queue reaches 80% capacity
- **Connection Errors:** WiFi, WebSocket, or HTTP server connection issues
- **Hardware Errors:** RFID reader or LCD initialization problems
- **Authentication Errors:** Wrong station access attempts

---

## Network Configuration Information

### WiFi Settings
- **SSID:** Redmi Note 9 Pro
- **Server IP:** 192.168.64.159
- **WebSocket Port:** 8000 (Path: /rfid-ws)
- **HTTP API Port:** 8001

### Station Configuration
- **Station 1:** Employee 1 (UID: F5A628A1)
- **Station 2:** Employee 2 (UID: E5B79BA1) - Has LCD display
- **QC Station:** QC Employee (UID: E9EB3903) - Has LCD display and defect selection

---

## Monitoring Tips

1. **Use `status` command** to quickly check system health
2. **Watch periodic updates** to monitor queue levels and connection status
3. **Use `refresh` command** if defect definitions need updating during operation
4. **Monitor queue warnings** - if queue reaches 80%+, check network connectivity
5. **Check employee access messages** to verify proper station assignments
6. **Watch for duplicate scan warnings** on Station 1 and 2 (QC allows duplicates)

---

## Common Status Indicators

### ✅ Normal Operation
```
Core 0 - Queue: 2/100 | WiFi: OK | WebSocket: OK | DefDB: Updated | Total: 234
Station Status - S1: ACTIVE (Employee_1) | S2: ACTIVE (Employee_2) | QC: ACTIVE (QC_Employee)
```

### ⚠️ Offline Mode
```
Core 0 - Queue: 45/100 | WiFi: Not-OK | WebSocket: Not-OK | DefDB: Fallback | Total: 156
Station Status - S1: ACTIVE (Employee_1) | S2: INACTIVE | QC: ACTIVE (QC_Employee)
```

### 🔄 Startup Phase
```
Station Status - S1: INACTIVE | S2: INACTIVE | QC: INACTIVE
Shift States - S1: WAITING_CARD | S2: WAITING_CARD | QC: WAITING_CARD
```
