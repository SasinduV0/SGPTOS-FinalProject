const express = require("express");
const router = express.Router();
const Station = require("../models/Station");
const Employee = require("../models/Employee");

// Helper function to emit updates (for future real-time functionality)
const emitStationUpdate = async (io) => {
  try {
    const allStations = await Station.find();
    console.log("📡 Emitting station update to", io.engine.clientsCount, "clients");
    io.emit("stationUpdate", allStations);
  } catch (error) {
    console.error("❌ Error emitting station update:", error);
  }
};

// ========== STATION SCHEMA ROUTES ==========

// Create new station
router.post("/station", async (req, res) => {
  try {
    const { ID, Unit, Line, Station_Number, Employee_ID, Employee_Name, Available, Active } = req.body;

    // Validate required fields
    if (!ID || !Unit || Station_Number === undefined) {
      return res.status(400).json({ 
        error: "Missing required fields",
        required: ["ID", "Unit", "Station_Number"]
      });
    }

    // Create new station
    const station = new Station({
      ID,
      Unit,
      Line,
      Station_Number,
      Employee_ID: Employee_ID || null,
      Employee_Name: Employee_Name || null,
      Available: Available !== undefined ? Available : true,
      Active: Active !== undefined ? Active : false
    });

    await station.save();

    console.log("✅ Station created:", station.ID, "Unit:", station.Unit, "Line:", station.Line);

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      await emitStationUpdate(io);
    }

    res.status(201).json({
      message: "Station created successfully",
      station: station
    });
  } catch (err) {
    console.error("❌ Error creating station:", err);
    
    // Handle duplicate ID error
    if (err.code === 11000) {
      return res.status(409).json({ 
        error: "Station ID already exists",
        field: "ID"
      });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: "Validation error",
        details: err.message
      });
    }
    
    res.status(500).json({ error: err.message });
  }
});

