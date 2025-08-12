import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

// POST: Reset Password
router.post("/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // 1. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Find user by ID
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 3. Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 4. Save updated user
    await user.save();

    res.status(200).json({ message: "Password reset successful" });

  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

export default router;
