const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const Transaction = require("../models/transactions");
const Account = require("../models/accounts");

router.use(requireAuth);

async function applyBalanceChange(accountId, userId, amount, type, transferAccountId) { // applies balance changes to the account
  if (type === "income") {
    await Account.findOneAndUpdate(
      { _id: accountId, userId },
      { $inc: { balance: amount }, lastUpdated: Date.now() }
    );
  } else if (type === "expense") {
    await Account.findOneAndUpdate(
      { _id: accountId, userId },
      { $inc: { balance: -amount }, lastUpdated: Date.now() }
    );
  } else if (type === "transfer" && transferAccountId) {
    await Account.findOneAndUpdate(
      { _id: accountId, userId },
      { $inc: { balance: -amount }, lastUpdated: Date.now() }
    );
    await Account.findOneAndUpdate(
      { _id: transferAccountId, userId },
      { $inc: { balance: amount }, lastUpdated: Date.now() }
    );
  }
}

async function reverseBalanceChange(accountId, userId, amount, type, transferAccountId) { // adds income to the account and subtracts it from the transfer account
  if (type === "income") {
    await Account.findOneAndUpdate(
      { _id: accountId, userId },
      { $inc: { balance: -amount }, lastUpdated: Date.now() }
    );
  } else if (type === "expense") {
    await Account.findOneAndUpdate(
      { _id: accountId, userId },
      { $inc: { balance: amount }, lastUpdated: Date.now() }
    );
  } else if (type === "transfer" && transferAccountId) {
    await Account.findOneAndUpdate(
      { _id: accountId, userId },
      { $inc: { balance: amount }, lastUpdated: Date.now() }
    );
    await Account.findOneAndUpdate(
      { _id: transferAccountId, userId },
      { $inc: { balance: -amount }, lastUpdated: Date.now() }
    );
  }
}

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
    if (!data) return res.status(404).json({ message: "Transaction not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Creates a transaction and updates account balance(s)
router.post("/", async (req, res) => { // creates a new transaction and updates account balance
  try {
    const { accountId, type, amount, transferAccountId } = req.body;

    const account = await Account.findOne({ _id: accountId, userId: req.userId });
    if (!account) return res.status(404).json({ error: "Account not found" });

    if (transferAccountId) {
      const dest = await Account.findOne({ _id: transferAccountId, userId: req.userId });
      if (!dest) return res.status(404).json({ error: "Destination account not found" });
    }

    const data = await Transaction.create({
      ...req.body,
      userId: req.userId,
    });

    await applyBalanceChange(accountId, req.userId, Number(amount), type, transferAccountId);

    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Updates a transaction and adjusts account balances
router.patch("/:id", async (req, res) => {
  try {
    const existing = await Transaction.findOne({ _id: req.params.id, userId: req.userId });
    if (!existing) return res.status(404).json({ message: "Not found" });

    await reverseBalanceChange(
      existing.accountId, req.userId, existing.amount, existing.type, existing.transferAccountId
    );

    const updated = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body, lastUpdated: Date.now() },
      { new: true, runValidators: true }
    );

    await applyBalanceChange(
      updated.accountId, req.userId, updated.amount, updated.type, updated.transferAccountId
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Deletes a transaction and reverses the balance change
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deleted) return res.status(404).json({ message: "Not found" });

    await reverseBalanceChange(
      deleted.accountId, req.userId, deleted.amount, deleted.type, deleted.transferAccountId
    );

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;