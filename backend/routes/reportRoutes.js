const express = require('express');
const {
  getFinancialReport,
  getMonthlyReport,
  getCategoryAnalysis,
  getBudgetPerformance,
  exportPDF,
} = require('../controllers/reportController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// JSON DATA REPORTS
router.get('/financial', protect, getFinancialReport);

router.get('/monthly', protect, getMonthlyReport);

router.get('/category-analysis', protect, getCategoryAnalysis);

router.get('/budget-performance', protect, getBudgetPerformance);

// PDF EXPORT
router.get('/export-pdf', protect, exportPDF);

module.exports = router;
