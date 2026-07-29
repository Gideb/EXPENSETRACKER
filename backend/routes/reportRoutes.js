const express = require("express");
const { exportPDF } = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/financial", protect, exportPDF);
router.get("/monthly", protect, exportPDF);
router.get("/yearly", protect, exportPDF);
router.get("/category-analysis", protect, exportPDF);
router.get("/budget-performance", protect, exportPDF);

module.exports = router;