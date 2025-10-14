const express = require("express");
const router = express.Router();
const LineManagement = require("../models/LineManagement");

// GET all line management records
router.get("/", async (req, res) => {
    try {
        const lines = await LineManagement.find();
        res.json(lines);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET a single line management record
router.get("/:id", async (req, res) => {
    try {
        const line = await LineManagement.findById(req.params.id);
        if (!line) {
            return res.status(404).json({ message: "Line not found" });
        }
        res.json(line);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create a new line management record
router.post("/", async (req, res) => {
    const line = new LineManagement(req.body);
    try {
        const newLine = await line.save();
        res.status(201).json(newLine);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH update a line management record
router.patch("/:id", async (req, res) => {
    try {
        const line = await LineManagement.findById(req.params.id);
        if (!line) {
            return res.status(404).json({ message: "Line not found" });
        }

        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                line[key] = req.body[key];
            }
        });

        const updatedLine = await line.save();
        res.json(updatedLine);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a line management record
router.delete("/:id", async (req, res) => {
    try {
        const line = await LineManagement.findById(req.params.id);
        if (!line) {
            return res.status(404).json({ message: "Line not found" });
        }
        await line.deleteOne();
        res.json({ message: "Line deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
module.exports = router;

