const mongoose = require("mongoose");

// RFID Tag Scan Schema for ESP32 WebSocket
const rfidTagScanSchema = new mongoose.Schema({
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
  }
});

// Memory-efficient Defect Schema using numeric codes
const defectSchema = new mongoose.Schema({
  ID: { 
    type: String, 
    required: true, 
    unique: true,
    index: true,
    maxlength: 20
  },
  Section: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 3 // 0=Body, 1=Hand, 2=Collar, 3=Upper Back
  },
  Type: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 3 // 0=Fabric, 1=Stitching, 2=Sewing, 3=Other
  },
  Subtype: { 
    type: Number, 
    required: true,
    min: 0,
    max: 15 // 0-3=Fabric, 4-7=Stitching, 8-12=Sewing, 13-15=Other
  },
  Tag_UID: { 
    type: String, 
    required: true,
    index: true,
    maxlength: 20
  },
  Station_ID: { 
    type: String, 
    required: true,
    maxlength: 10
  },
  Time_Stamp: { 
    type: Number, 
    required: true,
    index: true
  }
}, {
  versionKey: false // Remove __v field for memory efficiency
});

const RFIDTagScan = mongoose.model("RFIDTagScan", rfidTagScanSchema);
const Defect = mongoose.model("Defect", defectSchema);

module.exports = { RFIDTagScan, Defect };
