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

//available periods
const getAvailablePeriods = async (req, res) => {
  try {
    const userId = req.user.id;
    const incomes = await Income.find({ userId }).select('date').lean();
    const expenses = await Expense.find({ userId }).select('date').lean();
    const records = [...incomes, ...expenses];

    // No records
    if (!records.length) {
      return res.json({
        years: [],
        months: [],
      });
    }

    const years = [...new Set(records.map((item) => new Date(item.date).getFullYear()))].sort(
      (a, b) => b - a
    );

    const monthMap = new Map();

    records.forEach((item) => {
      const date = new Date(item.date);
      const monthNumber = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${monthNumber}`;

      if (!monthMap.has(key)) {
        monthMap.set(key, {
          year,

          monthNumber,

          month: date.toLocaleString('default', {
            month: 'short',
          }),
        });
      }
    });

    const months = [...monthMap.values()].sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }

      return a.monthNumber - b.monthNumber;
    });

    res.json({
      years,
      months,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to load available periods.',
    });
  }
};

//get available categories
const getCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    const incomes = await Income.find({ userId }).select('source').lean();
    const expenses = await Expense.find({ userId }).select('category').lean();
    const incomeCategories = [
      ...new Set(incomes.map((item) => item.source).filter(Boolean)),
    ].sort();

    const expenseCategories = [
      ...new Set(expenses.map((item) => item.category).filter(Boolean)),
    ].sort();

    const allCategories = [...new Set([...incomeCategories, ...expenseCategories])].sort();

    res.json({
      income: incomeCategories,
      expense: expenseCategories,
      all: allCategories,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to load categories.',
    });
  }
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

    const startMonth = reportStartDate.getUTCMonth() + 1;
    const startYear = reportStartDate.getUTCFullYear();

    const endMonth = reportEndDate.getUTCMonth() + 1;
    const endYear = reportEndDate.getUTCFullYear();

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
      } else if ((percentage = 100)) {
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

      transactions,
      budgets: budgetData,
      goals: goalData,
    });
  } catch (error) {
    console.error('Financial Statement PDF Error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to generate financial statement.',
    });
  }
};

//  FINANCIAL SUMMARY REPORT
const getFinancialReport = async (req, res) => {
  try {
    const userId = req.user.id;

    const { startDate, endDate } = getYearDateRange(req.query.year);

    const incomes = await Income.find({
      userId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: 1 });

    const expenses = await Expense.find({
      userId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: 1 });

    const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0);

    const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

    const balance = totalIncome - totalExpense;

    const savingsRate = totalIncome > 0 ? Number(((balance / totalIncome) * 100).toFixed(2)) : 0;

    // Monthly breakdown
    const monthly = {};

    incomes.forEach((income) => {
      const month = new Date(income.date).toLocaleString('default', {
        month: 'short',
      });

      if (!monthly[month]) {
        monthly[month] = {
          income: 0,
          expense: 0,
        };
      }

      monthly[month].income += Number(income.amount);
    });

    expenses.forEach((expense) => {
      const month = new Date(expense.date).toLocaleString('default', {
        month: 'short',
      });

      if (!monthly[month]) {
        monthly[month] = {
          income: 0,
          expense: 0,
        };
      }

      monthly[month].expense += Number(expense.amount);
    });

    const monthlyReport = Object.keys(monthly).map((month) => ({
      month,
      income: monthly[month].income,
      expense: monthly[month].expense,
      balance: monthly[month].income - monthly[month].expense,
    }));

    // Category spending dynamically
    const categoryMap = {};

    expenses.forEach((expense) => {
      const category = expense.category;

      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }

      categoryMap[category] += Number(expense.amount);
    });

    const categories = Object.keys(categoryMap).map((category) => ({
      category,
      amount: categoryMap[category],
    }));

    res.status(200).json({
      success: true,
      year: req.query.year || new Date().getFullYear(),

      summary: {
        totalIncome,
        totalExpense,
        balance,
        savingsRate,
      },

      monthlyReport,

      categories,

      transactions: {
        incomes,
        expenses,
      },
    });
  } catch (error) {
    console.error('Financial Report Error:', error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//  MONTHLY REPORT
const getMonthlyReport = async (req, res) => {
  try {
    const userId = req.user.id;

    const { startDate, endDate } = getYearDateRange(req.query.year);

    const incomes = await Income.find({
      userId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .select('amount date')
      .lean();

    const expenses = await Expense.find({
      userId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .select('amount date')
      .lean();

    const monthlyMap = new Map();

    // Process incomes
    incomes.forEach((income) => {
      const date = new Date(income.date);

      const monthNumber = date.getMonth();

      if (!monthlyMap.has(monthNumber)) {
        monthlyMap.set(monthNumber, {
          month: date.toLocaleString('default', {
            month: 'short',
          }),
          monthNumber,
          income: 0,
          expenses: 0,
        });
      }

      monthlyMap.get(monthNumber).income += income.amount;
    });

    // Process expenses
    expenses.forEach((expense) => {
      const date = new Date(expense.date);

      const monthNumber = date.getMonth();

      if (!monthlyMap.has(monthNumber)) {
        monthlyMap.set(monthNumber, {
          month: date.toLocaleString('default', {
            month: 'short',
          }),
          monthNumber,
          income: 0,
          expenses: 0,
        });
      }

      monthlyMap.get(monthNumber).expenses += expense.amount;
    });

    const monthly = [...monthlyMap.values()]
      .sort((a, b) => a.monthNumber - b.monthNumber)
      .map(({ monthNumber, ...rest }) => rest);

    res.json(monthly);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Monthly report failed',
    });
  }
};

//  CATEGORY ANALYSIS REPORT
const getCategoryAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = getYearDateRange(req.query.year);
    const expenses = await Expense.find({
      userId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const incomes = await Income.find({
      userId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    // ============================
    // Expense Category Analysis
    // ============================

    const categoryMap = {};

    expenses.forEach((expense) => {
      const category = expense.category;

      if (!categoryMap[category]) {
        categoryMap[category] = {
          category,
          totalAmount: 0,
          count: 0,
        };
      }

      categoryMap[category].totalAmount += Number(expense.amount);
      categoryMap[category].count += 1;
    });

    const expenseCategories = Object.values(categoryMap);
    const totalExpense = expenseCategories.reduce((sum, item) => sum + item.totalAmount, 0);
    const categoryAnalysis = expenseCategories.map((item) => ({
      category: item.category,
      amount: item.totalAmount,
      transactions: item.count,
      percentage:
        totalExpense > 0 ? Number(((item.totalAmount / totalExpense) * 100).toFixed(2)) : 0,
    }));

    // Sort highest spending first

    categoryAnalysis.sort((a, b) => b.amount - a.amount);

    // ============================
    // Income Sources
    // ============================

    const incomeMap = {};

    incomes.forEach((income) => {
      const source = income.source || 'Other';

      if (!incomeMap[source]) {
        incomeMap[source] = {
          source,
          amount: 0,
          count: 0,
        };
      }

      incomeMap[source].amount += Number(income.amount);
      incomeMap[source].count += 1;
    });

    const incomeAnalysis = Object.values(incomeMap);

    res.status(200).json({
      success: true,

      year: req.query.year || new Date().getFullYear(),

      expenses: {
        total: totalExpense,
        categories: categoryAnalysis,
      },

      income: {
        categories: incomeAnalysis,
      },
    });
  } catch (error) {
    console.error('Category Analysis Error:', error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// COMBINED FULL REPORT (single request for Reports page)
const getFullReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const selectedYear = Number(req.query.year || new Date().getFullYear());
    const selectedMonth = req.query.month || String(new Date().getMonth() + 1).padStart(2, '0');
    const { startDate, endDate } = getYearDateRange(selectedYear);

    // Fetch all required data in parallel with lean() for performance
    const [incomes, expenses, budgets] = await Promise.all([
      Income.find({
        userId,
        date: { $gte: startDate, $lte: endDate },
      })
        .select('amount date source icon')
        .sort({ date: 1 })
        .lean(),
      Expense.find({
        userId,
        date: { $gte: startDate, $lte: endDate },
      })
        .select('amount date category icon')
        .sort({ date: 1 })
        .lean(),
      Budget.find({
        userId,
        year: selectedYear,
        month: selectedMonth,
      }).lean(),
    ]);

    // ---- Summary ----
    const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Number(((balance / totalIncome) * 100).toFixed(2)) : 0;

    // ---- Monthly breakdown ----
    const monthlyMap = new Map();
    const addMonthly = (date, isIncome, amount) => {
      const d = new Date(date);
      const monthNumber = d.getMonth();
      if (!monthlyMap.has(monthNumber)) {
        monthlyMap.set(monthNumber, {
          month: d.toLocaleString('default', { month: 'short' }),
          monthNumber,
          income: 0,
          expenses: 0,
        });
      }
      const entry = monthlyMap.get(monthNumber);
      if (isIncome) entry.income += amount;
      else entry.expenses += amount;
    };

    incomes.forEach((item) => addMonthly(item.date, true, Number(item.amount || 0)));
    expenses.forEach((item) => addMonthly(item.date, false, Number(item.amount || 0)));

    const monthlyData = [...monthlyMap.values()]
      .sort((a, b) => a.monthNumber - b.monthNumber)
      .map(({ monthNumber, ...rest }) => rest);

    // ---- Category spending ----
    const categoryMap = {};
    expenses.forEach((expense) => {
      const category = expense.category || 'Other';
      if (!categoryMap[category]) categoryMap[category] = 0;
      categoryMap[category] += Number(expense.amount || 0);
    });

    const categorySpending = Object.keys(categoryMap)
      .map((category) => ({
        category,
        amount: categoryMap[category],
        percentage:
          totalExpense > 0 ? Number(((categoryMap[category] / totalExpense) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // ---- Budget performance ----
    const expenseMap = {};
    expenses.forEach((expense) => {
      const category = expense.category || 'Other';
      expenseMap[category] = (expenseMap[category] || 0) + Number(expense.amount || 0);
    });

    const budgetData = budgets.map((budget) => {
      const spent = expenseMap[budget.category] || 0;
      const limit = Number(budget.limitAmount || 0);
      const percentage = limit > 0 ? Number(((spent / limit) * 100).toFixed(2)) : 0;
      let status = 'Good';
      if (percentage > 100) status = 'Exceeded';
      else if (percentage >= 80) status = 'Warning';

      return {
        id: budget._id,
        icon: budget.icon,
        category: budget.category,
        month: budget.month,
        year: budget.year,
        budget: limit,
        spent,
        remaining: limit - spent,
        percentage,
        status,
      };
    });

    res.status(200).json({
      success: true,
      year: selectedYear,
      month: selectedMonth,
      summary: { totalIncome, totalExpense, balance, savingsRate },
      monthlyData,
      categorySpending,
      budgetData,
      transactions: { incomes, expenses },
    });
  } catch (error) {
    console.error('Full Report Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// BUDGET PERFORMANCE REPORT
const getBudgetPerformance = async (req, res) => {
  try {
    const userId = req.user.id;
    const selectedYear = Number(req.query.year || new Date().getFullYear());
    const selectedMonth = req.query.month || null;
    const { startDate, endDate } = getYearDateRange(selectedYear);

    const budgetQuery = {
      userId,
      year: selectedYear,
    };

    if (selectedMonth) {
      budgetQuery.month = selectedMonth;
    }

    const budgets = await Budget.find(budgetQuery);

    const expenses = await Expense.find({
      userId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const expenseMap = {};
    expenses.forEach((expense) => {
      const category = expense.category;
      if (!expenseMap[category]) {
        expenseMap[category] = 0;
      }
      expenseMap[category] += Number(expense.amount);
    });

    const performance = budgets.map((budget) => {
      const spent = expenseMap[budget.category] || 0;
      const limit = Number(budget.limitAmount);
      const percentage = limit > 0 ? Number(((spent / limit) * 100).toFixed(2)) : 0;
      let status = 'Good';
      if (percentage > 100) {
        status = 'Exceeded';
      } else if (percentage >= 80) {
        status = 'Warning';
      }
      return {
        id: budget._id,
        icon: budget.icon,
        category: budget.category,
        month: budget.month,
        year: budget.year,
        budgetLimit: limit,
        spent,
        remaining: limit - spent,
        percentage,
        status,
      };
    });

    res.status(200).json({
      success: true,
      year: selectedYear,
      month: selectedMonth,
      performance,
    });
  } catch (error) {
    console.error('Budget Performance Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
    console.error(error);

    res.status(500).json({
      message: 'Failed to export income report.',
    });
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
    console.error(error);

    res.status(500).json({
      message: 'Failed to export expense report.',
    });
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
    console.error(error);

    res.status(500).json({
      message: 'Failed to export transaction report.',
    });
  }
};

// EXPORT CSV REPORT
const exportCSV = async (req, res) => {
  try {
    const userId = req.user.id;

    const incomes = await Income.find({ userId }).sort({ date: -1 });
    const expenses = await Expense.find({ userId }).sort({ date: -1 });

    // Build CSV header
    const header = 'Date,Type,Category,Amount\n';

    // Build CSV rows
    const incomeRows = incomes
      .map(
        (i) =>
          `${new Date(i.date).toISOString().split('T')[0]},Income,${i.source || 'Income'},${i.amount}`
      )
      .join('\n');

    const expenseRows = expenses
      .map(
        (e) => `${new Date(e.date).toISOString().split('T')[0]},Expense,${e.category},${e.amount}`
      )
      .join('\n');

    const csvContent = header + incomeRows + '\n' + expenseRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=financial-report.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to export CSV report.' });
  }
};

// EMAIL REPORT
const sendEmailReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const incomes = await Income.find({ userId }).sort({ date: 1 });
    const expenses = await Expense.find({ userId }).sort({ date: 1 });

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
    const balance = totalIncome - totalExpense;

    // Build HTML email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">Expense Tracker - Financial Report</h2>
        <p>Hello <strong>${user.fullName}</strong>,</p>
        <p>Here is your financial summary:</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #f3f4f6;">
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Metric</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Amount</th>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd;">Total Income</td>
            <td style="padding: 12px; text-align: right; border: 1px solid #ddd; color: #22c55e;">GHS ${totalIncome.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd;">Total Expenses</td>
            <td style="padding: 12px; text-align: right; border: 1px solid #ddd; color: #ef4444;">GHS ${totalExpense.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd;">Balance</td>
            <td style="padding: 12px; text-align: right; border: 1px solid #ddd; color: #d97706;">GHS ${balance.toFixed(2)}</td>
          </tr>
        </table>

        <p><strong>Transactions:</strong> ${incomes.length + expenses.length} total</p>
        <p style="color: #6b7280; font-size: 12px;">This report was generated from your Expense Tracker account.</p>
      </div>
    `;

    const sendEmail = require('../utils/sendEmail');
    await sendEmail(user.email, 'Your Financial Report from Expense Tracker', emailHtml);

    res.json({ message: 'Report sent to your email successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send email report.' });
  }
};

module.exports = {
  exportPDF,
  exportIncomePDF,
  exportExpensePDF,
  exportTransactionPDF,
  exportCSV,
  sendEmailReport,

  getFinancialReport,
  getMonthlyReport,
  getCategoryAnalysis,
  getBudgetPerformance,
  getFullReport,
  getCategories,
  getAvailablePeriods,
};
