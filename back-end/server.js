require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const connectDB = require('./config/database')
const authRoutes = require('./routes/auth')
const iotRoutes = require('./routes/iotRoute')
const userProfileRoutes = require('./routes/userProfile');
const forgotPasswordRoutes = require('./routes/forgotPassword');


connectDB();

app.use(cors())
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use('/api/user', userProfileRoutes);
app.use("/api", iotRoutes);
app.use("/api/auth", forgotPasswordRoutes);


app.use("/", (req,res) => {
    res.json({"msg":"Hello Smart Garment production tracking system!"})
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, ()=>{
    console.log(`Server is up and running on port ${PORT}`)
});










// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const http = require("http");          // ⬅️ Add this
// const { Server } = require("socket.io"); // ⬅️ Add this

// const connectDB = require("./config/database");
// const authRoutes = require("./routes/auth");
// const iotRoutes = require("./routes/employee");
// const userProfileRoutes = require("./routes/userProfile");
// const forgotPasswordRoutes = require("./routes/forgotPassword");

// // Init express
// const app = express();
// const server = http.createServer(app); // ⬅️ wrap express in http server
// const io = new Server(server, { cors: { origin: "*" } }); // ⬅️ init socket.io

// connectDB();

// app.use(cors());
// app.use(express.json());

// // --- Attach io to app so routes can use it ---
// app.set("io", io);

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/user", userProfileRoutes);
// app.use("/api", iotRoutes);
// app.use("/api/auth", forgotPasswordRoutes);

// app.use("/", (req, res) => {
//   res.json({ msg: "Hello Smart Garment production tracking system!" });
// });

// // --- Socket.IO connections ---
// io.on("connection", (socket) => {
//   console.log("⚡ Client connected:", socket.id);

//   socket.on("disconnect", () => {
//     console.log("❌ Client disconnected:", socket.id);
//   });
// });

// // Start server
// const PORT = process.env.PORT || 8000;
// server.listen(PORT, () => {
//   console.log(`🚀 Server is up and running on port ${PORT}`);
// });
