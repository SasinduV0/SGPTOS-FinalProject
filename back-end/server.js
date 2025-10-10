
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/database");
const authRoutes = require("./routes/auth");
const iotRoutes = require("./routes/iotRoute");
const employeeRoutes = require("./routes/employee");
const iotDefectRoutes = require("./routes/iotRoute");
const lineManagement = require("./routes/lineManagement");
const lineReallocation = require("./routes/LineReallocation");

const userProfileRoutes = require("./routes/userProfile");
const forgotPasswordRoutes = require("./routes/forgotPassword");
const RFIDWebSocketServer = require('./websocket/rfidWebSocket');

const lineManagementRoutes = require('./routes/lineManagement');
const productionRoutes = require("./routes/production");
const userRoute = require('./routes/userRoute');



connectDB();

// --- Express + Socket.IO server ---
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.set("io", io);

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userProfileRoutes);
app.use("/api", employeeRoutes);
app.use("/api/line-management", lineManagement);
app.use("/api/line-reallocation", lineReallocation);
app.use("/api/iot", iotDefectRoutes);
app.use("/api/auth", forgotPasswordRoutes);
app.use("/api/line-management", lineManagementRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/users", userRoute);

app.use("/", (req, res) => {
  res.json({
    msg: "Hello Smart Garment production tracking system!",
    websocket: `Available at ws://localhost:${process.env.PORT || 8001}/rfid-ws`,
    status: "WebSocket server running",
  });
});

// Socket.IO connection logging
io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Attach RFID WebSocket server to the same HTTP server under the path /rfid-ws
// The existing RFIDWebSocketServer expects an HTTP server; initialize it with httpServer
const rfidWS = new RFIDWebSocketServer(httpServer);

// Start HTTP server (serves Express + Socket.IO + RFID WebSocket)
const PORT = process.env.PORT || 8001;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`<> Server is up and running on port ${PORT}`);
  console.log(`-> WebSocket server available at: ws://localhost:${PORT}/rfid-ws`);
  console.log(`-> Ready to receive RFID data from ESP32`);
});
