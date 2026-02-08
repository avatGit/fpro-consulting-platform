const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route   GET /api/products
 * @desc    Get all active products
 * @access  Private (any authenticated user can see products)
 */
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.use(authenticate);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin & Agent can create/update
router.post('/', authorize('admin', 'agent'), productController.createProduct);
router.put('/:id', authorize('admin', 'agent'), productController.updateProduct);

// Only Admin can delete
router.delete('/:id', authorize('admin'), productController.deleteProduct);

module.exports = router;
