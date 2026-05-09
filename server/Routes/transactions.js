const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const Transaction = require("../models/transactions");

router.use(requireAuth);

// Get all transactions
router.get("/", async (req, res) => {
  try {
    const data = await Transaction.find({ userId: req.userId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single transaction
router.get("/:id", async (req, res) => {
  try {
    const data = await Transaction.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!data)
      return res.status(404).json({ message: "Transaction not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Creates a transaction
router.post("/", async (req, res) => {
  try {
    const data = await Transaction.create({
      ...req.body,
      userId: req.userId,
    });
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Updates an Transaction
router.patch("/:id", async (req, res) => {
  try {
    const updated = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body, lastUpdated: Date.now() },
      { new: true, runValidators: true },
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Deletes an Transaction
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
