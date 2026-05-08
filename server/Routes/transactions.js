const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const Account = require("../models/accounts");

router.use(requireAuth);

// Get all accounts
router.get("/", async (req, res) => {
  try {
    const data = await Account.find({ userId: req.userId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single account
router.get("/:id", async (req, res) => {
  try {
    const data = await Account.fineOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!data) return res.status(404).json({ message: "Account not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Creates a account
router.post("/", async (req, res) => {
  try {
    const data = await Account.create({
      ...req.body,
      userId: req.userId,
    });
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Updates an Account
router.patch("/:id", async (req, res) => {
  try {
    const updated = await Account.findOneAndUpdate(
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

// Deletes an Account
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Account.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;