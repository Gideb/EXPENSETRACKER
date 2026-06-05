const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    icon: { type: String },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    /*  date: { type: Date, default: Date.now }, */
  },
  { timestamps: true },
);

ExpenseSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Expense", ExpenseSchema);
