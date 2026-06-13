const Budget = require("../models/Budget");
const Expense = require("../models/Expense");

//add budget
const addBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { icon, category, limitAmount, month } = req.body;

    //prevent duplicate budget per category/month
    const existing = await Budget.findOne({ userId, category, month });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Budget already exists for this category and month" });
    }

    const budget = await Budget.create({
      userId,
      icon,
      category,
      limitAmount,
      month,
    });

    return res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get budgets
const getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;

    const budgets = await Budget.find({ userId }).sort({
      month: -1, // Changed from date to month for better sorting
    });

    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//update budget
const updateBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;

    const { icon, limitAmount, category, month } = req.body;

    const budget = await Budget.findOne({
      _id: budgetId,
      userId,
    });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    // update fields if provided
    if (icon) budget.icon = icon;
    if (limitAmount !== undefined) budget.limitAmount = limitAmount;
    if (category) budget.category = category;
    if (month) budget.month = month;

    await budget.save();

    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete budget
const deleteBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;

    const budget = await Budget.findOneAndDelete({
      _id: budgetId,
      userId,
    });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get budget summary (NEW)
const getBudgetSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current month (YYYY-MM format)
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Get all budgets for current month
    const budgets = await Budget.find({
      userId,
      month: currentMonth,
    });

    // If no budgets for current month, return empty summary
    if (budgets.length === 0) {
      return res.status(200).json({
        totalBudget: 0,
        totalSpent: 0,
        remainingBalance: 0,
        overBudgetCategories: 0,
        categoriesAtRisk: 0,
        percentUtilized: 0,
        message: "No budgets found for current month",
      });
    }

    // Calculate date range for current month
    const startDate = new Date(`${currentMonth}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // Get all expenses for current month
    const expenses = await Expense.find({
      userId,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    // Calculate spent amount per category
    const spentByCategory = {};
    expenses.forEach((expense) => {
      const category = expense.category;
      spentByCategory[category] =
        (spentByCategory[category] || 0) + expense.amount;
    });

    let totalBudget = 0;
    let totalSpent = 0;
    let overBudgetCategories = 0;
    let categoriesAtRisk = 0;

    // Calculate totals and track budget status
    budgets.forEach((budget) => {
      const spent = spentByCategory[budget.category] || 0;
      totalBudget += budget.limitAmount;
      totalSpent += spent;

      if (spent > budget.limitAmount) {
        overBudgetCategories++;
      } else if (spent >= budget.limitAmount * 0.8) {
        categoriesAtRisk++;
      }
    });

    const remainingBalance = totalBudget - totalSpent;
    const percentUtilized =
      totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    res.status(200).json({
      totalBudget,
      totalSpent,
      remainingBalance,
      overBudgetCategories,
      categoriesAtRisk,
      percentUtilized: Math.round(percentUtilized),
      month: currentMonth,
      totalCategories: budgets.length,
    });
  } catch (error) {
    console.error("Error in getBudgetSummary:", error);
    res.status(500).json({
      message: "Failed to fetch budget summary",
      error: error.message,
    });
  }
};

// Optional: Get budget summary for a specific month
const getBudgetSummaryByMonth = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.params; // Format: YYYY-MM

    // Validate month format
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        message: "Invalid month format. Please use YYYY-MM",
      });
    }

    // Get budgets for specified month
    const budgets = await Budget.find({
      userId,
      month,
    });

    if (budgets.length === 0) {
      return res.status(200).json({
        totalBudget: 0,
        totalSpent: 0,
        remainingBalance: 0,
        overBudgetCategories: 0,
        categoriesAtRisk: 0,
        percentUtilized: 0,
        month,
        message: "No budgets found for this month",
      });
    }

    // Calculate date range for specified month
    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // Get expenses for specified month
    const expenses = await Expense.find({
      userId,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    // Calculate spent amount per category
    const spentByCategory = {};
    expenses.forEach((expense) => {
      const category = expense.category;
      spentByCategory[category] =
        (spentByCategory[category] || 0) + expense.amount;
    });

    let totalBudget = 0;
    let totalSpent = 0;
    let overBudgetCategories = 0;
    let categoriesAtRisk = 0;

    budgets.forEach((budget) => {
      const spent = spentByCategory[budget.category] || 0;
      totalBudget += budget.limitAmount;
      totalSpent += spent;

      if (spent > budget.limitAmount) {
        overBudgetCategories++;
      } else if (spent >= budget.limitAmount * 0.8) {
        categoriesAtRisk++;
      }
    });

    const remainingBalance = totalBudget - totalSpent;
    const percentUtilized =
      totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    res.status(200).json({
      totalBudget,
      totalSpent,
      remainingBalance,
      overBudgetCategories,
      categoriesAtRisk,
      percentUtilized: Math.round(percentUtilized),
      month,
      totalCategories: budgets.length,
    });
  } catch (error) {
    console.error("Error in getBudgetSummaryByMonth:", error);
    res.status(500).json({
      message: "Failed to fetch budget summary for specified month",
      error: error.message,
    });
  }
};

module.exports = {
  addBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
  getBudgetSummaryByMonth, 
};
