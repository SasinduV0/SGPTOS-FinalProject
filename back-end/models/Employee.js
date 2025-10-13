const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        unique: true,  // Ensures no duplicate employee IDs
        trim: true
    },
    name: String,
    line: Number,
    pcs: Number,   // pieces produced
}, {
    // Enable timestamps for tracking document changes
    timestamps: true
});

module.exports = mongoose.model("Employee", EmployeeSchema);