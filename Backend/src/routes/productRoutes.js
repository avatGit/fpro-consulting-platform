const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

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

// Admin & Agent can create/update (with image upload)
router.post('/', authorize('admin', 'agent'), upload.single('image'), productController.createProduct);
router.put('/:id', authorize('admin', 'agent'), upload.single('image'), productController.updateProduct);

// Only Admin can delete
router.delete('/:id', authorize('admin'), productController.deleteProduct);

module.exports = router;
