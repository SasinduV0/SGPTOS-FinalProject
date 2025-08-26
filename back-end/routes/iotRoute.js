const express = require("express");
const { RFIDTagScan } = require("../models/iot"); // Updated import
const router = express.Router();

// Get all RFID tag scans
router.get("/rfid-scans", async (req, res) => {
  try {
    const scans = await RFIDTagScan.find().sort({ Time_Stamp: -1 });
    res.status(200).json(scans);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get RFID tag scan by ID
router.get("/rfid-scan/:id", async (req, res) => {
  try {
    const scan = await RFIDTagScan.findById(req.params.id);
    if (!scan) {
      return res.status(404).json({ error: "Scan not found" });
    }
    res.status(200).json(scan);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Create new RFID tag scan (alternative to WebSocket)
router.post("/rfid-scan", async (req, res) => {
  try {
    const newScan = new RFIDTagScan(req.body);
    await newScan.save();
    res.status(201).json({ message: "RFID scan saved successfully", data: newScan });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get scan count (total or filtered)
router.get("/scan-count", async (req, res) => {
  try {
    const { stationID, startTime, endTime } = req.query;

    const filter = {};
    if (stationID) filter.Station_ID = stationID;
    if (startTime && endTime) {
      filter.Time_Stamp = { $gte: Number(startTime), $lte: Number(endTime) };
    }

    const count = await RFIDTagScan.countDocuments(filter);
    res.json({ count });
  } catch (err) {
    console.error("Error fetching scan count:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get scans grouped by station
router.get("/station-summary", async (req, res) => {
  try {
    const stationCounts = await RFIDTagScan.aggregate([
      { $group: { _id: "$Station_ID", count: { $sum: 1 } } },
    ]);
    res.json({ stationCounts });
  } catch (err) {
    console.error("Error fetching station summary:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
