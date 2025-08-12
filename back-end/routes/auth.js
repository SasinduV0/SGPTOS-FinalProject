const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('../models/User');
const router = express.Router();


const crypto = require('crypto');
// Don't forget to import the nodemailer library
const nodemailer = require('nodemailer');

// ... (existing signup and login routes)

//sign-up
router.post("/signup", async (req,res) =>{
    try{
        const { username, userID, password, role, email  } = req.body; 

    const userExist = await User.findOne({ userID });
    if (userExist) {
      return res.status(400).json({ msg: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      userID,
      password: hashPassword,
      role: role || 'user', 
      email
    });

    await newUser.save();

    res.status(201).json({ msg: "User created successfully" });
    }catch(err){
        console.error(err.message)
        res.status(500).json({error:"Server error"});
    }
}); 

//Login
router.post("/login", async (req,res) =>{
    try{
        const {userID, password, role} = req.body;

        const user = await User.findOne({ userID });
        if (!user) {
        return res.status(400).json({ msg: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
        return res.status(400).json({ msg: "Invalid Credentials" });
        }

        const payload = {
            user: {
                id: user.id,
                userID: user.userID,
                role: user.role,
                username: user.username,
            }
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({
            token,
            user:{
                id: user.id,
                userID: user.userID,
                role: user.role,
                username: user.username,
            }
        });

    }catch(err){
        console.error(err.message)
        res.status(500).json({error:"Server Error"})
    }
})





// ... (existing signup and login routes)

// routes/auth.js

// ... (existing code and imports)

router.post("/forgotpassword", async (req, res) => {
    try {
        const { email } = req.body; // Look for the user by email, not userID
        const user = await User.findOne({ email });

        if (!user) {
            // This is the source of your "User not found" error
            return res.status(404).json({ msg: "User not found with that email address." });
        }

        const resetToken = user.generatePasswordResetToken();
        await user.save();

        const resetUrl = `http://localhost:5173/resetpassword/${resetToken}`;

        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email, // Use the user's email from the database
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

// ... (rest of your routes)

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