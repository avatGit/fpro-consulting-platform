const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/authMiddleware');

// Toutes les routes dashboard sont protégées
router.use(authenticate);

// GET /api/dashboard/summary
router.get('/summary', dashboardController.getDashboardSummary);

module.exports = router;
