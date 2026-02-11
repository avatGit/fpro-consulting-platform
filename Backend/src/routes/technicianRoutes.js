const express = require('express');
const router = express.Router();
const technicianController = require('../controllers/technicianController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.use(authenticate);

/**
 * @swagger
 * /api/technicians:
 *   get:
 *     summary: Lister tous les techniciens
 *     tags: [Technicians]
 */
router.get('/', authorize('admin', 'agent'), technicianController.listTechnicians);

/**
 * @swagger
 * /api/technicians:
 *   post:
 *     summary: Créer un technicien (Admin uniquement)
 *     tags: [Technicians]
 */
router.post('/', authorize('admin'), technicianController.createTechnician);

/**
 * @swagger
 * /api/technicians/{id}:
 *   delete:
 *     summary: Supprimer un technicien (Admin uniquement)
 *     tags: [Technicians]
 */
router.delete('/:id', authorize('admin'), technicianController.deleteTechnician);

module.exports = router;
