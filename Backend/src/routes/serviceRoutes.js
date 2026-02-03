const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validate, createServiceSchema, updateServiceSchema } = require('../validators/catalogValidators');

/**
 * @route   GET /api/services
 * @desc    Liste des services avec pagination et filtres
 * @access  Public
 */
router.get('/', serviceController.getAllServices);

/**
 * @route   GET /api/services/by-type/:type
 * @desc    Services par type (maintenance, location, development, etc.)
 * @access  Public
 */
router.get('/by-type/:type', serviceController.getServicesByType);

/**
 * @route   GET /api/services/:id
 * @desc    Détails d'un service
 * @access  Public
 */
router.get('/:id', serviceController.getServiceById);

/**
 * @route   POST /api/services
 * @desc    Créer un nouveau service
 * @access  Private (Admin, Agent)
 */
router.post('/',
  authenticate,
  authorize('admin', 'agent'),
  validate(createServiceSchema),
  serviceController.createService
);

/**
 * @route   PUT /api/services/:id
 * @desc    Mettre à jour un service
 * @access  Private (Admin, Agent)
 */
router.put('/:id',
  authenticate,
  authorize('admin', 'agent'),
  validate(updateServiceSchema),
  serviceController.updateService
);

/**
 * @route   DELETE /api/services/:id
 * @desc    Désactiver un service
 * @access  Private (Admin)
 */
router.delete('/:id',
  authenticate,
  authorize('admin'),
  serviceController.deleteService
);

module.exports = router;