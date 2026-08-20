const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const User = require('../models/User');

const { getYearDateRange } = require('../utils/dateRange');

const generatePDF = require('../utils/generatePDF');

// Build user information and report period
const getCommonReportData = async (userId, incomes = [], expenses = []) => {
  const user = await User.findById(userId).select('fullName email');

  const dates = [...incomes.map((item) => item.date), ...expenses.map((item) => item.date)]
    .filter(Boolean)
    .sort((a, b) => new Date(a) - new Date(b));

  return {
    user: {
      name: user?.fullName || 'User',
      email: user?.email || 'user@exp.com',
    },

    period: {
      start: dates.length ? dates[0] : new Date(),
      end: dates.length ? dates[dates.length - 1] : new Date(),
    },

    companyName: process.env.COMPANY_NAME || 'Expense Tracker',
  };
};

// FULL FINANCIAL STATEMENT PDF
const exportPDF = async (req, res) => {
  const normalizeCategory = (value) => {
    return String(value || 'Other')
      .trim()
      .toLowerCase();
  };
  try {
    const userId = req.user.id;

    const { startDate, endDate } = req.query;

    // --------------------------------------------------
    // Validate dates
    // --------------------------------------------------

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required.',
      });
    }

    const reportStartDate = new Date(`${startDate}T00:00:00.000Z`);
    const reportEndDate = new Date(`${endDate}T23:59:59.999Z`);

    if (Number.isNaN(reportStartDate.getTime()) || Number.isNaN(reportEndDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report dates.',
      });
    }

    if (reportStartDate > reportEndDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be later than end date.',
      });
    }

    // --------------------------------------------------
    // Get user
    // --------------------------------------------------

    const user = await User.findById(userId).select('fullName email').lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // --------------------------------------------------
    // Get transactions for selected period
    // --------------------------------------------------

    const [incomes, expenses] = await Promise.all([
      Income.find({
        userId,
        date: {
          $gte: reportStartDate,
          $lte: reportEndDate,
        },
      })
        .sort({ date: 1 })
        .lean(),

      Expense.find({
        userId,
        date: {
          $gte: reportStartDate,
          $lte: reportEndDate,
        },
      })
        .sort({ date: 1 })
        .lean(),
    ]);

    // --------------------------------------------------
    // Summary
    // --------------------------------------------------

    const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const balance = totalIncome - totalExpense;

    const savingsRate = totalIncome > 0 ? Number(((balance / totalIncome) * 100).toFixed(2)) : 0;

    // --------------------------------------------------
    // Combine transactions
    // --------------------------------------------------

    const transactions = [
      ...incomes.map((income) => ({
        date: income.date,
        type: 'Income',
        description: income.source || 'Income',
        category: income.source || 'Other',
        amount: Number(income.amount || 0),
      })),

      ...expenses.map((expense) => ({
        date: expense.date,
        type: 'Expense',
        description: expense.category || 'Expense',
        category: expense.category || 'Other',
        amount: Number(expense.amount || 0),
      })),
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    // --------------------------------------------------
    // Get budgets relevant to the report period
    // --------------------------------------------------

    /* const startMonth = reportStartDate.getUTCMonth() + 1;
    const startYear = reportStartDate.getUTCFullYear();

    const endMonth = reportEndDate.getUTCMonth() + 1;
    const endYear = reportEndDate.getUTCFullYear(); */

    // --------------------------------------------------
    // Get budgets relevant to the report period
    // --------------------------------------------------

    const budgets = await Budget.find({ userId }).sort({ year: 1, month: 1 }).lean();

    const filteredBudgets = budgets.filter((budget) => {
      const budgetYear = Number(budget.year);
      const budgetMonth = Number(budget.month);

      const budgetPeriod = budgetYear * 12 + (budgetMonth - 1);

      const startPeriod = reportStartDate.getUTCFullYear() * 12 + reportStartDate.getUTCMonth();

      const endPeriod = reportEndDate.getUTCFullYear() * 12 + reportEndDate.getUTCMonth();

      return budgetPeriod >= startPeriod && budgetPeriod <= endPeriod;
    });

    // Calculate budget performance
    const expenseMap = {};

    expenses.forEach((expense) => {
      const category = normalizeCategory(expense.category);

      const expenseDate = new Date(expense.date);

      const year = expenseDate.getUTCFullYear();
      const month = expenseDate.getUTCMonth() + 1;

      const key = `${year}-${String(month).padStart(2, '0')}-${category}`;

      if (!expenseMap[key]) {
        expenseMap[key] = 0;
      }

      expenseMap[key] += Number(expense.amount || 0);
    });

    const budgetData = filteredBudgets.map((budget) => {
      const limit = Number(budget.limitAmount || 0);

      const category = normalizeCategory(budget.category);

      const month = String(Number(budget.month)).padStart(2, '0');

      const key = `${Number(budget.year)}-${month}-${category}`;

      const spent = expenseMap[key] || 0;

      const remaining = limit - spent;

      const percentage = limit > 0 ? Number(((spent / limit) * 100).toFixed(2)) : 0;

      let status = 'On Track';

      if (percentage > 100) {
        status = 'Exceeded';
      } else if (percentage === 100) {
        status = 'Completed';
      } else if (percentage >= 80) {
        status = 'Near Limit';
      }

      return {
        id: budget._id,
        icon: budget.icon || '💰',
        category: budget.category,
        month: budget.month,
        year: budget.year,
        budget: limit,
        spent,
        remaining,
        percentage,
        status,
      };
    });
    // --------------------------------------------------
    // Get savings goals
    // --------------------------------------------------

    const goals = await Goal.find({
      userId,
      targetDate: {
        $gte: reportStartDate,
        $lte: reportEndDate,
      },
    })
      .sort({ targetDate: 1 })
      .lean();

    const goalData = goals.map((goal) => {
      const targetAmount = Number(goal.targetAmount || 0);
      const savedAmount = Number(goal.savedAmount || 0);

      const progress =
        targetAmount > 0
          ? Math.min(Number(((savedAmount / targetAmount) * 100).toFixed(2)), 100)
          : 0;

      return {
        id: goal._id,
        title: goal.title,
        icon: goal.icon || '',
        targetAmount,
        savedAmount,
        progress,
        targetDate: goal.targetDate || null,
        status: goal.status,
      };
    });

    // --------------------------------------------------
    // Generate PDF
    // --------------------------------------------------

    await generatePDF(res, {
      reportType: 'financial',
      title: 'Financial Statement',

      user: {
        name: user.fullName || 'User',
        email: user.email || '',
      },

      period: {
        start: reportStartDate,
        end: reportEndDate,
      },

      companyName: process.env.COMPANY_NAME || 'Expense Tracker',

      summary: {
        income: totalIncome,
        expense: totalExpense,
        balance,
        savingsRate,
      },

      // Add these for generatePDF()
      startDate: reportStartDate,
      endDate: reportEndDate,
      totalIncome,
      totalExpense,
      balance,
      incomes,
      expenses,
      transactions,
      budgets: budgetData,
      goals: goalData,
    });
  } catch (error) {
    console.error('Financial Statement PDF Error:', error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate financial statement.',
      });
    } else {
      res.end();
    }
  }
};

