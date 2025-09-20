const mongoose = require("mongoose");

const LineReallocationSchema = new mongoose.Schema({
  EmployeeID: { type: String, required: true, unique: true },

  // Name as input field (allows any name)
  name: { 
    type: String, 
    required: true 
  },

  unit: { 
    type: String, 
    enum: ["Unit A", "Unit B", "Unit C"], 
    required: true 
  },
  
  // Multiple line selection (current allocation)
  lineNo: { 
    type: [String],                 
    enum: [
      "Line 01", "Line 02", "Line 03", "Line 04", 
      "Line 05", "Line 06", "Line 07", "Line 08"
    ], 
    required: true 
  },

  // New line allocation (only if reallocated → optional field)
  newLineNo: { 
    type: [String],                 
    enum: [
      "Line 01", "Line 02", "Line 03", "Line 04", 
      "Line 05", "Line 06", "Line 07", "Line 08"
    ], 
    default: []   // keep empty if no reallocation
  },

  status: { 
    type: String, 
    enum: ["Active", "Inactive"], 
    default: "Active" 
  },

  startedDate: { 
    type: Date, 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model("LineReallocation", LineReallocationSchema);
