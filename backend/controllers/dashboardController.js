const Income = require("../models/Income");
const Expense = require("../models/Expense");
const { Types } = require("mongoose");

exports.getDashboardData = async (req, res) => {
  try {
    const userObjectId = req.user.id;

    // Run income and expense aggregations in parallel to reduce wall time
    const [incomeData, expenseData] = await Promise.all([
      Income.aggregate([
        { $match: { userId: new Types.ObjectId(userObjectId) } },

        {
          $facet: {
            totalIncome: [
              { $group: { _id: null, total: { $sum: "$amount" } } },
            ],

            recentIncome: [{ $sort: { date: -1 } }, { $limit: 5 }],

            last60DaysIncome: [
              {
                $match: {
                  date: {
                    $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: "$amount" },
                  transactions: { $push: "$$ROOT" },
                },
              },
            ],
          },
        },
      ]),

      Expense.aggregate([
        { $match: { userId: new Types.ObjectId(userObjectId) } },

        {
          $facet: {
            totalExpense: [
              { $group: { _id: null, total: { $sum: "$amount" } } },
            ],

            recentExpense: [{ $sort: { date: -1 } }, { $limit: 5 }],

            last30DaysExpense: [
              {
                $match: {
                  date: {
                    $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: "$amount" },
                  transactions: { $push: "$$ROOT" },
                },
              },
            ],
/* current week */
            currentWeeksExpense: [
              {
                $match: {
                  date: {
                    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: "$amount" },
                  transactions: { $push: "$$ROOT" },
                },
              },
            ],
          },
        },
      ]),
    ]);

    //  3. EXTRACT DATA
    const totalIncome = incomeData[0]?.totalIncome[0]?.total || 0;
    const totalExpense = expenseData[0]?.totalExpense[0]?.total || 0;

    const last60DaysIncome = incomeData[0]?.last60DaysIncome[0] || {
      total: 0,
      transactions: [],
    };

    const last30DaysExpense = expenseData[0]?.last30DaysExpense[0] || {
      total: 0,
      transactions: [],
    };
//current week
    const currentWeeksExpense = expenseData[0]?.currentWeeksExpense[0] || {
      total: 0,
      transactions: [],
    };

    const recentIncome = incomeData[0]?.recentIncome || [];
    const recentExpense = expenseData[0]?.recentExpense || [];

    //  4. FINAL RESPONSE
    res.json({
      totalBalance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      last60DaysIncome,
      last30DaysExpense,
      //current week
      currentWeeksExpense,
      recentTransactions: [
        ...recentIncome.map((t) => ({ ...t, type: "income" })),
        ...recentExpense.map((t) => ({ ...t, type: "expense" })),
      ]
        .sort((a, b) => b.date - a.date)
        .slice(0, 5),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
