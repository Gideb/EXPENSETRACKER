const express = require('express');
const {
  getFinancialReport,
  getMonthlyReport,
  getCategoryAnalysis,
  getBudgetPerformance,
  exportPDF,
  exportCSV,
  sendEmailReport,
  getAvailablePeriods,
  getCategories,
} = require('../controllers/reportController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// JSON DATA REPORTS
router.get('/financial', protect, getFinancialReport);
router.get('/monthly', protect, getMonthlyReport);
router.get('/category-analysis', protect, getCategoryAnalysis);
router.get('/budget-performance', protect, getBudgetPerformance);
// EXPORTS
router.get('/export-pdf', protect, exportPDF);
router.get('/export-csv', protect, exportCSV);

// EMAIL
router.post('/email-report', protect, sendEmailReport);

//filters
router.get('/available-periods', protect, getAvailablePeriods);
router.get('/categories', protect, getCategories);

module.exports = router;
