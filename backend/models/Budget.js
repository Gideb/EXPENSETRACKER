const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    icon: { type: String },
    
    category: {
      type: String,
      required: true,
      trim: true,
    },

    limitAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    spentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    month: {
      type: String,
      required: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
    },

    currency: {
      type: String,
      default: "GHS",
    },

    isExceeded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

BudgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Budget", BudgetSchema);
