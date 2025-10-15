const mongoose = require('mongoose');

const rfidEmployeeSchema = new mongoose.Schema({
  rfidNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  empName: {
    type: String,
    required: true,
    trim: true
  },
  empId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 4,
    maxlength: 4,
    match: [/^E[1-9a-f]{3}$/, "empId format invalid. Must start with capital 'E' followed by three characters each 1-9 or a-f (lowercase). Example: E1a3"],
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },
  department: {
    type: String,
    enum: ['Quality Control', 'Cutting', 'Sewing', 'Packing'],
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  }
}, {
  timestamps: true
});

// Index වලින් search performance වැඩි කරන්න
rfidEmployeeSchema.index({ rfidNumber: 1 });
rfidEmployeeSchema.index({ empId: 1 });
rfidEmployeeSchema.index({ empName: 'text' });

module.exports = mongoose.model('RfidEmployee', rfidEmployeeSchema);