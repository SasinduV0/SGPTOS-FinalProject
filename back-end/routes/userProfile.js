const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        res.json({ user });
    } catch (err) {
        console.error("Profile fetch error:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

// Update user profile
router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const { username, currentPassword, newPassword } = req.body;
        
        // Find user
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Prepare update object
        const updateData = {};

        // Handle username update
        if (username && username !== user.username) {
            const usernameExists = await User.findOne({ 
                username, 
                _id: { $ne: user._id } 
            });
            
            if (usernameExists) {
                return res.status(400).json({ 
                    msg: "Username already exists" 
                });
            }
            updateData.username = username;
        }

        // Handle password update
        if (currentPassword && newPassword) {
            // Verify current password
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ 
                    msg: "Current password is incorrect" 
                });
            }

            // Validate new password
            if (newPassword.length < 6) {
                return res.status(400).json({ 
                    msg: "New password must be at least 6 characters" 
                });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(newPassword, salt);
        }

        // Check if there are any updates
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ 
                msg: "No updates provided" 
            });
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true, select: '-password' }
        );

        res.json({
            success: true,
            msg: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                userID: updatedUser.userID,
                role: updatedUser.role
            }
        });

    } catch (err) {
        console.error("Profile update error:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;