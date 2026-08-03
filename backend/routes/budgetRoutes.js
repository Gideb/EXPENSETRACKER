const express = require('express');
const router = express.Router();

const {
  addBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
  getBudgetSummaryByMonth,
  getBudgetCategories,
} = require('../controllers/budgetController');

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/add', addBudget);
router.get('/get', getBudgets);
router.get('/summary', getBudgetSummary);
router.get('/summary/:month', getBudgetSummaryByMonth);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);
router.get('/categories', getBudgetCategories);

module.exports = router;
