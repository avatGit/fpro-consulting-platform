const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { authenticate } = require('../middleware/authMiddleware');
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
 *               priority: { type: string, enum: [faible, moyenne, elevee] }
 *               request_type: { type: string }
 *     responses:
 *       201:
 *         description: Demande créée
 */
router.post('/', validate(createMaintenanceSchema), maintenanceController.createRequest);

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

router.get('/', maintenanceController.getUserRequests);
router.get('/:id', maintenanceController.getRequest);
router.post('/:id/assign', validate(assignTechnicianSchema), maintenanceController.assignTechnician);
// [Changement] Ajout de cette route car elle était définie dans le controller mais non exposée via les routes, empêchant l'Agent d'utiliser les suggestions AI.
router.get('/:id/suggest-technician', maintenanceController.getSuggestedTechnicians);
// [Changement] Route permettant au client de confirmer la fin de la maintenance
router.post('/:id/confirm', maintenanceController.confirmMaintenance);
// [Changement] Route permettant à l'administrateur de modifier manuellement le statut d'une maintenance
router.patch('/:id/status', maintenanceController.updateStatus);

module.exports = router;
