const mongoose = require("mongoose");

// Defect Subtype Schema - individual subtypes with their properties
const defectSubtypeSchema = new mongoose.Schema({
  code: { 
    type: Number, 
    required: true,
    min: 0,
    max: 15 // Global subtype code range (0-15) as per ESP32 setup
  },
  name: { 
    type: String, 
    required: true,
    maxlength: 30,
    trim: true
  },
  description: { 
    type: String, 
    maxlength: 100,
    trim: true,
    default: ""
  }
}, { 
  _id: false 
});

// Defect Type Schema - defect types containing their subtypes
const defectTypeSchema = new mongoose.Schema({
  code: { 
    type: Number, 
    required: true,
    min: 0,
    max: 10 // Allow expansion beyond current 4 types (0-3)
  },
  name: { 
    type: String, 
    required: true,
    maxlength: 30,
    trim: true
  },
  description: { 
    type: String, 
    maxlength: 100,
    trim: true,
    default: ""
  },
  subtypes: {
    type: [defectSubtypeSchema],
    required: true,
    validate: {
      validator: function(subtypes) {
        return subtypes.length > 0 && subtypes.length <= 10; // Min 1, Max 10 subtypes per type
      },
      message: 'Each type must have 1-10 subtypes'
    }
  }
}, { 
  _id: false 
});

// Defect Section Schema - garment sections
const defectSectionSchema = new mongoose.Schema({
  code: { 
    type: Number, 
    required: true,
    min: 0,
    max: 10 // Allow expansion beyond current 4 sections (0-3)
  },
  name: { 
    type: String, 
    required: true,
    maxlength: 30,
    trim: true
  },
  description: { 
    type: String, 
    maxlength: 100,
    trim: true,
    default: ""
  }
}, { 
  _id: false 
});

// Main Defect Definitions Schema - centralized configuration
const defectDefinitionsSchema = new mongoose.Schema({
  version: { 
    type: String, 
    required: true,
    default: "1.0",
    maxlength: 10
  },
  isActive: {
    type: Boolean,
    default: true,
    required: true
  },
  createdBy: {
    type: String,
    required: true,
    maxlength: 50,
    trim: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    required: true
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now,
    required: true
  },
  
  // Defect configuration arrays
  sections: {
    type: [defectSectionSchema],
    required: true,
    validate: {
      validator: function(sections) {
        // Check for duplicate codes
        const codes = sections.map(s => s.code);
        return codes.length === new Set(codes).size && sections.length > 0 && sections.length <= 10;
      },
      message: 'Sections must have unique codes, min 1, max 10 sections'
    }
  },
  
  types: {
    type: [defectTypeSchema],
    required: true,
    validate: {
      validator: function(types) {
        // Check for duplicate codes and unique subtype codes within each type
        const typeCodes = types.map(t => t.code);
        if (typeCodes.length !== new Set(typeCodes).size || types.length === 0 || types.length > 10) {
          return false;
        }
        
        // Validate global subtype code uniqueness
        const allSubtypeCodes = [];
        for (const type of types) {
          for (const subtype of type.subtypes) {
            allSubtypeCodes.push(subtype.code);
          }
        }
        return allSubtypeCodes.length === new Set(allSubtypeCodes).size;
      },
      message: 'Types must have unique codes and globally unique subtype codes, min 1, max 10 types'
    }
  },
  
  // System metadata
  totalSections: {
    type: Number,
    default: function() { return this.sections ? this.sections.length : 0; }
  },
  totalTypes: {
    type: Number,
    default: function() { return this.types ? this.types.length : 0; }
  },
  totalSubtypes: {
    type: Number,
    default: function() { 
      if (!this.types) return 0;
      return this.types.reduce((total, type) => total + type.subtypes.length, 0);
    }
  }
}, {
  versionKey: false,
  timestamps: false // We manage timestamps manually
});

// Pre-save middleware to update calculated fields and timestamp
defectDefinitionsSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  this.totalSections = this.sections.length;
  this.totalTypes = this.types.length;
  this.totalSubtypes = this.types.reduce((total, type) => total + type.subtypes.length, 0);
  next();
});

// Instance method to get ESP32 compatible format
defectDefinitionsSchema.methods.getESP32Format = function() {
  return {
    version: this.version,
    sections: this.sections.map(s => ({
      code: s.code,
      name: s.name,
      description: s.description
    })),
    types: this.types.map(t => ({
      code: t.code,
      name: t.name,
      description: t.description,
      subtypes: t.subtypes.map(st => ({
        code: st.code,
        name: st.name,
        description: st.description
      }))
    })),
    metadata: {
      totalSections: this.totalSections,
      totalTypes: this.totalTypes,
      totalSubtypes: this.totalSubtypes,
      lastUpdated: this.lastUpdated
    }
  };
};

// Static method to get active definitions
defectDefinitionsSchema.statics.getActiveDefinitions = function() {
  return this.findOne({ isActive: true }).sort({ lastUpdated: -1 });
};

const DefectDefinitions = mongoose.model("DefectDefinitions", defectDefinitionsSchema, "defectdefinitions");

module.exports = DefectDefinitions;