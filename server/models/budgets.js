const mongoose = require("mongoose");
const MimeNode = require("nodemailer/lib/mime-node");

const budgetCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  limit: {
    type: Number,
    required: true,
    min: 0,
  },
  spent: {
    type: Number,
    default: 0,
  },
});

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
  categories: { type: [budgetCategorySchema], default: [] },
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
