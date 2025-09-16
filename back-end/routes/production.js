const express = require("express");
const ProductionPlan = require("../models/ProductionPlan");
const router = express.Router();

// Helper to calculate targets
const calculateTargets = (plan) => {
  const today = new Date();
  const end = new Date(plan.endDate);
  const remainingDays = Math.max(0, Math.ceil((end - today) / (1000*60*60*24)));
  const remainingUnits = plan.totalStock - plan.finishedUnits;
  const dailyTarget = remainingDays > 0 ? +(remainingUnits / remainingDays).toFixed(2) : 0;
  const weeklyTarget = +(dailyTarget * 7).toFixed(2);

  return { remainingUnits, remainingDays, dailyTarget, weeklyTarget };
};

// GET all production plans
router.get("/", async (req, res) => {
  try {
    const plans = await ProductionPlan.find();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new production plan
router.post("/", async (req, res) => {
  try {
    const { product, totalStock, startDate, endDate } = req.body;
    const plan = new ProductionPlan({ product, totalStock, startDate, endDate });
    const { remainingUnits, remainingDays, dailyTarget, weeklyTarget } = calculateTargets(plan);

    plan.remainingUnits = remainingUnits;
    plan.remainingDays = remainingDays;
    plan.dailyTarget = dailyTarget;
    plan.weeklyTarget = weeklyTarget;

    const savedPlan = await plan.save();
    res.status(201).json(savedPlan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update finishedUnits
router.put("/:id", async (req, res) => {
  try {
    const plan = await ProductionPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: "Plan not found" });

    plan.finishedUnits = req.body.finishedUnits ?? plan.finishedUnits;

    const { remainingUnits, remainingDays, dailyTarget, weeklyTarget } = calculateTargets(plan);
    plan.remainingUnits = remainingUnits;
    plan.remainingDays = remainingDays;
    plan.dailyTarget = dailyTarget;
    plan.weeklyTarget = weeklyTarget;

    const updatedPlan = await plan.save();
    res.json(updatedPlan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE plan
router.delete("/:id", async (req, res) => {
  try {
    await ProductionPlan.findByIdAndDelete(req.params.id);
    res.json({ message: "Plan deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
