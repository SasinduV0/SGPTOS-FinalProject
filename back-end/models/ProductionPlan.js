const mongoose = require("mongoose");

const ProductionPlanSchema = new mongoose.Schema({
  product: { type: String, required: true, unique: true },
  totalStock: { type: Number, required: true },
  finishedUnits: { type: Number, default: 0 },
  remainingUnits: { type: Number, default: function() { return this.totalStock - this.finishedUnits; } },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  remainingDays: { type: Number },
  dailyTarget: { type: Number },
  weeklyTarget: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model("ProductionPlan", ProductionPlanSchema);
