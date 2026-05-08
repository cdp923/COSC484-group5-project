const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const Account = require("../models/accounts");

router.use(requireAuth);

// Get All
router.get("/", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const recurringTransactionsCollection = db.collection(
      "recurringTransactions",
    );

    const recurringTransactions = await db
      .collection("recurringTransactions")
      .find()
      .toArray();

    res.json(recurringTransactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get One
router.get("/:id", async (req, res) => {});

// Create One
router.post("/", async (req, res) => {});

// Update One
router.patch("/:id", async (req, res) => {});

// Delete One
router.delete("/:id", async (req, res) => {});

module.exports = router;
