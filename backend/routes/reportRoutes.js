const express = require('express');
const { exportPDF } = require('../controllers/reportController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/export-pdf', protect, exportPDF);

module.exports = router;
