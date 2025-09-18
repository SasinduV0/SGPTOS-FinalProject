const express = require("express");
const router = express.Router();
const LineReallocation = require("../models/LineReallocation");

// Helper function to emit real-time updates
const emitReallocationUpdate = async (io) => {
  try {
    const allReallocations = await LineReallocation.find();
    const reallocatedOnly = await LineReallocation.find(
      { newLineNo: { $exists: true, $ne: [] } },
      "EmployeeID name lineNo newLineNo"
    );
    
    console.log("📡 Emitting reallocation updates to", io.engine.clientsCount, "clients");
    io.emit("reallocationUpdate", allReallocations);
    io.emit("reallocatedEmployeesUpdate", reallocatedOnly);
  } catch (error) {
    console.error("❌ Error emitting reallocation update:", error);
  }
};

// ✅ Create (Save) a new Line Management entry
router.post("/", async (req, res) => {
  try {
    const newLine = new LineReallocation(req.body);
    const savedLine = await newLine.save();
    
    console.log("✅ Line reallocation created:", savedLine.EmployeeID);
    
    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      await emitReallocationUpdate(io);
    }
    
    res.status(201).json(savedLine);
  } catch (err) {
    console.error("❌ Error creating line reallocation:", err);
    res.status(400).json({ error: err.message });
  }
});

// ✅ Read (Get all) Line Management entries
router.get("/", async (req, res) => {
  try {
    const lines = await LineReallocation.find();
    res.json(lines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Read (Get employees with specific reallocation)
router.get("/reallocated", async (req, res) => {
  try {
    const reallocated = await LineReallocation.find(
      { newLineNo: { $exists: true, $ne: [] } }, // only if reallocation exists
      "EmployeeID name lineNo newLineNo"         // select only required fields
    );
    res.json(reallocated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update a Line Management entry by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedLine = await LineReallocation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedLine) return res.status(404).json({ error: "Line not found" });
    
    console.log("✅ Line reallocation updated:", updatedLine.EmployeeID);
    
    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      await emitReallocationUpdate(io);
    }
    
    res.json(updatedLine);
  } catch (err) {
    console.error("❌ Error updating line reallocation:", err);
    res.status(400).json({ error: err.message });
  }
});

// ✅ Delete a Line Management entry by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedLine = await LineReallocation.findByIdAndDelete(req.params.id);
    if (!deletedLine) return res.status(404).json({ error: "Line not found" });
    
    console.log("✅ Line reallocation deleted:", deletedLine.EmployeeID);
    
    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      await emitReallocationUpdate(io);
    }
    
    res.json({ message: "Line deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting line reallocation:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
