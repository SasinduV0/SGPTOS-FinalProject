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