const express = require('express');
const router = express.Router();

const {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  updateSavedAmount,
  getGoalSummary,
} = require('../controllers/goalController');

const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, createGoal);

router.get('/get', protect, getGoals);

router.get('/summary', protect, getGoalSummary);

router.get('/:id', protect, getGoal);

router.put('/:id', protect, updateGoal);

router.patch('/:id/savings', protect, updateSavedAmount);

router.delete('/:id', protect, deleteGoal);

module.exports = router;
