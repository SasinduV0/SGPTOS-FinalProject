const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('../models/user');
const router = express.Router();

//sign-up
router.post("/signup", async (req,res) =>{
    try{
        const { username, email, password, role } = req.body; 

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ msg: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashPassword,
      role: role || 'user', 
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
        const {email, password, role} = req.body;

        const user = await User.findOne({ email });
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
                role: user.role,
                username: user.username,
            }
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({
            token,
            user:{
                id: user.id,
                email: user.email,
                role: user.role,
                username: user.username,
            }
        });

    }catch(err){
        console.error(err.message)
        res.status(500).json({error:"Server Error"})
    }
})
module.exports = router;