const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    icon: {
      type: String,
      default: '',
    },

    targetAmount: {
      type: Number,
      required: true,
      min: 1,
    },

    savedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    targetDate: {
      type: Date,
      required: true,
    },

    description: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },

    archivedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

GoalSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Goal', GoalSchema);
