const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  // Name
  firstname: {
    type: String,
    required: true,
    trim: true
  },
  lastname: {
    type: String,
    required: true,
    trim: true
  },

  // Login & ID
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  username: {        // optional if you want to use
    type: String,
    trim: true
  },

  // Contact & Department
  phoneNumber: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },

  // Authentication
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ["qc", "supervisor", "manager", "admin", "live-dashboard"],
    default: "qc"
  },
  userID: {
  type: String,
  required: true,
  unique: true
},
username: {
  type: String,
  required: true,
  trim: true
},

  // Password reset
  resetToken: { type: String },
  resetTokenExpire: { type: Date }

}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
