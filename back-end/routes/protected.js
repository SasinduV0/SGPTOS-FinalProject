const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.get("/dashboard", authMiddleware, (req, res) => {
    res.json({
        message: "You have accessed the protected dashboard route!",
        user: req.user // contains id and role
    });
});

module.exports = router;
