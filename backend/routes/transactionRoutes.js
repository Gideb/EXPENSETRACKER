const express = require('express');
const router = express.Router();

const {
  getTransactions,
  deleteTransaction,
  exportTransactionsExcel,
} = require('../controllers/transactionController');

const { exportTransactionPDF } = require('../controllers/reportController');

const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getTransactions);

router.delete('/:type/:id', protect, deleteTransaction);

router.get('/download-excel', protect, exportTransactionsExcel);

router.get('/export-pdf', protect, exportTransactionPDF);

module.exports = router;
