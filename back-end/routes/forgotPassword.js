const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,  // Gmail account
        pass: process.env.EMAIL_PASS   // App password
    }
});

// -------------------------
// 1️⃣ Forgot Password - UserID + Role Based
// -------------------------
router.post("/forgot-password", async (req, res) => {
    const { userID, role } = req.body;

    try {
        // Check if user exists with the given userID + role
        const user = await User.findOne({ userID, role });
        if (!user) return res.status(404).json({ message: "User not found for this role" });

        // Generate reset token
        const token = crypto.randomBytes(32).toString("hex");
        user.resetToken = token;
        user.resetTokenExpire = Date.now() + 3600000; // 1 hour expiry
        await user.save();

        // Create reset link
        const resetLink = `http://localhost:5173/reset-password/${token}`;

        // Send email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email, // email fetched from DB
            subject: "Password Reset Request",
            html: `
                <h2>Password Reset</h2>
                <p>Hello ${user.username},</p>
                <p>You requested a password reset for role: <strong>${role}</strong>.</p>
                <p>Click the link below to reset your password (valid for 1 hour):</p>
                <a href="${resetLink}">${resetLink}</a>
            `
        });

        res.json({ message: "If an account exists, a reset link has been sent to the registered email." });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Error sending reset email" });
    }
});

// -------------------------
// 2️⃣ Reset Password
// -------------------------
router.post("/reset-password/:token", async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpire: { $gt: Date.now() } // check token not expired
        });

        if (!user) return res.status(400).json({ success: false, message: "Invalid or expired reset token" });

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update password and clear token
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpire = undefined;

        await user.save();

        res.json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ success: false, message: "Error resetting password" });
    }
});

module.exports = router;
