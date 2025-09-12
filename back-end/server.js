require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const connectDB = require("./config/database");
const authRoutes = require("./routes/auth");
const iotRoutes = require("./routes/employee");
const userProfileRoutes = require("./routes/userProfile");
const forgotPasswordRoutes = require("./routes/forgotPassword");
const Employee = require("./models/Employee");

// WebSocket server for the RFID scan data transfer
const RFIDWebSocketServer = require("./websocket/rfidWebSocket");

// Init express
const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: "*",
    methods: ["GET", "POST"]
  }
});

connectDB();

app.use(cors());
app.use(express.json());

// Attach io to app so routes can use it
app.set("io", io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userProfileRoutes);
app.use("/api", iotRoutes);
app.use("/api/auth", forgotPasswordRoutes);

app.use("/", (req, res) => {
  res.json({
    msg: "Hello Smart Garment production tracking system!",
    websocket: "Available at ws://localhost:8000/rfid-ws",
    status: "WebSocket server running",
    socketio: "Real-time updates enabled",
  });
});

// ---------------------------
// 🔌 Socket.IO connections
// ---------------------------
io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);
  console.log("👥 Total clients:", io.engine.clientsCount);

  // Send initial employees when client connects
  socket.on("getLeadingLine", async () => {
    try {
      const employees = await Employee.find({});
      console.log("📤 Sending initial employees:", employees.length);
      socket.emit("leadingLineUpdate", employees);
    } catch (error) {
      console.error("❌ Error fetching initial data:", error);
    }
  });

  // Send all employees when requested
  socket.on("getAllEmployees", async () => {
    try {
      const employees = await Employee.find({});
      console.log("📤 Sending all employees:", employees.length);
      socket.emit("leadingLineUpdate", employees);
    } catch (error) {
      console.error("❌ Error fetching all employees:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    console.log("👥 Remaining clients:", io.engine.clientsCount);
  });
});

// ---------------------------
// 🔄 MongoDB Change Stream
// ---------------------------
mongoose.connection.once("open", () => {
  console.log("✅ MongoDB connected successfully");
  
  try {
    const changeStream = mongoose.connection
      .collection("employees")
      .watch([], { fullDocument: 'updateLookup' });

    changeStream.on("change", async (change) => {
      try {
        console.log("🔄 Database change detected:", change.operationType);
        const updatedEmployees = await Employee.find({});
        console.log("� Broadcasting to", io.engine.clientsCount, "clients");
        io.emit("leadingLineUpdate", updatedEmployees);
      } catch (error) {
        console.error("❌ Error processing change:", error);
      }
    });

    changeStream.on("error", (error) => {
      console.error("❌ Change stream error:", error);
    });

    console.log("✅ Change stream watching for employee updates...");
  } catch (error) {
    console.error("❌ Error setting up change stream:", error);
    console.log("💡 Make sure MongoDB is running as a replica set");
  }
});

const PORT = process.env.PORT || 8000;

// Initialize WebSocket server for RFID
const rfidWS = new RFIDWebSocketServer(server);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is up and running on port ${PORT}`);
  console.log(`-> WebSocket server available at: ws://localhost:${PORT}/rfid-ws`);
  console.log(`-> Socket.IO server ready for real-time updates`);
  console.log(`-> Ready to receive RFID data from ESP32`);
});
