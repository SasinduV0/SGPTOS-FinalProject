const mongoose = require("mongoose");

/*
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
*/

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

/*
const iotDataSchema = new mongoose.Schema({

  ID: { 
    type: String, 
    required: true },

  tagUID:{
    type: String,
    required:true
  },

  stationID: { 
    type: String, 
    required: true },
    
  timeStamp: { 
    type: Date, 
    default: Date.now },

});

const stationSchema =  new mongoose.Schema({
  
})
*/

//const IOTData = mongoose.model("IOTData", iotDataSchema);
const RFIDTagScan = mongoose.model("RFIDTagScan", rfidTagScanSchema);

module.exports = { RFIDTagScan };
