const express = require("express"); // ✅ CommonJS require
const LineManagement = require("../models/LineManagement"); // ✅ require

const router = express.Router();

// Get all records
router.get("/", async (req, res) => {
  try {
    const data = await LineManagement.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single record
router.get("/:id", async (req, res) => {
  try {
    const record = await LineManagement.findById(req.params.id);
    res.json(record);
  } catch (err) {
    res.status(404).json({ error: "Record not found" });
  }
});

// Create new record
router.post("/", async (req, res) => {
  try {
    const newRecord = new LineManagement(req.body);
    const saved = await newRecord.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update record
router.put("/:id", async (req, res) => {
  try {
    const updated = await LineManagement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete record
router.delete("/:id", async (req, res) => {
  try {
    await LineManagement.findByIdAndDelete(req.params.id);
    res.json({ message: "Record deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ remove "export default"
// ✅ use module.exports
module.exports = router;
