const mongoose = require("mongoose");

const defectSchema = new mongoose.Schema({
  sewingDefect: { 
    type: Boolean, 
    default: false 
  },
  coloringDefect: { 
    type: Boolean, 
    default: false 
  },
  cuttingDefect: { 
    type: Boolean, 
    default: false 
  },
  default: { type: String, default: "none" },
});

// RFID Scan Schema for ESP32 WebSocket
const rfidScanSchema = new mongoose.Schema({
  ID: { 
    type: String, 
    required: true, 
    unique: true,
    index: true // For faster queries
  },
  Tag_UID: { 
    type: String, 
    required: true,
    index: true // For faster UID searches
  },
  Station_ID: { 
    type: String, 
    required: true 
  },
  Time_Stamp: { 
    type: Number, 
    required: true,
    index: true // For time-based queries
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const iotDataSchema = new mongoose.Schema({
  ID: { 
    type: String, 
    required: true 
  },
  tagUID: {
    type: String,
    required: true
  },
  stationID: { 
    type: String, 
    required: true 
  },
  timeStamp: { 
    type: Date, 
    default: Date.now 
  },
});

const stationSchema = new mongoose.Schema({
  stationID: {
    type: String,
    required: true,
    unique: true
  },
  stationName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const RFIDScan = mongoose.model("RFIDScan", rfidScanSchema);
const IOTData = mongoose.model("IOTData", iotDataSchema);
const Station = mongoose.model("Station", stationSchema);

module.exports = { RFIDScan, IOTData, Station };
