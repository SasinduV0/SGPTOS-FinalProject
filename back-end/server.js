require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
const connectDB = require('./config/database')
const authRoutes = require('./routes/auth')
const iotRoutes = require('./routes/iotRoute')
const userProfileRoutes = require('./routes/userProfile');
const forgotPasswordRoutes = require('./routes/forgotPassword');
//WebSocket server for the RFID scan data transfer
const RFIDWebSocketServer = require('./websocket/rfidWebSocket');
const userRoute = require('./routes/userRoute');


connectDB();

app.use(cors())
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use('/api/user', userProfileRoutes);
app.use("/api", iotRoutes);
app.use("/api/auth", forgotPasswordRoutes);
app.use("/api/user", userRoute)


app.use("/", (req,res) => {
    res.json({
        "msg":"Hello Smart Garment production tracking system!",
        "websocket": "Available at ws://localhost:8000/rfid-ws",
        "status": "WebSocket server running"
    })
});

const PORT = process.env.PORT || 8000;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const rfidWS = new RFIDWebSocketServer(server);

// Start server
server.listen(PORT, ()=>{
    console.log(`<> Server is up and running on port ${PORT}`);
    console.log(`-> WebSocket server available at: ws://localhost:${PORT}/rfid-ws`);
    console.log(`-> Ready to receive RFID data from ESP32`);
});