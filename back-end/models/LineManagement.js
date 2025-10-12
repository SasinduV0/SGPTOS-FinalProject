const mongoose = require("mongoose");

const LineManagementSchema = new mongoose.Schema({
  superviorID: { type: String, required: true, unique: true },

  // Name as input field (allows any name)
  name: { 
    type: String, 
    required: true 
  },

  unit: { type: String, enum: ["Unit A", "Unit B", "Unit C"], required: true },
  
  // Multiple line selection
  lineNo: { 
    type: [String],                 
    enum: ["Line 01", "Line 02", "Line 03", "Line 04","Line 05", "Line 06", "Line 07", "Line 08"], 
    required: true 
  },

  position: { type: String, required: true },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  startedDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model("LineManagement", LineManagementSchema);
