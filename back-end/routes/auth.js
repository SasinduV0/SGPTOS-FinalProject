const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('../models/user');
const router = express.Router();

//register
router.post("/signup", async (req, res) => {
    try {
        const {
            firstname,
            lastname,
            email,
            username,
            userID,
            phoneNumber,
            department,
            password,
            role
        } = req.body;

        // Check if user already exists by email or userID
        const userExist = await User.findOne({ $or: [{ email }, { userID }] });
        if (userExist) {
            return res.status(400).json({ msg: "User already exists!" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        
        // Create new user
        const newUser = new User({
            firstname,
            lastname,
            email,
            userID,
            username,
            phoneNumber,
            department,
            password: hashPassword,
            role: role || "qc"
        });

        await newUser.save();

        res.status(201).json({ msg: "User created successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
}); 

//Login

router.post("/login", async (req, res) => {
    try {
        const { userID, password, role } = req.body;

        console.log("Login attempt:", { userID, role, passwordLength: password?.length });

        // Find the user
        const user = await User.findOne({ userID });
        if (!user) {
            console.log("User not found for userID:", userID);
            return res.status(400).json({ msg: "User not found" });
        }

        console.log("Found user:", { 
            userID: user.userID, 
            role: user.role, 
            hasPassword: !!user.password,
            passwordStart: user.password.substring(0, 10) + "..."
        });

        // Verify password
        console.log("Comparing password:", password, "with hash:", user.password.substring(0, 10) + "...");
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", isMatch);
        
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        // Check if selected role matches user's actual role
        if (role !== user.role) {
            return res.status(403).json({ 
                msg: "Invalid role selected for this user" 
            });
        }

        const payload = {
            user: {
                id: user.id,
                userID: user.userID,
                role: user.role,
                username: user.username,
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({
            token,
            user: {
                id: user.id,
                userID: user.userID,
                role: user.role,
                username: user.username,
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});
module.exports = router;