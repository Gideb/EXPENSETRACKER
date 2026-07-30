const Income = require('../models/Income');
const Expense = require('../models/Expense');
const User = require('../models/User');

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

/* ======================================================
   FULL FINANCIAL REPORT
====================================================== */

const exportPDF = async (req, res) => {
  try {
    const userId = req.user.id;

    const incomes = await Income.find({ userId }).sort({ date: 1 });

    const expenses = await Expense.find({ userId }).sort({ date: 1 });

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);

    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

    const balance = totalIncome - totalExpense;

    const commonData = await getCommonReportData(userId, incomes, expenses);

    await generatePDF(res, {
      title: 'Financial Report',

      ...commonData,

      summary: {
        income: totalIncome,
        expense: totalExpense,
        balance,
      },

      incomes,
      expenses,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to generate financial report.',
    });
  }
};

/* ======================================================
    FINANCIAL SUMMARY REPORT
====================================================== */

const getFinancialReport = async (req, res) => {
  try {
    const userId = req.user.id;

    const incomes = await Income.find({ userId });

    const expenses = await Expense.find({ userId });

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);

    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

    res.json({
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        savingsRate: totalIncome
          ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1)
          : 0,
      },

      transactions: [
        ...incomes.map((i) => ({
          date: i.date,
          category: i.source || 'Income',
          amount: i.amount,
          type: 'income',
        })),

        ...expenses.map((e) => ({
          date: e.date,
          category: e.category,
          amount: e.amount,
          type: 'expense',
        })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date)),
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Failed loading report',
    });
  }
};

/* ======================================================
    MONTHLY REPORT
====================================================== */

const getMonthlyReport = async (req, res) => {
  try {
    const userId = req.user.id;

    const incomes = await Income.find({ userId });

    const expenses = await Expense.find({ userId });

    const monthly = {};

    incomes.forEach((item) => {
      const month = new Date(item.date).toLocaleString('default', { month: 'short' });

      if (!monthly[month])
        monthly[month] = {
          income: 0,
          expenses: 0,
        };

      monthly[month].income += item.amount;
    });

    expenses.forEach((item) => {
      const month = new Date(item.date).toLocaleString('default', { month: 'short' });

      if (!monthly[month])
        monthly[month] = {
          income: 0,
          expenses: 0,
        };

      monthly[month].expenses += item.amount;
    });

    res.json(
      Object.keys(monthly).map((month) => ({
        month,
        ...monthly[month],
      }))
    );
  } catch (error) {
    res.status(500).json({
      message: 'Monthly report failed',
    });
  }
};

/* ======================================================
    CATEGORY ANALYSIS REPORT
====================================================== */

const getCategoryAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;

    const expenses = await Expense.find({ userId });

    const categories = {};

    expenses.forEach((exp) => {
      if (!categories[exp.category]) categories[exp.category] = 0;

      categories[exp.category] += exp.amount;
    });

    const result = Object.entries(categories).map(([category, amount]) => ({
      category,
      amount,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Category analysis failed',
    });
  }
};

/* ======================================================
   BUDGET PERFORMANCE REPORT
====================================================== */

const getBudgetPerformance = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgets = await Budget.find({ userId });
    const expenses = await Expense.find({ userId });
    const performance = budgets.map((budget) => {
      const categoryExpenses = expenses
        .filter((expense) => expense.category.toLowerCase() === budget.category.toLowerCase())
        .reduce((sum, expense) => sum + expense.amount, 0);

      const percentage =
        budget.limitAmount > 0 ? ((categoryExpenses / budget.limitAmount) * 100).toFixed(1) : 0;

      return {
        category: budget.category,
        budgetAmount: budget.limitAmount,
        spentAmount: categoryExpenses,
        remaining: budget.limitAmount - categoryExpenses,
        percentageUsed: Number(percentage),
        status:
          categoryExpenses > budget.limitAmount
            ? 'Over Budget'
            : categoryExpenses >= budget.limitAmount * 0.8
              ? 'Near Limit'
              : 'Healthy',
      };
    });

    const summary = {
      totalBudget: performance.reduce((sum, item) => sum + item.budgetAmount, 0),

      totalSpent: performance.reduce((sum, item) => sum + item.spentAmount, 0),

      totalRemaining: performance.reduce((sum, item) => sum + item.remaining, 0),

      overBudgetCategories: performance.filter((item) => item.status === 'Over Budget').length,
    };
    res.json({
      summary,
      performance,
    });
  } catch (error) {
    console.error('Budget performance error:', error);
    res.status(500).json({
      message: 'Failed to generate budget performance report',
    });
  }
};

/* ======================================================
   INCOME REPORT
====================================================== */

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
    console.error(error);

    res.status(500).json({
      message: 'Failed to export income report.',
    });
  }
};

/* ======================================================
   EXPENSE REPORT
====================================================== */

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
    console.error(error);

    res.status(500).json({
      message: 'Failed to export expense report.',
    });
  }
};

/* ======================================================
   TRANSACTION REPORT
====================================================== */

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
    console.error(error);

    res.status(500).json({
      message: 'Failed to export transaction report.',
    });
  }
};

module.exports = {
  exportPDF,
  exportIncomePDF,
  exportExpensePDF,
  exportTransactionPDF,

  getFinancialReport,
  getMonthlyReport,
  getCategoryAnalysis,
  getBudgetPerformance,
};
