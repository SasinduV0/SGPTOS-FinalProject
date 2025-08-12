// routes/auth.js

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('../models/User');
const router = express.Router();
const crypto = require('crypto');
// Don't forget to import the nodemailer library
const nodemailer = require('nodemailer');

// ... (existing signup and login routes)

// Request a password reset
router.post("/forgotpassword", async (req, res) => {
    try {
        const { userID } = req.body;
        const user = await User.findOne({ userID });

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Generate and save the reset token
        const resetToken = user.generatePasswordResetToken();
        await user.save();

        // Create a password reset link (client-side route)
        const resetUrl = `http://localhost:5173/resetpassword/${resetToken}`;

        // Create a transporter for sending emails
        // You'll need to set up a service like Gmail, SendGrid, etc., for this to work
        let transporter = nodemailer.createTransport({
            service: 'Gmail', // Example service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'recipient@example.com', // You'll need to fetch the user's email from the DB
            subject: 'Password Reset',
            html: `You requested a password reset. Click this link to reset your password: <a href="${resetUrl}">Reset Password</a>`,
        };
        
        await transporter.sendMail(mailOptions);
        
        res.status(200).json({ msg: "Password reset email sent" });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// Reset password with a token
router.put("/resetpassword/:token", async (req, res) => {
    try {
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ msg: "Invalid or expired token" });
        }

        // Set the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);

        // Clear the reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ msg: "Password reset successfully" });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;