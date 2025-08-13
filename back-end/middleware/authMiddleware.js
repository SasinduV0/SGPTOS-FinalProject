// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Make sure to import your User model

const authMiddleware = async (req, res, next) => { // Changed to async
    const token = req.header("x-auth-token");

    console.log("Auth Middleware: Checking token...");
    console.log("Auth Middleware: Token received:", token ? "YES" : "NO");

    if (!token) {
        console.log("Auth Middleware: No token found. Sending 401.");
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

    try {
        if (!process.env.JWT_SECRET) {
            console.error("Auth Middleware: JWT_SECRET is not defined!");
            return res.status(500).json({ msg: "Server error: JWT secret missing" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Assuming decoded.user contains { id: userId }
        req.user = decoded.user;

        console.log("Auth Middleware: Token verified. Decoded user ID:", req.user.id);

        // Fetch the user from the database to get their role
        const user = await User.findById(req.user.id).select('role'); // Select only the 'role' field

        if (!user) {
            console.log("Auth Middleware: User not found for token ID.");
            return res.status(401).json({ msg: "User not found for token" });
        }

        req.user.role = user.role; // Attach the actual role from the database to req.user
        console.log(`Auth Middleware: User role fetched: ${req.user.role}`);

        next();
    } catch (err) {
        console.error("Auth Middleware: Token verification failed:", err.message);
        return res.status(401).json({ msg: "Token is not valid" });
    }
};

module.exports = authMiddleware;