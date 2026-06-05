const Income = require("../models/Income");
const Expense = require("../models/Expense");
const { Types } = require("mongoose");

// Dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new Types.ObjectId(String(userId));

    //Fetch total income
    const totalIncomeResult = await Income.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    //Fetch total expenses
    const totalExpenseResult = await Expense.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    //get income transaction for the last 60 days
    const last60DaysIncomeTransactions = await Income.find({
      userId: userObjectId,
      date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
    }).sort({ date: -1 });

    //get total income for the last 60 days
    const last60DaysIncome = last60DaysIncomeTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0,
    );

    //get expense transaction for the last 30 days
    const last30DaysExpenseTransactions = await Expense.find({
      userId: userObjectId,
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }).sort({ date: -1 });

    //get total expenses for the last 30 days
    const last30DaysExpense = last30DaysExpenseTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0,
    );

    //Fetch last five transactions
    const recentIncome = await Income.find({ userId: userObjectId })
      .sort({ date: -1 })
      .limit(5);
    const recentExpense = await Expense.find({ userId: userObjectId })
      .sort({ date: -1 })
      .limit(5);

    const last5Transactions = [
      ...recentIncome.map((transaction) => ({
        ...transaction.toObject(),
        type: "income",
      })),
      ...recentExpense.map((transaction) => ({
        ...transaction.toObject(),
        type: "expense",
      })),
    ]
      .sort((a, b) => b.date - a.date) //sort latest first
      .slice(0, 5);

    res.status(200).json({
      totalBalance:
        (totalIncomeResult[0]?.total || 0) -
        (totalExpenseResult[0]?.total || 0),
      totalIncome: totalIncomeResult[0]?.total || 0,
      totalExpense: totalExpenseResult[0]?.total || 0,
      last30DaysExpense: {
        total: last30DaysExpense,
        transactions: last30DaysExpenseTransactions,
      },
      last60DaysIncome: {
        total: last60DaysIncome,
        transactions: last60DaysIncomeTransactions,
      },
      recentTransactions: last5Transactions,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
