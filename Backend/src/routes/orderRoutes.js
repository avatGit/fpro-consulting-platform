const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

const { validate } = require('../validators/authValidators');
const { createOrderSchema } = require('../validators/salesValidators');

router.use(authenticate);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Créer une commande à partir d'un devis accepté
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quoteId]
 *             properties:
 *               quoteId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Commande créée
 */
router.post('/', validate(createOrderSchema), orderController.createFromQuote);

router.get('/', orderController.listUserOrders);

// Routes Admin & Agent
router.get('/all', authorize('admin', 'agent'), orderController.listAllOrders);
router.patch('/:id/status', authorize('admin', 'agent'), orderController.updateOrderStatus);

/**
 * @swagger
 * /api/orders/{id}/validate:
 *   post:
 *     summary: Valider une commande (impacte le stock)
 *     tags: [Orders]
 */
router.post('/:id/validate', authorize('admin'), orderController.validateOrder);

router.get('/:id', orderController.getOrder);

module.exports = router;
