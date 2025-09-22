const express = require("express");
const router = express.Router();
const LineManagement = require("../models/LineManagement");

// Helper function to emit supervisor updates
const emitSupervisorUpdate = async (io) => {
  try {
    const allSupervisors = await LineManagement.find({}, "name lineNo")
      .sort({ createdAt: -1 })
      .limit(4);
    console.log("📡 Emitting supervisor update to", io.engine.clientsCount, "clients");
    io.emit("supervisorUpdate", allSupervisors);
  } catch (error) {
    console.error("❌ Error emitting supervisor update:", error);
  }
};

// ✅ Create a new Line Management entry
router.post("/", async (req, res) => {
  try {
    const newLine = new LineManagement(req.body);
    const savedLine = await newLine.save();
    
    console.log("✅ Supervisor created:", savedLine.name);
    
    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      await emitSupervisorUpdate(io);
    }
    
    res.status(201).json(savedLine);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get all Line Management entries
router.get("/", async (req, res) => {
  try {
    const lines = await LineManagement.find();
    res.json(lines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get only name and assigned lines (MUST be before /:id route)
router.get("/names-lines", async (req, res) => {
  try {
    const data = await LineManagement.find({}, "name lineNo")
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(4); // Limit to 4 latest records
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Quick fix for MongoDB index issue (MUST be before /:id route)
router.get("/fix-db", async (req, res) => {
  try {
    const collection = LineManagement.collection;
    await collection.dropIndex("employeeNo_1");
    res.json({ message: "Fixed! You can now create records." });
  } catch (err) {
    res.json({ message: "Index already removed or doesn't exist", error: err.message });
  }
});

// ✅ Get a single Line Management entry by ID
router.get("/:id", async (req, res) => {
  try {
    const line = await LineManagement.findById(req.params.id);
    if (!line) return res.status(404).json({ error: "Line not found" });
    res.json(line);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update a Line Management entry by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedLine = await LineManagement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedLine) return res.status(404).json({ error: "Line not found" });
    
    console.log("✅ Supervisor updated:", updatedLine.name);
    
    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      await emitSupervisorUpdate(io);
    }
    
    res.json(updatedLine);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Delete a Line Management entry by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedLine = await LineManagement.findByIdAndDelete(req.params.id);
    if (!deletedLine) return res.status(404).json({ error: "Line not found" });
    
    console.log("✅ Supervisor deleted:", deletedLine.name);
    
    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      await emitSupervisorUpdate(io);
    }
    
    res.json({ message: "Line deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
