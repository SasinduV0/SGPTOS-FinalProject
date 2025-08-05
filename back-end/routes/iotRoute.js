const express = require("express");
const IOTData = require("../models/iot"); // model you'll create
const router = express.Router();

router.post("/iot-data", async (req, res) => {
  try {
    const newData = new IOTData(req.body);
    await newData.save();
    res.status(201).json({ message: "IoT data saved successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
