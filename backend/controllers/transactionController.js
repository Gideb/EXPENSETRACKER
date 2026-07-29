const ExcelJS = require('exceljs');
const Income = require('../models/Income');
const Expense = require('../models/Expense');

// Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const [income, expense] = await Promise.all([
      Income.find({ userId }).sort({ date: -1 }),
      Expense.find({ userId }).sort({ date: -1 }),
    ]);

    const transactions = [
      ...income.map((item) => ({
        ...item._doc,
        type: 'income',
      })),

      ...expense.map((item) => ({
        ...item._doc,
        type: 'expense',
      })),
    ];

    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch transactions',
      error: error.message,
    });
  }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { id, type } = req.params;

    if (type === 'expense') {
      await Expense.findByIdAndDelete(id);
    } else {
      await Income.findByIdAndDelete(id);
    }

    res.status(200).json({
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Delete failed',
      error: error.message,
    });
  }
};

//download transaction excel
exports.exportTransactionsExcel = async (req, res) => {
  try {
    const userId = req.user.id;

    const [income, expense] = await Promise.all([
      Income.find({ userId }).sort({ date: -1 }),
      Expense.find({ userId }).sort({ date: -1 }),
    ]);

    const transactions = [
      ...income.map((item) => ({
        ...item._doc,
        type: 'Income',
      })),
      ...expense.map((item) => ({
        ...item._doc,
        type: 'Expense',
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Expense Tracker';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Transactions');

    worksheet.columns = [
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Category / Source', key: 'categorySource', width: 30 },
      { header: 'Amount', key: 'amount', width: 20 },
      { header: 'Date', key: 'date', width: 18 },
    ];

    // Header styling
    worksheet.getRow(1).font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };

    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2563EB' },
    };

    worksheet.getRow(1).alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };

    transactions.forEach((item) => {
      worksheet.addRow({
        type: item.type,
        title: item.type === 'Expense' ? item.category : item.source,
        categorySource: item.type === 'Expense' ? item.category : item.source,
        amount: item.amount,
        date: item.date ? new Date(item.date).toLocaleDateString() : '',
        description: item.description || '',
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
          fgColor: { argb: 'F8FAFC' },
        };
      }
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader('Content-Disposition', `attachment; filename=transactions-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to export Excel',
      error: error.message,
    });
  }
};
