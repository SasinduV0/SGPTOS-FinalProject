const mongoose = require("mongoose");

const defectSchema = new mongoose.Schema({
  sewingDefect: { type: Boolean, default: false },
  coloringDefect: { type: Boolean, default: false },
  cuttingDefect: { type: Boolean, default: false },
  default: { type: String, default: "none" },
});

const iotDataSchema = new mongoose.Schema({
  userRFID: { type: String, required: true },
  garmentRFID: { type: String, required: true },
  stationRFID: { type: String, required: true },
  time: { type: Date, default: Date.now },
  defects: { type: defectSchema, required: true },
});

module.exports = mongoose.model("IOTData", iotDataSchema);
