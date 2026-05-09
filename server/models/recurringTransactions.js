const mongoose = require("mongoose");
const users = require("./users");
const budgets = require("./budgets");

const recurringTransactionSchema = new mongoose.Schema({
  usersId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  budgetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Budget",
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  frequency: {
    type: String,
    enum: ["weekly", "monthly", "yearly"],
    required: true,
    default: "monthly",
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    default: null,
  },
  transactionDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date.now,
  },
  lastUpdated: {
    type: Date.now,
  },
});

module.exports = mongoose.model(
  "RecurringTransaction",
  recurringTransactionSchema,
);