// Get all stations
router.get("/stations", async (req, res) => {
  try {
    const stations = await Station.find();
    res.json(stations);
  } catch (err) {
    console.error("❌ Error fetching stations:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get station by ID
router.get("/station/:id", async (req, res) => {
  try {
    const station = await Station.findOne({ ID: req.params.id.toUpperCase() });
    
    if (!station) {
      return res.status(404).json({ error: "Station not found" });
    }
    
    res.json(station);
  } catch (err) {
    console.error("❌ Error fetching station:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get stations by Unit
router.get("/stations/unit/:unit", async (req, res) => {
  try {
    const stations = await Station.findByUnit(req.params.unit);
    res.json(stations);
  } catch (err) {
    console.error("❌ Error fetching stations by unit:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get stations by Line
router.get("/stations/line/:line", async (req, res) => {
  try {
    const line = parseInt(req.params.line);
    const stations = await Station.findByLine(line);
    res.json(stations);
  } catch (err) {
    console.error("❌ Error fetching stations by line:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get available stations
router.get("/stations/available", async (req, res) => {
  try {
    const stations = await Station.findAvailable();
    res.json(stations);
  } catch (err) {
    console.error("❌ Error fetching available stations:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get active stations (with ongoing shifts)
router.get("/stations/active", async (req, res) => {
  try {
    const stations = await Station.findActive();
    res.json(stations);
  } catch (err) {
    console.error("❌ Error fetching active stations:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update station by ID
router.put("/station/:id", async (req, res) => {
  try {
    const { Unit, Line, Station_Number, Employee_ID, Employee_Name, Available, Active } = req.body;
    
    const station = await Station.findOneAndUpdate(
      { ID: req.params.id.toUpperCase() },
      { Unit, Line, Station_Number, Employee_ID, Employee_Name, Available, Active },
      { new: true, runValidators: true }
    );

    if (!station) {
      return res.status(404).json({ error: "Station not found" });
    }

    console.log("✅ Station updated:", station.ID);

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      await emitStationUpdate(io);
    }

    res.json({
      message: "Station updated successfully",
      station: station
    });
  } catch (err) {
    console.error("❌ Error updating station:", err);
    res.status(500).json({ error: err.message });
  }
});

// Assign employee to station (auto-fetch employee name from Employee collection)
router.patch("/station/:id/assign", async (req, res) => {
  try {
    const { Employee_ID } = req.body;

    if (!Employee_ID) {
      return res.status(400).json({ 
        error: "Missing required field: Employee_ID"
      });
    }

    // Find employee by ID to get name automatically
    const employee = await Employee.findOne({ ID: Employee_ID.toUpperCase() });

    if (!employee) {
      return res.status(404).json({ 
        error: "Employee not found",
        employeeId: Employee_ID
      });
    }

    // Update station with employee ID and name
    const station = await Station.findOneAndUpdate(
      { ID: req.params.id.toUpperCase() },
      { 
        Employee_ID: employee.ID, 
        Employee_Name: employee.Name,
        Assigned: true // Mark as assigned
      },
      { new: true, runValidators: true }
    );

    if (!station) {
      return res.status(404).json({ error: "Station not found" });
    }

    // Update employee to mark as assigned
    await Employee.findOneAndUpdate(
      { ID: employee.ID },
      { Assigned: true, Unit: station.Unit }
    );

    console.log("✅ Employee assigned to station:", station.ID, "Employee:", employee.Name);

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      await emitStationUpdate(io);
    }

    res.json({
      message: "Employee assigned successfully",
      station: station,
      employee: {
        ID: employee.ID,
        Name: employee.Name,
        Type: employee.Type
      }
    });
  } catch (err) {
    console.error("❌ Error assigning employee:", err);
    res.status(500).json({ error: err.message });
  }
});

// Unassign employee from station
router.patch("/station/:id/unassign", async (req, res) => {
  try {
    const station = await Station.findOne({ ID: req.params.id.toUpperCase() });

    if (!station) {
      return res.status(404).json({ error: "Station not found" });
    }

    const employeeId = station.Employee_ID;

    // Update station to remove employee
    station.Employee_ID = null;
    station.Employee_Name = null;
    station.Active = false;
    await station.save();

    // Update employee to mark as unassigned if employee exists
    if (employeeId) {
      await Employee.findOneAndUpdate(
        { ID: employeeId },
        { Assigned: false, Unit: null }
      );
    }

    console.log("✅ Employee unassigned from station:", station.ID);

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      await emitStationUpdate(io);
    }

    res.json({
      message: "Employee unassigned successfully",
      station: station
    });
  } catch (err) {
    console.error("❌ Error unassigning employee:", err);
    res.status(500).json({ error: err.message });
  }
});

// Activate station (start shift)
router.patch("/station/:id/activate", async (req, res) => {
  try {
    const station = await Station.findOne({ ID: req.params.id.toUpperCase() });

    if (!station) {
      return res.status(404).json({ error: "Station not found" });
    }

    if (!station.isAssigned()) {
      return res.status(400).json({ 
        error: "Cannot activate station without assigned employee"
      });
    }

    station.Active = true;
    await station.save();

    console.log("✅ Station activated:", station.ID, "Employee:", station.Employee_Name);

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      await emitStationUpdate(io);
    }

    res.json({
      message: "Station activated successfully",
      station: station
    });
  } catch (err) {
    console.error("❌ Error activating station:", err);
    res.status(500).json({ error: err.message });
  }
});

// Deactivate station (end shift)
router.patch("/station/:id/deactivate", async (req, res) => {
  try {
    const station = await Station.findOneAndUpdate(
      { ID: req.params.id.toUpperCase() },
      { Active: false },
      { new: true }
    );

    if (!station) {
      return res.status(404).json({ error: "Station not found" });
    }

    console.log("✅ Station deactivated:", station.ID);

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      await emitStationUpdate(io);
    }

    res.json({
      message: "Station deactivated successfully",
      station: station
    });
  } catch (err) {
    console.error("❌ Error deactivating station:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete station by ID
router.delete("/station/:id", async (req, res) => {
  try {
    const station = await Station.findOneAndDelete({ ID: req.params.id.toUpperCase() });

    if (!station) {
      return res.status(404).json({ error: "Station not found" });
    }

    console.log("✅ Station deleted:", station.ID);

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      await emitStationUpdate(io);
    }

    res.json({ 
      message: "Station deleted successfully",
      deletedStation: station
    });
  } catch (err) {
    console.error("❌ Error deleting station:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
