const mongoose = require("mongoose");

const defectSchema = new mongoose.Schema({
  sewingDefect: { 
    type: Boolean, 
    default: false },

  coloringDefect: { 
    type: Boolean, 
    default: false },

  cuttingDefect: { 
    type: Boolean, 
    default: false },

  default: { type: String, default: "none" },
});

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

module.exports = mongoose.model("IOTData", iotDataSchema);
