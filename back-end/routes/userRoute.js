const express = require('express');
const User = require('../models/registerUser');
const router = express.Router();

//User registration endpoint
router.post('/register', async (req, res) => {
    try{
        const {firstname, lastname, email, phoneNumber, employeeId, department, password} = req.body;

        //chesk user is alredy have
        const existingUser = await RegisterUser.findOne({email});  
        if(existingUser) return res.status(400).json({message: "Email alredy registered"});

        const existingEmployeeId = await RegisterUser.findOne({employeeId});
        if (existingEmployeeId) return res.status(400).json({message: "Employee ID already exists"})

        //create new user
        const user = new RegisterUser({firstname, lastname,email, phoneNumber, employeeId, department, password});
        await user.save();

        res.status(201).json({message: "User registered successfully"})

    } catch(err) {
        console.error(err.message);
        res.status(500).json({error: "Server error"})
    }
});

module.exports = router;