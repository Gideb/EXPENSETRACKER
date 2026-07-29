const express = require("express");

const {
  addIncome,
  getAllIncome,
  deleteIncome,
  updateIncome,
  downloadIncomeExcel,
} = require("../controllers/incomeController");
const { exportIncomePDF } = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", protect, addIncome);
router.get("/get", protect, getAllIncome);
router.get("/downloadexcel", protect, downloadIncomeExcel);
router.get("/exportPDF", protect, exportIncomePDF);
router.delete("/:id", protect, deleteIncome);
router.put("/:id", protect, updateIncome);

module.exports = router;
