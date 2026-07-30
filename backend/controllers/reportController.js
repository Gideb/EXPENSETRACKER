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
};
