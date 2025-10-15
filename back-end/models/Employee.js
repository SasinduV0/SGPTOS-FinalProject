/*const mongoose = require("mongoose");

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

module.exports = mongoose.model("Employee", EmployeeSchema);*/

const mongoose = require("mongoose");

// New Employee Schema with enhanced structure
const EmployeeSchema = new mongoose.Schema({
    ID: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true // For faster queries
    },
    Card_UID: {
        type: String,
        trim: true,
        default: null // Optional field for card assignment
    },
    Name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    Unit: {
        type: String,
        trim: true,
        uppercase: true, // Convert to uppercase automatically
        default: null // Optional field for unit assignment
    },
    Type: {
        type: String,
        required: true,
        enum: {
            values: ['SE', 'QC'],
            message: 'Type must be either "SE" (Sewing Employee) or "QC" (Quality Checker)'
        },
        uppercase: true // Convert to uppercase automatically
    },
    Assigned: {
        type: Boolean,
        required: true,
        default: false // Default to not assigned
    },
    Active: {
        type: Boolean,
        required: true,
        default: false // Default to not active
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
    versionKey: false, // Remove __v field for cleaner documents
    collection: 'employees' // Force collection name to be 'employees'
});

// Indexes for better query performance
EmployeeSchema.index({ Card_UID: 1 }, { sparse: true }); // Sparse index for optional Card_UID
EmployeeSchema.index({ Unit: 1, Type: 1 }); // Compound index for unit and type queries
EmployeeSchema.index({ Assigned: 1, Active: 1 }); // Compound index for status queries

// Pre-save middleware to ensure ID is uppercase
EmployeeSchema.pre('save', function(next) {
    if (this.ID) {
        this.ID = this.ID.toUpperCase();
    }
    next();
});

// Export the model (prevent OverwriteModelError)
module.exports = mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);

