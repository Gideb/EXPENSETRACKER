const Income = require("../models/Income");
const Expense = require("../models/Expense");

const generatePDF = require("../utils/generatePDF");

const exportPDF = async (req, res) => {
  try {
    const userId = req.user.id;

    const incomes = await Income.find({ userId });
    const expenses = await Expense.find({ userId });

    const totalIncome = incomes.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const totalExpense = expenses.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const balance = totalIncome - totalExpense;

    generatePDF(res, {
      incomes,
      expenses,
      totalIncome,
      totalExpense,
      balance,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  exportPDF,
};