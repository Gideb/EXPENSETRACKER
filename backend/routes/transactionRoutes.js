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

router.get('/downloadexcel', protect, exportTransactionsExcel);

router.get('/exportpdf', protect, exportTransactionPDF);

module.exports = router;
