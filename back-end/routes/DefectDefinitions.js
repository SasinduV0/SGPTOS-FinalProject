const express = require("express");
const router = express.Router();
const DefectDefinitions = require("../models/defectDefinitions"); // Adjust the path to your model file

/**
 * @route   GET /api/defect-definitions/active
 * @desc    Get the currently active defect definitions
 * @access  Public
 */
router.get("/active", async (req, res) => {
  try {
    const definitions = await DefectDefinitions.getActiveDefinitions();
    if (!definitions) {
      return res.status(404).json({ msg: "No active defect definitions found" });
    }
    res.json(definitions);
  } catch (error) {
    console.error("Server Error:", error.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @route   GET /api/defect-definitions/esp32
 * @desc    Get active defect definitions formatted for ESP32
 * @access  Public
 */
router.get("/esp32", async (req, res) => {
  try {
    const definitions = await DefectDefinitions.getActiveDefinitions();
    if (!definitions) {
      return res.status(404).json({ msg: "No active defect definitions found" });
    }
    res.json(definitions.getESP32Format());
  } catch (error) {
    console.error("Server Error:", error.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @route   POST /api/defect-definitions
 * @desc    Create a new defect definition version (and deactivate old ones)
 * @access  Private/Admin
 */
router.post("/", async (req, res) => {
  // --- Validation and Sanitization ---
  const { version, createdBy, sections, types } = req.body;
  if (!version || !createdBy || !sections || !types) {
    return res.status(400).json({ msg: "Please provide all required fields: version, createdBy, sections, and types" });
  }

  try {
    // Deactivate the current active definition
    await DefectDefinitions.updateMany({ isActive: true }, { $set: { isActive: false } });

    // Create the new active definition
    const newDefinition = new DefectDefinitions({
      version,
      createdBy,
      sections,
      types,
      isActive: true, // Set the new version as active
    });

    await newDefinition.save();
    res.status(201).json(newDefinition);
  } catch (error) {
    console.error("Error creating new definition:", error.message);
    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({ msg: "Validation failed", errors: error.errors });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
