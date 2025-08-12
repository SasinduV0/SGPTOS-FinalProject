const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const crypto = require('crypto'); // Built-in Node.js module


const userSchema = new Schema({
    username: { 
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    userID:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        required: true,
        enum: ["qc", "supervisor", "manager", "admin", "live-dashboard"],
        default: "qc"
    },

    // ... existing fields
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    // ... existing fields


     // New fields for password reset
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps: true
});



// Method to generate a password reset token
userSchema.methods.generatePasswordResetToken = function() {
    // Generate a random token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash the token and set to resetPasswordToken field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token expiration to 15 minutes
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);