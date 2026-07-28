const express = require("express");

const {
  addExpense,
  getAllExpense,
  deleteExpense,
  updateExpense,
  downloadExpenseExcel,
} = require("../controllers/expenseController");
const { exportPDF } = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", protect, addExpense);
router.get("/get", protect, getAllExpense);
router.get("/downloadexcel", protect, downloadExpenseExcel);
router.get("/exportPDF", protect, exportPDF);
router.delete("/:id", protect, deleteExpense);
router.put("/:id", protect, updateExpense);

module.exports = router;
