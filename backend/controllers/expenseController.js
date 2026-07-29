const Expense = require('../models/Expense');
const xlsx = require('xlsx');
const updateBudgetOnExpense = require('../utils/budgetHelper');
const Budget = require('../models/Budget');

//add expense source
exports.addExpense = async (req, res) => {
  const userId = req.user.id;

  try {
    const { icon, category, amount, date } = req.body;

    // Prevent future dates
    if (new Date(date) > new Date()) {
      return res.status(400).json({
        message: 'Future dates are not allowed',
      });
    }

    // validation
    if (!category || !amount || !date) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newExpense = new Expense({
      userId,
      icon,
      category,
      amount,
      date: new Date(date),
    });

    await newExpense.save();

    // 🧠 EXTRACT MONTH (for budget matching)
    const expenseMonth = new Date(date).toISOString().slice(0, 7);

    // 💰 UPDATE BUDGET IN REAL TIME
    const budgetStatus = await updateBudgetOnExpense({
      userId,
      category,
      amount,
      month: expenseMonth,
    });

    return res.status(201).json({
      expense: newExpense,
      budgetStatus,
      budgetExceeded: budgetStatus?.exceeded || false,
      exceededCategory: budgetStatus?.category || null,
    });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

//get all expense source
exports.getAllExpense = async (req, res) => {
  const userId = req.user.id;

  try {
    const expenses = await Expense.find({ userId }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

//update expense source
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // 🧠 OLD VALUES (for budget correction)
    const oldAmount = expense.amount;
    const oldCategory = expense.category;
    const oldMonth = new Date(expense.date).toISOString().slice(0, 7);

    // update expense
    Object.assign(expense, req.body);
    await expense.save();

    // 🧠 NEW VALUES
    const newAmount = expense.amount;
    const newCategory = expense.category;
    const newMonth = new Date(expense.date).toISOString().slice(0, 7);

    // 🔄 STEP 1: REMOVE OLD IMPACT
    const oldBudget = await Budget.findOne({
      userId: req.user.id,
      category: oldCategory,
      month: oldMonth,
    });

    if (oldBudget) {
      oldBudget.spentAmount -= oldAmount;
      if (oldBudget.spentAmount < 0) oldBudget.spentAmount = 0;
      oldBudget.isExceeded = oldBudget.spentAmount > oldBudget.limitAmount;
      await oldBudget.save();
    }

    // 🔄 STEP 2: APPLY NEW IMPACT
    const newBudgetStatus = await updateBudgetOnExpense({
      userId: req.user.id,
      category: newCategory,
      amount: newAmount,
      month: newMonth,
    });

    res.status(200).json({
      expense,
      budgetStatus: newBudgetStatus,
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

//delete expense source
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const month = new Date(expense.date).toISOString().slice(0, 7);

    // 🧠 REMOVE FROM BUDGET
    const budget = await Budget.findOne({
      userId: req.user.id,
      category: expense.category,
      month,
    });

    if (budget) {
      budget.spentAmount -= expense.amount;
      if (budget.spentAmount < 0) budget.spentAmount = 0;
      budget.isExceeded = budget.spentAmount > budget.limitAmount;
      await budget.save();
    }

    res.status(200).json({
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

//download excel
/* exports.downloadExpenseExcel = async (req, res) => {
  const userId = req.user.id;

  try {
    const expenses = await Expense.find({ userId }).sort({ date: -1 }).lean();

    if (expenses.length === 0) {
      return res.status(400).json({ message: "No expenses to download" });
    }

    const data = expenses.map((expense) => ({
      Category: expense.category,
      Amount: expense.amount,
      Date: expense.date
        ? new Date(expense.date).toISOString().split("T")[0]
        : "",
      Icon: expense.icon || "",
    }));

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Expense");

    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="expense_details.xlsx"',
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Length", buffer.length);
    res.status(200).send(buffer);
  } catch (error) {
    console.error("Error downloading excel:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}; */

const ExcelJS = require('exceljs');

exports.downloadExpenseExcel = async (req, res) => {
  const userId = req.user.id;

  try {
    const expenses = await Expense.find({ userId }).sort({ date: -1 }).lean();

    if (expenses.length === 0) {
      return res.status(400).json({
        message: 'No expenses to download',
      });
    }

    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'Expense Tracker';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Expense');

    worksheet.columns = [
      {
        header: 'Category',
        key: 'category',
        width: 30,
      },
      {
        header: 'Amount',
        key: 'amount',
        width: 20,
      },
      {
        header: 'Date',
        key: 'date',
        width: 18,
      },
      {
        header: 'Description',
        key: 'description',
        width: 40,
      },
      {
        header: 'Icon',
        key: 'icon',
        width: 15,
      },
    ];

    // Header styling
    const headerRow = worksheet.getRow(1);

    headerRow.font = {
      bold: true,
      color: {
        argb: 'FFFFFFFF',
      },
    };

    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: 'DC2626', // red expense color
      },
    };

    headerRow.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };

    // Add expense rows
    expenses.forEach((expense) => {
      worksheet.addRow({
        category: expense.category,
        amount: expense.amount,
        date: expense.date ? new Date(expense.date).toLocaleDateString() : '',
        description: expense.description || '',
        icon: expense.icon || '',
      });
    });

    // Format amount column
    worksheet.getColumn('amount').numFmt = '#,##0.00';

    // Alternate row colors
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1 && rowNumber % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {
            argb: 'F8FAFC',
          },
        };
      }
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader('Content-Disposition', `attachment; filename=expense-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    console.error('Error downloading expense excel:', error);

    res.status(500).json({
      message: 'Failed to export expense Excel',
      error: error.message,
    });
  }
};
