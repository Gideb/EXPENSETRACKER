const express = require("express");

const {
  addExpense,
  getAllExpense,
  deleteExpense,
  updateExpense,
  downloadExpenseExcel,
} = require("../controllers/expenseController");
const { exportExpensePDF } = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", protect, addExpense);
router.get("/get", protect, getAllExpense);
router.get("/download-excel", protect, downloadExpenseExcel);
router.get( "/export-pdf", protect, exportExpensePDF);
router.delete("/:id", protect, deleteExpense);
router.put("/:id", protect, updateExpense);

module.exports = router;
