const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('../models/user');
const router = express.Router();

//sign-up
router.post("/signup", async (req,res) =>{
    try{
        const { username, userID, password, role, email } = req.body; 

    const userExist = await User.findOne({ $or: [{ userID }, { email }] });
    if (userExist) {
      return res.status(400).json({ msg: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      userID,
      password: hashPassword,
      role: role, 
      email, 
    });

    await newUser.save();

    res.status(201).json({ msg: "User created successfully" });
    }catch(err){
        console.error(err.message)
        res.status(500).json({error:"Server error"});
    }
}); 

//Login
// ...existing code...

router.post("/login", async (req, res) => {
    try {
        const { userID, password, role } = req.body;

        // Find the user
        const user = await User.findOne({ userID });
        if (!user) {
            return res.status(400).json({ msg: "User not found" });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
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