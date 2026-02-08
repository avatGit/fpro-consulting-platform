const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

// Toutes les routes nécessitent d'être admin
router.use(authenticate);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Obtenir les statistiques du dashboard admin
 *     tags: [Admin]
 */
router.get('/dashboard/stats', adminController.getDashboardStats);

/**
 * @swagger
 * /api/admin/activity:
 *   get:
 *     summary: Obtenir l'activité récente du système
 *     tags: [Admin]
 */
router.get('/activity', adminController.getActivityLogs);

/**
 * @swagger
 * /api/admin/system/health:
 *   get:
 *     summary: Obtenir l'état de santé du système
 *     tags: [Admin]
 */
router.get('/system/health', adminController.getSystemHealth);

module.exports = router;
