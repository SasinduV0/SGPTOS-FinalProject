// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const app = express();
// const connectDB = require('./config/database')
// const authRoutes = require('./routes/auth')
// const iotRoutes = require('./routes/iotRoute')
// const userProfileRoutes = require('./routes/userProfile');
// const forgotPasswordRoutes = require('./routes/forgotPassword');


// connectDB();

// app.use(cors())
// app.use(express.json());

// app.use("/api/auth", authRoutes);
// app.use('/api/user', userProfileRoutes);
// app.use("/api", iotRoutes);
// app.use("/api/auth", forgotPasswordRoutes);


// app.use("/", (req,res) => {
//     res.json({"msg":"Hello Smart Garment production tracking system!"})
// });

// const PORT = process.env.PORT || 8001;

// app.listen(PORT, ()=>{
//     console.log(`Server is up and running on port ${PORT}`)
// });











require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/database");
const authRoutes = require("./routes/auth");
const iotRoutes = require("./routes/employee");
const userProfileRoutes = require("./routes/userProfile");
const forgotPasswordRoutes = require("./routes/forgotPassword");
const RFIDWebSocketServer = require('./websocket/rfidWebSocket');

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
app.use("/api", iotRoutes);
app.use("/api/auth", forgotPasswordRoutes);
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
httpServer.listen(SOCKET_IO_PORT, () => {
  console.log(`<> Socket.IO server running on port ${SOCKET_IO_PORT}`);
});

// --- Plain WebSocket server for ESP32 (port 8000) ---
const wsServer = http.createServer();
const rfidWS = new RFIDWebSocketServer(wsServer);
wsServer.listen(8000, () => {
  console.log(`-> WebSocket server available at: ws://localhost:8000/rfid-ws`);
  console.log(`-> Ready to receive RFID data from ESP32`);
});
