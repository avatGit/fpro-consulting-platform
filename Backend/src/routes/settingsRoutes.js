const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { auditLog } = require('../middleware/auditMiddleware');

// Toutes les routes nécessitent d'être admin
router.use(authenticate);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     summary: Obtenir tous les paramètres ou par catégorie
 *     tags: [Settings]
 */
router.get('/', settingsController.getSettings);

/**
 * @swagger
 * /api/admin/settings:
 *   post:
 *     summary: Créer un nouveau paramètre
 *     tags: [Settings]
 */
router.post('/', auditLog('CREATE', 'SystemSetting'), settingsController.createSetting);

/**
 * @swagger
 * /api/admin/settings/init-defaults:
 *   post:
 *     summary: Initialiser les paramètres par défaut
 *     tags: [Settings]
 */
router.post('/init-defaults', settingsController.initDefaultSettings);

/**
 * @swagger
 * /api/admin/settings/{key}:
 *   get:
 *     summary: Obtenir un paramètre spécifique
 *     tags: [Settings]
 */
router.get('/:key', settingsController.getSetting);

/**
 * @swagger
 * /api/admin/settings/{key}:
 *   put:
 *     summary: Mettre à jour un paramètre
 *     tags: [Settings]
 */
router.put('/:key', auditLog('UPDATE', 'SystemSetting'), settingsController.updateSetting);

module.exports = router;
