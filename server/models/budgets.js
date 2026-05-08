const mongoose = require("mongoose");

const budgetCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    limit: { type: Number, required: true, min: 0 },
    spent: { type: Number, default: 0 },
  },
);

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  name: { type: String, required: true, trim: true },
  period: {
    type: String,
    enum: ["weekly", "monthly", "yearly"],
    default: "monthly",
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  totalLimit: { type: Number, required: true, min: 0 },
  categories: { type: [budgetCategorySchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Budget", budgetSchema);

