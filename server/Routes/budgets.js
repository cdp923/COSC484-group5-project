const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const Budget = require("../models/budgets");

router.use(requireAuth);

// Get all budgets
router.get("/", async (req, res) => {
  try {
    const data = await Budget.find({ userId: req.userId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single budget
router.get("/:id", async (req, res) => {
  try {
    const data = await Budget.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!data) return res.status(404).json({ message: "Budget not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Creates a budget
router.post("/", async (req, res) => {
  try {
    const data = await Budget.create({
      ...req.body,
      userId: req.userId,
    });
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Updates a budget
router.patch("/:id", async (req, res) => {
  try {
    const updated = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body, lastUpdated: Date.now() },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Deletes a budget
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;