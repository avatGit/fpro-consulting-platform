const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// Only Admins and Agents can export reports
router.get('/orders', authMiddleware, authorize(['admin', 'agent']), reportController.exportOrders);
router.get('/maintenance', authMiddleware, authorize(['admin', 'agent']), reportController.exportMaintenance);

module.exports = router;