// INCOME REPORT
const exportIncomePDF = async (req, res) => {
  try {
    const userId = req.user.id;

    const incomes = await Income.find({ userId }).sort({ date: 1 });

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);

    const commonData = await getCommonReportData(userId, incomes, []);

    await generatePDF(res, {
      reportType: 'income',

      title: 'Income Report',

      ...commonData,

      summary: {
        income: totalIncome,
      },

      incomes,
    });
  } catch (error) {
    console.error('Income PDF Error:', error);

    if (!res.headersSent) {
      res.status(500).json({
        message: 'Failed to export income report.',
      });
    } else {
      res.end();
    }
  }
};

// EXPENSE REPORT
const exportExpensePDF = async (req, res) => {
  try {
    const userId = req.user.id;

    const expenses = await Expense.find({ userId }).sort({ date: 1 });

    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

    const commonData = await getCommonReportData(userId, [], expenses);

    await generatePDF(res, {
      reportType: 'expense',

      title: 'Expense Report',

      ...commonData,

      summary: {
        expense: totalExpense,
      },

      expenses,
    });
  } catch (error) {
    console.error('Expense PDF Error:', error);

    if (!res.headersSent) {
      res.status(500).json({
        message: 'Failed to export expense report.',
      });
    } else {
      res.end();
    }
  }
};

// TRANSACTION REPORT
const exportTransactionPDF = async (req, res) => {
  try {
    const userId = req.user.id;

    const incomes = await Income.find({ userId });

    const expenses = await Expense.find({ userId });

    const transactions = [
      ...incomes.map((item) => ({
        date: item.date,
        type: 'Income',
        category: item.source || item.category,
        /* description: item.description || item.source, */
        amount: item.amount,
      })),

      ...expenses.map((item) => ({
        date: item.date,
        type: 'Expense',
        category: item.category,
        /* description: item.description || item.category, */
        amount: item.amount,
      })),
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);

    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

    const commonData = await getCommonReportData(userId, incomes, expenses);

    await generatePDF(res, {
      reportType: 'transaction',

      title: 'Transaction Report',

      ...commonData,

      summary: {
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense,
      },

      transactions,
    });
  } catch (error) {
    console.error('Transaction PDF Error:', error);

    if (!res.headersSent) {
      res.status(500).json({
        message: 'Failed to export transaction report.',
      });
    } else {
      res.end();
    }
  }
};

module.exports = {
  exportPDF,
  exportIncomePDF,
  exportExpensePDF,
  exportTransactionPDF,
};
