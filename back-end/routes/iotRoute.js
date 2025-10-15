const express = require("express");
const { RFIDTagScan, GarmentDefects } = require("../models/iot"); // Updated import
const DefectDefinitions = require("../models/defectDefinitions");  // Updated import
const Employee = require("../models/Employee"); // Add Employee model
const router = express.Router();

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

// Get scans grouped by line number
router.get("/station-summary", async (req, res) => {
  try {
    const stationCounts = await RFIDTagScan.aggregate([
      { $group: { _id: "$Line_Number", count: { $sum: 1 } } },
    ]);
    res.json({ stationCounts });
  } catch (err) {
    console.error("Error fetching station summary:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ==== DEFECT MANAGEMENT ROUTES ====

// Get all garment defects
router.get("/defects", async (req, res) => {
  try {
    const defects = await GarmentDefects.find().sort({ Time_Stamp: -1 });
    res.status(200).json(defects);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get defects for a specific garment UID
router.get("/defects/:tagUID", async (req, res) => {
  try {
    const garmentDefects = await GarmentDefects.findOne({ Tag_UID: req.params.tagUID });
    if (!garmentDefects) {
      return res.status(404).json({ error: "No defects found for this garment" });
    }
    res.status(200).json(garmentDefects);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Add or update defect for a garment
router.post("/defect", async (req, res) => {
  try {
    const { ID, Section, Type, Subtype, Tag_UID, Station_ID, Time_Stamp } = req.body;

    // Validate required fields
    if (ID === undefined || Section === undefined || Type === undefined || 
        Subtype === undefined || !Tag_UID || !Station_ID || !Time_Stamp) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create new defect entry
    const newDefectEntry = { Section, Type, Subtype };

    // Try to find existing garment defects document
    let garmentDefects = await GarmentDefects.findOne({ Tag_UID });

    if (garmentDefects) {
      // Check if this section-subtype combination already exists
      const existingDefect = garmentDefects.Defects.find(
        defect => defect.Section === Section && defect.Subtype === Subtype
      );

      if (existingDefect) {
        return res.status(409).json({ 
          error: "Defect already registered for this section-subtype combination",
          existing: existingDefect
        });
      }

      // Add new defect to existing document and update timestamp
      garmentDefects.Defects.push(newDefectEntry);
      garmentDefects.Time_Stamp = Time_Stamp;
      await garmentDefects.save();

      // Emit real-time update
      const io = req.app.get("io");
      if (io) {
        io.emit("defectUpdate", { 
          message: "New defect added to existing garment", 
          data: garmentDefects,
          newDefect: newDefectEntry 
        });
        console.log("🔥 Emitted defectUpdate event for existing garment");
      }

      res.status(200).json({ 
        message: "Defect added to existing garment", 
        data: garmentDefects,
        newDefect: newDefectEntry
      });
    } else {
      // Create new garment defects document
      garmentDefects = new GarmentDefects({
        ID, // Use the scan ID from first defect
        Tag_UID,
        Station_ID,
        Defects: [newDefectEntry],
        Time_Stamp
      });

      await garmentDefects.save();

      // ✅ ADD THIS: Emit real-time update for NEW garment too!
      const io = req.app.get("io");
      if (io) {
        io.emit("defectUpdate", { 
          message: "New garment defects document created", 
          data: garmentDefects,
          newDefect: newDefectEntry 
        });
        console.log("🔥 Emitted defectUpdate event for new garment");
      }

      res.status(201).json({ 
        message: "New garment defects document created", 
        data: garmentDefects 
      });
    }
  } catch (err) {
    console.error(err.message);
    if (err.name === 'ValidationError') {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Server error" });
    }
  }
});

// Get defect statistics
router.get("/defect-stats", async (req, res) => {
  try {
    const stats = await GarmentDefects.aggregate([
      { $unwind: "$Defects" },
      { 
        $group: { 
          _id: { 
            section: "$Defects.Section", 
            type: "$Defects.Type", 
            subtype: "$Defects.Subtype" 
          }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } }
    ]);
    
    const totalGarmentsWithDefects = await GarmentDefects.countDocuments();
    
    res.json({ 
      defectBreakdown: stats,
      totalGarmentsWithDefects 
    });
  } catch (err) {
    console.error("Error fetching defect statistics:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get defect rate (defect count vs total production from employees)
router.get("/defect-rate", async (req, res) => {
  try {
    // Get total production from employees
    const employees = await Employee.find();
    const totalProduction = employees.reduce((sum, emp) => sum + (emp.pcs || 0), 0);

    // Total garments with defects
    const defectCount = await GarmentDefects.countDocuments();

    // Calculate defect rate (%)
    const defectRate = totalProduction > 0 
      ? ((defectCount / totalProduction) * 100).toFixed(2) 
      : 0;

    res.json({
      total: totalProduction,
      defects: defectCount,
      defectRate: `${defectRate}%`,
    });
  } catch (err) {
    console.error("Error fetching defect rate:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ==== DEFECT DEFINITIONS ROUTES FOR ESP32 ====

// Get defect definitions in ESP32 compatible format
router.get("/defect-definitions/esp32", async (req, res) => {
  try {
    const definitions = await DefectDefinitions.getActiveDefinitions();
    
    if (!definitions) {
      return res.status(404).json({ 
        error: "No active defect definitions found",
        fallback: {
          sections: [
            { code: 0, name: "Body" },
            { code: 1, name: "Hand" },
            { code: 2, name: "Collar" },
            { code: 3, name: "Upper Back" }
          ],
          types: [
            { 
              code: 0, 
              name: "Fabric", 
              subtypes: [
                { code: 0, name: "Hole" },
                { code: 1, name: "Stain" },
                { code: 2, name: "Shading" },
                { code: 3, name: "Slub" }
              ]
            }
          ]
        }
      });
    }

    // Format for ESP32 consumption
    const esp32Format = {
      version: definitions.version,
      lastUpdated: definitions.lastUpdated,
      sections: definitions.sections.map(s => ({
        code: s.code,
        name: s.name.replace(/[^a-zA-Z0-9_]/g, '_') // Replace special chars for ESP32
      })),
      types: definitions.types.map(t => ({
        code: t.code,
        name: t.name.replace(/[^a-zA-Z0-9_]/g, '_'),
        subtypes: t.subtypes.map(st => ({
          code: st.code,
          name: st.name.replace(/[^a-zA-Z0-9_]/g, '_')
        }))
      })),
      metadata: {
        totalSections: definitions.totalSections,
        totalTypes: definitions.totalTypes,
        totalSubtypes: definitions.totalSubtypes
      }
    };

    res.status(200).json(esp32Format);
    console.log(`ESP32 defect definitions served - Version: ${definitions.version}`);
  } catch (err) {
    console.error("Error fetching defect definitions for ESP32:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// POST a new RFID scan
router.post("/scan", async (req, res) => {
  try {
    const { ID, Tag_UID, Station_ID, Line_Number, Time_Stamp } = req.body;
    if (!ID || !Tag_UID || !Station_ID || !Line_Number || !Time_Stamp) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const newScan = new RFIDTagScan({ ID, Tag_UID, Station_ID, Line_Number, Time_Stamp });
    await newScan.save();
    res.status(201).json({ message: "RFID scan saved", data: newScan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
