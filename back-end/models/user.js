const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);