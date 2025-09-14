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

// 1️⃣ Create new employee
router.post("/employees", async (req, res) => {
  try {
    const { name, line, pcs } = req.body;
    const employee = new Employee({ name, line, pcs });
    await employee.save();

    console.log("✅ Employee created:", employee.name);

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

// 3️⃣ Update employee
router.put("/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, line, pcs } = req.body;
    
    const employee = await Employee.findByIdAndUpdate(
      id, 
      { name, line, pcs }, 
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    console.log("✅ Employee updated:", employee.name);

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

// 4️⃣ Update employee pieces only (for production updates)
router.patch("/employees/:id/pcs", async (req, res) => {
  try {
    const { id } = req.params;
    const { pcs } = req.body;
    
    const employee = await Employee.findByIdAndUpdate(
      id, 
      { pcs }, 
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    console.log("✅ Employee PCS updated:", employee.name, "->", pcs);

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

// 5️⃣ Delete employee
router.delete("/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    console.log("✅ Employee deleted:", employee.name);

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

// // 👉 Summary endpoint
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



// 👉 Line performance endpoint
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
