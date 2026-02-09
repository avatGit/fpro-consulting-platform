const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

// Toutes les routes nécessitent d'être admin ou agent
router.use(authenticate);
router.use(authorize('admin', 'agent'));

/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: Lister tous les logs d'audit avec filtrage
 *     tags: [Audit]
 */
router.get('/', auditController.listAuditLogs);

/**
 * @swagger
 * /api/admin/audit-logs/stats:
 *   get:
 *     summary: Obtenir des statistiques sur les logs d'audit
 *     tags: [Audit]
 */
router.get('/stats', auditController.getAuditStats);

/**
 * @swagger
 * /api/admin/audit-logs/{id}:
 *   get:
 *     summary: Obtenir les détails d'un log d'audit
 *     tags: [Audit]
 */
router.get('/:id', auditController.getAuditLog);

module.exports = router;
