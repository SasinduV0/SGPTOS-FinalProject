const mongoose = require("mongoose"); // ✅ CommonJS require

const LineManagementSchema = new mongoose.Schema({
  employeeNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  unit: { type: String, enum: ["Unit A", "Unit B", "Unit C"], required: true },
  lineNo: { type: String, enum: ["Line 01", "Line 02", "Line 03", "Line 04"], required: true },
  position: { type: String, required: true },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  startedDate: { type: Date, required: true }
}, { timestamps: true });

// ❌ remove "export default"
// ✅ use module.exports
module.exports = mongoose.model("LineManagement", LineManagementSchema);
