const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validate, createCategorySchema } = require('../validators/catalogValidators');

/**
 * @route   GET /api/categories
 * @desc    Liste des catégories
 * @access  Public
 */
router.get('/', categoryController.getAllCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Détails d'une catégorie
 * @access  Public
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @route   POST /api/categories
 * @desc    Créer une nouvelle catégorie
 * @access  Private (Admin, Agent)
 */
router.post('/',
  authenticate,
  authorize('admin', 'agent'),
  validate(createCategorySchema),
  categoryController.createCategory
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Mettre à jour une catégorie
 * @access  Private (Admin, Agent)
 */
router.put('/:id',
  authenticate,
  authorize('admin', 'agent'),
  validate(createCategorySchema),
  categoryController.updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Désactiver une catégorie
 * @access  Private (Admin)
 */
router.delete('/:id',
  authenticate,
  authorize('admin'),
  categoryController.deleteCategory
);

module.exports = router;