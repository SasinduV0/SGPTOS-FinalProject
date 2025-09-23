const mongoose = require('mongoose');

const productRFidSchema = new mongoose.Schema({
    rfidNumber: {
        type: String,
        required: [true, 'RFID number is required'],
        unique: true,
        trim: true,
    },
    unit: { 
        type: String, 
        default: '' 
    },
    workplace: { 
        type: String, 
        default: '' 
    },
    status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
    },
});

module.exports = mongoose.model('ProductRfid', ProductRfidSchema);