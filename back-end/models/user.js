const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
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
      
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },

  // Password reset
  resetToken: { type: String },
  resetTokenExpire: { type: Date }

}, {
  timestamps: true
});

// Hash password before saving
// userSchema.pre("save", async function(next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// Hash password before saving - ENABLE THIS
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
