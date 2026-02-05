const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validate } = require('../validators/authValidators');
const { createMaintenanceSchema, assignTechnicianSchema } = require('../validators/maintenanceValidators');

router.use(authenticate);

/**
 * @swagger
 * /api/maintenance:
 *   post:
 *     summary: Créer une demande de maintenance
 *     tags: [Maintenance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description]
 *             properties:
 *               description: { type: string }
 *               priority: { type: string, enum: [low, medium, high, urgent] }
 *               request_type: { type: string }
 *     responses:
 *       201:
 *         description: Demande créée
 */
router.post('/', authorize('client'), validate(createMaintenanceSchema), maintenanceController.createRequest);
router.get('/', maintenanceController.listUserRequests);

/**
 * @swagger
 * /api/maintenance/{id}/auto-assign:
 *   post:
 *     summary: Assigner automatiquement un technicien
 *     tags: [Maintenance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Technicien assigné
 */
router.post('/:id/auto-assign', maintenanceController.autoAssign);

router.get('/:id', maintenanceController.getRequest);
router.post('/:id/assign', validate(assignTechnicianSchema), maintenanceController.assignTechnician);

module.exports = router;
