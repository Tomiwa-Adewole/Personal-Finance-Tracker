const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    limit: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      type: String, // Stored as "YYYY-MM" (e.g., "2026-11")
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Budget", budgetSchema);
