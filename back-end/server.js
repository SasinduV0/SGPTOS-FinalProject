
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/database");
const RFIDWebSocketServer = require('./websocket/rfidWebSocket');

// Route imports
const authRoutes = require("./routes/auth");
const iotRoutes = require("./routes/iotRoute");
const employeeRoutes = require("./routes/employee");
const lineManagement = require("./routes/lineManagement");
const lineReallocation = require("./routes/LineReallocation");
const userProfileRoutes = require("./routes/userProfile");
const forgotPasswordRoutes = require("./routes/forgotPassword");
const analyticsRoutes = require("./routes/analytics");
const productionRoutes = require("./routes/production");
const userRoute = require('./routes/userRoute');
const rfidEmployeeRoutes = require('./routes/rfidEmployeeRoute');
const productRfidRoutes = require('./routes/productRfid');
const userDetails = require('./routes/userDetails');
const validRfidsRoutes = require('./routes/validRfids');



connectDB();

// --- Express/Socket.IO server (port 8001) ---
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

// Middleware
app.use(cors());
app.use(express.json());
app.set("io", io);

// Root route - must be first
app.get("/", (req, res) => {
    res.json({
        message: "Smart Garment production tracking system is running!",
        socketIo: "Available for clients",
        webSocket: "Available for ESP32 at /rfid-ws"
    });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user-profile", userProfileRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/iot", iotRoutes);
app.use("/api/line-management", lineManagement);
app.use("/api/line-reallocation", lineReallocation);
app.use("/api/production", productionRoutes);
app.use("/api/users", userRoute);
app.use("/api/auth/forgot-password", forgotPasswordRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/rfid-employees", rfidEmployeeRoutes);
app.use("/api/product-rfids", productRfidRoutes);
app.use("/api/user-details", userDetails);
app.use("/api/valid-rfids", validRfidsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  res.json({
    "msg": "Hello Smart Garment production tracking system!",
    "websocket": "Available at ws://localhost:8000/rfid-ws",
    "status": "WebSocket server running"
  });

});


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "Something went wrong!",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Handle Socket.IO connections
io.on("connection", (socket) => {
    console.log("⚡ Client connected:", socket.id);
    socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
    });
});

// Initialize RFID WebSocket server
const rfidWS = new RFIDWebSocketServer(httpServer);

// Start the server
const PORT = process.env.PORT || 8001;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`
    🚀 Server is running!
    🌐 HTTP & Socket.IO: http://localhost:${PORT}
    📡 RFID WebSocket: ws://localhost:${PORT}/rfid-ws
    💾 Database: Connected
    `);
});
