const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");

// Helper function to emit updates
const emitEmployeeUpdate = async (io) => {
  try {
    const allEmployees = await Employee.find();
    console.log("📡 Emitting update to", io.engine.clientsCount, "clients");
    io.emit("leadingLineUpdate", allEmployees);
  } catch (error) {
    console.error("❌ Error emitting update:", error);
  }
};

// ========== NEW EMPLOYEE SCHEMA ROUTES ==========

// Create new employee with new schema structure
router.post("/employee", async (req, res) => {
  try {
    const { ID, Card_UID, Name, Unit, Type, Assigned, Active } = req.body;

    // Validate required fields
    if (!ID || !Name || !Type) {
      return res.status(400).json({ 
        error: "Missing required fields",
        required: ["ID", "Name", "Type"]
      });
    }

    // Create new employee
    const employee = new Employee({
      ID,
      Card_UID: Card_UID || null,
      Name,
      Unit: Unit || null,
      Type,
      Assigned: Assigned !== undefined ? Assigned : false,
      Active: Active !== undefined ? Active : false
    });

    await employee.save();

    console.log("✅ New Employee created:", employee.Name, "ID:", employee.ID, "Type:", employee.Type);

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      await emitEmployeeUpdate(io);
    }

    res.status(201).json({
      message: "Employee created successfully",
      employee: employee
    });
  } catch (err) {
    console.error("❌ Error creating new employee:", err);
    
    // Handle duplicate ID error
    if (err.code === 11000) {
      return res.status(409).json({ 
        error: "Employee ID already exists",
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

// ========== OLD EMPLOYEE SCHEMA ROUTES (Legacy - Commented Out) ==========


// 1️⃣ Create new employee
router.post("/employees", async (req, res) => {
  try {
    const { employeeId, name, line, pcs } = req.body;
    const employee = new Employee({ employeeId, name, line, pcs });
    await employee.save();

    console.log("✅ Employee created:", employee.name, "ID:", employee.employeeId);

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      await emitEmployeeUpdate(io);
    }

    res.json(employee);
  } catch (err) {
    console.error("❌ Error creating employee:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2️⃣ Get all employees
router.get("/employees", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    console.error("❌ Error fetching employees:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3️⃣ Update employee by custom employeeId
router.put("/employees/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { name, line, pcs } = req.body;
    
    const employee = await Employee.findOneAndUpdate(
      { employeeId: employeeId },  // Find by custom employeeId
      { name, line, pcs }, 
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    console.log("✅ Employee updated:", employee.name, "ID:", employee.employeeId);

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      await emitEmployeeUpdate(io);
    }

    res.json(employee);
  } catch (err) {
    console.error("❌ Error updating employee:", err);
    res.status(500).json({ error: err.message });
  }
});

// 4️⃣ Update employee pieces only by custom employeeId
router.patch("/employees/:employeeId/pcs", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { pcs } = req.body;
    
    const employee = await Employee.findOneAndUpdate(
      { employeeId: employeeId },  // Find by custom employeeId
      { pcs }, 
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    console.log("✅ Employee PCS updated:", employee.name, "->", pcs, "ID:", employee.employeeId);

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      await emitEmployeeUpdate(io);
    }

    res.json(employee);
  } catch (err) {
    console.error("❌ Error updating employee PCS:", err);
    res.status(500).json({ error: err.message });
  }
});

// 5️⃣ Delete employee by custom employeeId
router.delete("/employees/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findOneAndDelete({ employeeId: employeeId });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    console.log("✅ Employee deleted:", employee.name, "ID:", employee.employeeId);

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      await emitEmployeeUpdate(io);
    }

    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting employee:", err);
    res.status(500).json({ error: err.message });
  }
});

// 6️⃣ Test endpoint to simulate database change
router.post("/test-update", async (req, res) => {
  try {
    // Find a random employee and increment their pcs
    const randomEmployee = await Employee.findOne();
    if (randomEmployee) {
      randomEmployee.pcs = (randomEmployee.pcs || 0) + 1;
      await randomEmployee.save();
      
      console.log(`🧪 Test update: ${randomEmployee.name} pcs: ${randomEmployee.pcs}`);
    }

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      await emitEmployeeUpdate(io);
    }

    res.json({ message: "Test update completed", employee: randomEmployee });
  } catch (err) {
    console.error("❌ Error in test update:", err);
    res.status(500).json({ error: err.message });
  }
});

// 7️⃣ Summary endpoint
router.get("/summary", async (req, res) => {
  try {
    const employees = await Employee.find();

    const lineTargets = {
      1: 1000,
      2: 800,
      3: 900,
      4: 1100,
      5: 950,
      6: 1050,
      7: 700,
      8: 850,
    };

    const totalProduction = employees.reduce(
      (sum, emp) => sum + (emp.pcs || 0),
      0
    );
    const activeWorkers = employees.length;
    const totalTarget = Object.values(lineTargets).reduce((a, b) => a + b, 0);
    const efficiencyRate = ((totalProduction / totalTarget) * 100).toFixed(2);

    res.json({ totalProduction, efficiencyRate, activeWorkers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8️⃣ Line performance endpoint
router.get("/line-performance", async (req, res) => {
  try {
    const employees = await Employee.find();

    // Fixed targets
    const lineTargets = {
      1: 1000,
      2: 800,
      3: 900,
      4: 1100,
      5: 950,
      6: 1050,
      7: 700,
      8: 850,
    };

    // Group actuals by line
    const lineTotals = employees.reduce((acc, emp) => {
      acc[emp.line] = (acc[emp.line] || 0) + (emp.pcs || 0);
      return acc;
    }, {});

    // Build response
    const lineData = Object.keys(lineTargets).map((line) => {
      const actual = lineTotals[line] || 0;
      const target = lineTargets[line];
      const efficiency = ((actual / target) * 100).toFixed(0);

      return {
        line: `Line ${line}`,
        target,
        actual,
        efficiency: Number(efficiency),
      };
    });

    res.json(lineData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
