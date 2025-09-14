const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");


// 1️⃣ Create new employee
router.post("/employees", async (req, res) => {
  try {
    const { name, line, pcs } = req.body;
    const employee = new Employee({ name, line, pcs });
    await employee.save();

    // 🔹 Emit ALL employees after saving new one
    const io = req.app.get("io");
    const allEmployees = await Employee.find();
    io.emit("leadingLineUpdate", allEmployees);

    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 2️⃣ Get all employees
router.get("/employees", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
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
