const Goal = require('../models/Goal');

// ==============================
// Create Goal
// ==============================
exports.createGoal = async (req, res) => {
  try {
    const userId = req.user.id;

    const { title, icon, targetAmount, targetDate, description } = req.body;

    if (!title || !targetAmount || !targetDate) {
      return res.status(400).json({
        message: 'Title, target amount and target date are required.',
      });
    }

    const goal = await Goal.create({
      userId,
      title,
      icon,
      targetAmount,
      targetDate,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Goal created successfully.',
      goal,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to create goal.',
    });
  }
};

// ==============================
// Get All Goals
// ==============================
exports.getGoals = async (req, res) => {
  try {
    const userId = req.user.id;

    const goals = await Goal.find({ userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: goals.length,
      goals,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch goals.',
    });
  }
};

// ==============================
// Get Single Goal
// ==============================
exports.getGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({
        message: 'Goal not found.',
      });
    }

    res.status(200).json({
      success: true,
      goal,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch goal.',
    });
  }
};

// ==============================
// Update Goal
// ==============================
exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({
        message: 'Goal not found.',
      });
    }

    const { title, icon, targetAmount, targetDate, description, status } = req.body;

    if (title !== undefined) goal.title = title;
    if (icon !== undefined) goal.icon = icon;
    if (targetAmount !== undefined) goal.targetAmount = targetAmount;
    if (targetDate !== undefined) goal.targetDate = targetDate;
    if (description !== undefined) goal.description = description;
    if (status !== undefined) goal.status = status;

    // Automatically mark completed
    if (goal.savedAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully.',
      goal,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to update goal.',
    });
  }
};

// ==============================
// Update Saved Amount
// ==============================
exports.updateSavedAmount = async (req, res) => {
  try {
    const { amount } = req.body;

    if (amount === undefined) {
      return res.status(400).json({
        message: 'Amount is required.',
      });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({
        message: 'Goal not found.',
      });
    }

    goal.savedAmount += Number(amount);

    if (goal.savedAmount < 0) {
      goal.savedAmount = 0;
    }

    if (goal.savedAmount >= goal.targetAmount) {
      goal.savedAmount = goal.targetAmount;
      goal.status = 'completed';
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Savings updated successfully.',
      goal,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to update savings.',
    });
  }
};

// ==============================
// Delete Goal
// ==============================
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({
        message: 'Goal not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully.',
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete goal.',
    });
  }
};

// ==============================
// Goal Summary
// ==============================
exports.getGoalSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const goals = await Goal.find({ userId });

    const totalGoals = goals.length;

    const activeGoals = goals.filter((g) => g.status === 'active').length;

    const completedGoals = goals.filter((g) => g.status === 'completed').length;

    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

    const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);

    const remaining = totalTarget - totalSaved;

    res.status(200).json({
      success: true,
      summary: {
        totalGoals,
        activeGoals,
        completedGoals,
        totalTarget,
        totalSaved,
        remaining,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch goal summary.',
    });
  }
};
