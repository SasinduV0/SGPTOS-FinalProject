// forgotPassword.js
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
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// -------------------------
// 1️⃣ Forgot Password - send email
// -------------------------
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Generate random token
        const token = crypto.randomBytes(32).toString("hex");
        user.resetToken = token;
        user.resetTokenExpire = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetLink = `http://localhost:5173/reset-password/${token}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            html: `<h2>Password Reset</h2>
                   <p>Click the link below to reset your password:</p>
                   <a href="${resetLink}">${resetLink}</a>`
        });

        res.json({ message: "Reset email sent successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Email යැවීමේදී error එකක් තියෙනවා" });
    }
});

// -------------------------
router.post("/forgot-password", async (req, res) => {
    const { userID } = req.body; // Change from email to userID

    try {
        const user = await User.findOne({ userID });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Generate random token
        const token = crypto.randomBytes(32).toString("hex");
        user.resetToken = token;
        user.resetTokenExpire = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetLink = `http://localhost:5173/reset-password/${token}`;

        // For testing purposes, just return the token
        res.json({ 
            message: "Reset token generated successfully!", 
            resetLink 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error processing request" });
    }
});

router.post("/reset-password/:token", async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid or expired reset token" 
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update user's password and clear reset token fields
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpire = undefined;

        await user.save();

        res.json({
            success: true,
            message: "Password reset successful"
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: "Error resetting password"
        });
    }
});

module.exports = router;
