const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ["income", "expense", "transfer"],
    required: true,
  },
  amount: { type: Number, required: true, min: 0 },
  description: { type: String, trim: true },
  merchant: { type: String, trim: true },
  date: { type: Date, default: Date.now, index: true },

  budgetId: { type: mongoose.Schema.Types.ObjectId, ref: "Budget" }, // links to a budget category
  categoryId: { type: mongoose.Schema.Types.ObjectId },

  transferAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" }, // links to a an account for transfers
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", transactionSchema);
