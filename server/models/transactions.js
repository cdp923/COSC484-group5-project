const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  account_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recurring_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RecurringTransaction",
    default: null,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  merchant: {
    type: String,
  },
  transactionDate: {
    type: Date,
    required: true,
  },
  comment: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
