const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validate, createProductSchema, updateProductSchema } = require('../validators/catalogValidators');

/**
 * @route   GET /api/products
 * @desc    Liste des produits avec pagination et filtres
 * @access  Public
 */
router.get('/', productController.getAllProducts);

/**
 * @route   GET /api/products/low-stock
 * @desc    Produits en alerte de stock bas
 * @access  Private (Admin, Agent)
 */
router.get('/low-stock', 
  authenticate, 
  authorize('admin', 'agent'), 
  productController.getLowStockProducts
);

/**
 * @route   GET /api/products/:id
 * @desc    Détails d'un produit
 * @access  Public
 */
router.get('/:id', productController.getProductById);

/**
 * @route   POST /api/products
 * @desc    Créer un nouveau produit
 * @access  Private (Admin, Agent)
 */
router.post('/',
  authenticate,
  authorize('admin', 'agent'),
  validate(createProductSchema),
  productController.createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Mettre à jour un produit
 * @access  Private (Admin, Agent)
 */
router.put('/:id',
  authenticate,
  authorize('admin', 'agent'),
  validate(updateProductSchema),
  productController.updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Désactiver un produit
 * @access  Private (Admin)
 */
router.delete('/:id',
  authenticate,
  authorize('admin'),
  productController.deleteProduct
);

module.exports = router;