const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route   GET /api/products
 * @desc    Get all active products
 * @access  Private (any authenticated user can see products)
 */
router.get('/', authMiddleware.authenticate, productController.getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Private
 */
router.get('/:id', authMiddleware.authenticate, productController.getProductById);

module.exports = router;
