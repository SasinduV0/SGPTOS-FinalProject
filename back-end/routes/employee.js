const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");

// 1️⃣ Create new employee
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

module.exports = router;
