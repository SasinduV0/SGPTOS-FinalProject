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
  Station_Number: {
    type: Number,
    required: true,
    min: 0,
    max: 99, // Two digits (0-99) for new format
    index: true // For station number queries
  },
  Line_Number: {
    type: Number,
    required: true,
    index: true // For faster line-based queries
  },
  Employee_ID: {
    type: String,
    index: true, // For employee-based scan count queries
    default: null // Will be populated from Station assignment
  },
  Time_Stamp: { 
    type: Number, 
    required: true,
    index: true // For time-based queries
  }
});

// Individual defect entry schema for use within garment defects array
const defectEntrySchema = new mongoose.Schema({
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
  }
}, { 
  _id: false // Don't create separate IDs for defect entries
});

// Garment Defects Schema - stores multiple defects per garment UID
const garmentDefectsSchema = new mongoose.Schema({
  ID: { 
    type: String, 
    required: true, 
    unique: true,
    index: true,
    maxlength: 20 // First defect scan ID, never updated
  },
  Tag_UID: { 
    type: String, 
    required: true,
    unique: true, // One document per garment UID
    index: true,
    maxlength: 20
  },
  Station_ID: { 
    type: String, 
    required: true,
    maxlength: 10
  },
  Defects: {
    type: [defectEntrySchema],
    required: true,
    validate: {
      validator: function(defects) {
        // Ensure no duplicate section-subtype combinations
        const combinations = new Set();
        for (const defect of defects) {
          const combo = `${defect.Section}-${defect.Subtype}`;
          if (combinations.has(combo)) {
            return false; // Duplicate found
          }
          combinations.add(combo);
        }
        return true;
      },
      message: 'Duplicate section-subtype combination not allowed'
    }
  },
  Time_Stamp: { 
    type: Number, 
    required: true,
    index: true // Updated whenever a new defect is added
  }
}, {
  versionKey: false // Remove __v field for memory efficiency
});

const RFIDTagScan = mongoose.model("RFIDTagScan", rfidTagScanSchema);
const GarmentDefects = mongoose.model("GarmentDefects", garmentDefectsSchema);

module.exports = { RFIDTagScan, GarmentDefects };
