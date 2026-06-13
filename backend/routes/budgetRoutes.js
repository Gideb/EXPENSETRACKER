const express = require("express");
const router = express.Router();

const {
  addBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
  getBudgetSummaryByMonth,
} = require("../controllers/budgetController");

const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/add", protect, addBudget);

router.get("/get", protect, getBudgets);

router.get("/summary", protect, getBudgetSummary);

router.get("/summary/:month", getBudgetSummaryByMonth);

router.put("/:id", protect, updateBudget);

router.delete("/:id", protect, deleteBudget);

module.exports = router;
