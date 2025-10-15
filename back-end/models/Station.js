const mongoose = require("mongoose");

// Station Schema for production line management
const StationSchema = new mongoose.Schema({
    ID: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        index: true // For faster queries
    },
    Unit: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        index: true // For unit-based queries
    },
    Line: {
        type: Number,
        required: false,
        index: true // For line-based queries
    },
    Station_Number: {
        type: Number,
        required: true,
        min: 0,
        max: 9, // Single digit (0-9)
        index: true // For station number queries
    },
    Employee_ID: {
        type: String,
        trim: true,
        default: null // Optional field for employee assignment
    },
    Employee_Name: {
        type: String,
        trim: true,
        maxlength: 100,
        default: null // Optional field for employee name reference
    },
    Available: {
        type: Boolean,
        required: true,
        default: true, // Default to available for work
        index: true // For availability queries
    },
    Active: {
        type: Boolean,
        required: true,
        default: false, // Default to not active (no shift in progress)
        index: true // For activity status queries
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
    versionKey: false // Remove __v field for cleaner documents
});

// Compound indexes for better query performance
StationSchema.index({ Unit: 1, Line: 1 }); // Unit and Line combination
StationSchema.index({ Available: 1, Active: 1 }); // Status combination
StationSchema.index({ Employee_ID: 1 }, { sparse: true }); // Sparse index for optional Employee_ID

// Pre-save middleware to ensure consistent formatting
StationSchema.pre('save', function(next) {
    // Ensure ID and Unit are uppercase
    if (this.ID) {
        this.ID = this.ID.toUpperCase();
    }
    if (this.Unit) {
        this.Unit = this.Unit.toUpperCase();
    }
    if (this.Employee_ID) {
        this.Employee_ID = this.Employee_ID.toUpperCase();
    }
    
    // Auto-extract Unit and Line from ID if they're not set
    if (this.ID && !this.isModified('Unit') && !this.isModified('Line')) {
        const match = this.ID.match(/^([A-Z])(\d)/);
        if (match) {
            this.Unit = match[1];
            this.Line = parseInt(match[2]);
        }
    }
    
    // Auto-extract Station_Number from ID (last digit) if not set
    if (this.ID && !this.isModified('Station_Number')) {
        const match = this.ID.match(/(\d)$/);
        if (match) {
            this.Station_Number = parseInt(match[1]);
        }
    }
    
    next();
});

// Instance method to check if station is assigned to an employee
StationSchema.methods.isAssigned = function() {
    return Boolean(this.Employee_ID && this.Employee_Name);
};

// Instance method to get station display name
StationSchema.methods.getDisplayName = function() {
    const linePart = this.Line !== null && this.Line !== undefined ? ` - Line ${this.Line}` : '';
    return `Unit ${this.Unit}${linePart} - Station ${this.ID}`;
};

// Static method to find stations by unit
StationSchema.statics.findByUnit = function(unit) {
    return this.find({ Unit: unit.toUpperCase() });
};

// Static method to find stations by line
StationSchema.statics.findByLine = function(line) {
    return this.find({ Line: line });
};

// Static method to find available stations
StationSchema.statics.findAvailable = function() {
    return this.find({ Available: true });
};

// Static method to find active stations (with ongoing shifts)
StationSchema.statics.findActive = function() {
    return this.find({ Active: true });
};

module.exports = mongoose.model("Station", StationSchema);