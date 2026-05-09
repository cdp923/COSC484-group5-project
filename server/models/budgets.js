const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  targetBalance: {
    type: Number,
    required: true,
  },
  currentBalance: {
    type: Number,
    default: 0,
  },
  period: {
    type: String,
    enum: ["weekly", "monthly", "yearly"],
    default: "monthly",
  },
  categories: { type: [budgetSchema], default: [] },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Budget", budgetSchema);
