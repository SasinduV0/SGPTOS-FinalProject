const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
    name: String,
    line: Number,
    pcs: Number,   // pieces produced
}, {
    // Enable timestamps for tracking document changes
    timestamps: true
});

module.exports = mongoose.model("Employee", EmployeeSchema);