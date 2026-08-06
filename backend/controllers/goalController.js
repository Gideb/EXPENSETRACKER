const Goal = require('../models/Goal');

const normalizeGoalStatus = (goal) => {
  if (goal.status === 'archived') {
    return 'archived';
  }

  if (goal.savedAmount >= goal.targetAmount) {
    return 'completed';
  }

  return 'active';
};

// Create Goal
const createGoal = async (req, res) => {
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
      status: 'active',
      archivedAt: null,
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

// Get All Goals
const getGoals = async (req, res) => {
  try {
    const userId = req.user.id;

    const goals = await Goal.find({ userId }).sort({
      createdAt: -1,
    });

    const normalizedGoals = goals.map((goal) => {
      const normalizedStatus = normalizeGoalStatus(goal);
      if (goal.status !== normalizedStatus) {
        goal.status = normalizedStatus;
        if (normalizedStatus === 'active') {
          goal.archivedAt = null;
        }
      }
      return goal;
    });

    await Promise.all(normalizedGoals.map((goal) => goal.save()));

    res.status(200).json({
      success: true,
      count: normalizedGoals.length,
      goals: normalizedGoals,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch goals.',
    });
  }
};

// Get Single Goal
const getGoal = async (req, res) => {
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

    /*   const formattedGoals = goals.map((goal) => {
      const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0);
      const excess = Math.max(goal.savedAmount - goal.targetAmount, 0);

      return {
        ...goal.toObject(),
        stats: {
          remaining,
          excess,
          progress: Math.min((goal.savedAmount / goal.targetAmount) * 100, 100),
          actualProgress: (goal.savedAmount / goal.targetAmount) * 100,
        },
      };
    });

    res.status(200).json({
      success: true,
      count: formattedGoals.length,
      goals: formattedGoals,
    }); */

    const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0);
    const excess = Math.max(goal.savedAmount - goal.targetAmount, 0);

    res.status(200).json({
      success: true,
      goal: {
        ...goal.toObject(),
        stats: {
          remaining,
          excess,
          progress: Math.min((goal.savedAmount / goal.targetAmount) * 100, 100),
          actualProgress: (goal.savedAmount / goal.targetAmount) * 100,
        },
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch goal.',
    });
  }
};

// Update Goal
const updateGoal = async (req, res) => {
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

    if (status !== undefined) {
      if (status === 'archived') {
        goal.status = 'archived';
        goal.archivedAt = goal.archivedAt || new Date();
      } else if (status === 'active') {
        goal.status = 'active';
        goal.archivedAt = null;
      } else if (status === 'completed') {
        goal.status = 'completed';
        goal.archivedAt = null;
      }
    }

    if (goal.status !== 'archived') {
      goal.status = normalizeGoalStatus(goal);
      goal.archivedAt = null;
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

// Update Saved Amount
const updateSavedAmount = async (req, res) => {
  try {
    const { amount } = req.body;

    if (amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required.',
      });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found.',
      });
    }

    const updateAmount = Number(amount);

    if (isNaN(updateAmount)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount.',
      });
    }

    const previousSaved = goal.savedAmount;
    const newSaved = previousSaved + updateAmount;

    // Don't allow savings below zero
    goal.savedAmount = Math.max(newSaved, 0);

    const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0);
    const excess = Math.max(goal.savedAmount - goal.targetAmount, 0);

    goal.status = normalizeGoalStatus(goal);
    if (goal.status !== 'archived') {
      goal.archivedAt = null;
    }

    await goal.save();

    let message = 'Savings updated successfully.';

    if (excess > 0) {
      message = `Goal completed! You exceeded your target by GH₵${excess.toFixed(2)}.`;
    } else if (remaining === 0) {
      message = 'Congratulations! Goal completed.';
    }

    res.status(200).json({
      success: true,
      message,
      goal,
      stats: {
        remaining,
        excess,
        progress: Math.min((goal.savedAmount / goal.targetAmount) * 100, 100),
        actualProgress: (goal.savedAmount / goal.targetAmount) * 100,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to update savings.',
    });
  }
};

// Archive / Restore Goal
const archiveGoal = async (req, res) => {

  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found.',
      });
    }

    if (goal.status === 'archived') {
      goal.archivedAt = null;

      if (goal.savedAmount >= goal.targetAmount) {
        goal.status = 'completed';
      } else {
        goal.status = 'active';
      }
    } else {
      goal.status = 'archived';
      goal.archivedAt = new Date();
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message:
        goal.status === 'archived' ? 'Goal archived successfully.' : 'Goal restored successfully.',
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

// Delete Goal
const deleteGoal = async (req, res) => {
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

// Goal Summary
const getGoalSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const goals = await Goal.find({ userId });

    const totalGoals = goals.length;

    const activeGoals = goals.filter((g) => g.status === 'active').length;

    const completedGoals = goals.filter((g) => g.status === 'completed').length;

    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

    const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);

    const remaining = goals.reduce((sum, g) => {
      return sum + Math.max(g.targetAmount - g.savedAmount, 0);
    }, 0);

    const totalExcess = goals.reduce((sum, g) => {
      return sum + Math.max(g.savedAmount - g.targetAmount, 0);
    }, 0);

    res.status(200).json({
      success: true,
      summary: {
        totalGoals,
        activeGoals,
        completedGoals,
        totalTarget,
        totalSaved,
        remaining,
        totalExcess,
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


module.exports = {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  updateSavedAmount,
  getGoalSummary,
  archiveGoal,
};