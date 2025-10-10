const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // This should be an App Password, not regular password
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 30000,   // 30 seconds
  socketTimeout: 60000,     // 60 seconds
});

// -------------------------
// 1️⃣ Forgot Password - UserID + Role Based
// -------------------------
router.post("/forgot-password", async (req, res) => {
    const { userID, role } = req.body;

    try {
        console.log("Forgot password request for:", { userID, role });
        
        // Verify environment variables
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error("Missing email configuration in environment variables");
            return res.status(500).json({ message: "Email service configuration error" });
        }

        // Check if user exists with the given userID + role
        const user = await User.findOne({ userID, role });
        if (!user) {
            console.log("User not found for:", { userID, role });
            return res.status(404).json({ message: "User not found for this role" });
        }

        console.log("User found:", { userID: user.userID, email: user.email });

        // Check if user has email
        if (!user.email) {
            console.error("User has no email address");
            return res.status(400).json({ message: "No email address associated with this account" });
        }

        // Generate reset token
        const token = crypto.randomBytes(32).toString("hex");
        const resetTokenExpire = Date.now() + 3600000; // 1 hour expiry
        
        // Update user with reset token using findByIdAndUpdate to avoid validation issues
        await User.findByIdAndUpdate(user._id, {
            resetToken: token,
            resetTokenExpire: resetTokenExpire
        }, { 
            runValidators: false // Skip validation for this update
        });

        console.log("Reset token generated and saved");

        // Create reset link
        const resetLink = `http://localhost:5173/reset-password/${token}`;

        // Test transporter connection first
        try {
            await transporter.verify();
            console.log("Email transporter verified successfully");
        } catch (verifyError) {
            console.error("Email transporter verification failed:", verifyError);
            return res.status(500).json({ message: "Email service connection failed" });
        }

        // Send email
        console.log("Attempting to send email to:", user.email);
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset Request",
            html: `
                <h2>Password Reset</h2>
                <p>Hello ${user.username},</p>
                <p>You requested a password reset for role: <strong>${role}</strong>.</p>
                <p>Click the link below to reset your password (valid for 1 hour):</p>
                <a href="${resetLink}">${resetLink}</a>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);

        res.json({ message: "If an account exists, a reset link has been sent to the registered email." });
    } catch (error) {
        console.error("Forgot Password Error Details:", {
            message: error.message,
            code: error.code,
            command: error.command,
            stack: error.stack
        });
        
        // More specific error messages
        if (error.code === 'EAUTH') {
            res.status(500).json({ message: "Email authentication failed. Please check email credentials." });
        } else if (error.code === 'ECONNECTION') {
            res.status(500).json({ message: "Failed to connect to email server. Please try again later." });
        } else {
            res.status(500).json({ message: "Error sending reset email. Please try again later." });
        }
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

        // Update password and clear token using findByIdAndUpdate to avoid validation issues
        await User.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            resetToken: undefined,
            resetTokenExpire: undefined
        }, { 
            runValidators: false // Skip validation for this update
        });

        res.json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ success: false, message: "Error resetting password" });
    }
});

module.exports = router;
