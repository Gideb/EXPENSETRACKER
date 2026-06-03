const express = require("express");

const {
  addExpense,
  getAllExpense,
  deleteExpense,
  donwloadExpenseExcel,
} = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", protect, addExpense);
router.get("/get", protect, getAllExpense);
router.get("/downloadexcel", protect, donwloadExpenseExcel);
router.delete("/:id", protect, deleteExpense);

module.exports = router;
