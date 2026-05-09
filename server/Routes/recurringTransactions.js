const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const RecurringTransaction = require("../models/recurringTransactions");

router.use(requireAuth);

// Get all recurring transactions
router.get("/", async (req, res) => {
  try {
    const data = await RecurringTransaction.find({ userId: req.userId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get active recurring transactions
router.get("/active", async (req, res) => {
  try {
    const data = await RecurringTransaction.find({
      userId: req.userId,
      isActive: true,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create One
router.post("/", async (req, res) => {
  try {
    const data = await RecurringTransaction.create({
      ...req.body,
      userId: req.userId,
    });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deactivate a recurring transaction
router.patch("/:id/deactivate", async (req, res) => {
  try {
    const updated = await RecurringTransaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isActive: false, endDate: Date.now(), lastUpdated: Date.now() },
      { returnDocument: "after", runValidators: true },
    );
    if (!updated)
      return res.status(404).json({ error: "Recurring transaction not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get one recurring transaction
router.get("/:id", async (req, res) => {
  try {
    const data = await RecurringTransaction.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!data)
      return res.status(404).json({ error: "Recurring transaction not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a recurring transaction
router.patch("/:id", async (req, res) => {
  try {
    const updated = await RecurringTransaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body, lastUpdated: Date.now() },
      { returnDocument: "after", runValidators: true },
    );
    if (!updated)
      return res.status(404).json({ error: "Recurring transaction not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete One
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await RecurringTransaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!deleted)
      return res.status(404).json({ error: "Recurring transaction not found" });
    res.json({ message: "Recurring transaction deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
