
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
const lineManagement = require("./routes/LineManagement");
const lineReallocation = require("./routes/LineReallocation");
const productionRoutes = require("./routes/production");
const userProfileRoutes = require("./routes/userProfile");
const forgotPasswordRoutes = require("./routes/forgotPassword");

const analyticsRoutes = require("./routes/analytics");


const RFIDWebSocketServer = require('./websocket/rfidWebSocket');
const userRoute = require('./routes/userRoute');
const rfidEmployeeRoutes = require('./routes/rfidEmployeeRoute');
const productRfidRoutes = require('./routes/productRfid')
const userDetails = require('./routes/userDetails');
const validRfidsRoutes = require('./routes/validRfids')


connectDB();

// --- Express/Socket.IO server (port 8001) ---
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.set("io", io);
app.use("/api/auth", authRoutes);
app.use("/api/user", userProfileRoutes);
app.use("/api", employeeRoutes);
app.use("/api", iotRoutes);
app.use("/api/line-management", lineManagement);
app.use("/api/line-reallocation", lineReallocation);
app.use("/api/product", productionRoutes);
app.use("/api/iot", iotDefectRoutes);
app.use("/api/auth", forgotPasswordRoutes);

app.use("/api/analytics", analyticsRoutes);


app.use("/api/rfid-employees", rfidEmployeeRoutes);
app.use("/api/product-rfids", productRfidRoutes);
app.use('/api/users', userDetails);

app.use('/api/valid-rfids', validRfidsRoutes);


app.use("/", (req, res) => {
  res.json({
    "msg": "Hello Smart Garment production tracking system!",
    "websocket": "Available at ws://localhost:8000/rfid-ws",
    "status": "WebSocket server running"
  });
});


io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

const SOCKET_IO_PORT = process.env.PORT || 8001;
httpServer.listen(SOCKET_IO_PORT, '0.0.0.0', () => {
  console.log(`<> Socket.IO server running on port ${SOCKET_IO_PORT} on all interfaces`);
});

// --- Plain WebSocket server for ESP32 (port 8000) ---
const wsServer = http.createServer();
const rfidWS = new RFIDWebSocketServer(wsServer);
wsServer.listen(8000, '0.0.0.0', () => {
  console.log(`-> WebSocket server available at: ws://0.0.0.0:8000/rfid-ws`);
  console.log(`-> Ready to receive RFID data from ESP32`);
});
