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

/**
 * @swagger
 * /api/orders/{id}/validate:
 *   post:
 *     summary: Valider une commande (impacte le stock)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Commande validée
 */
router.post('/:id/validate', authorize('agent', 'admin'), orderController.validateOrder);
// [Changement] Ajout de la route de refus pour permettre à l'agent d'invalider une commande avec un motif.
router.post('/:id/refuse', authorize('agent', 'admin'), orderController.refuseOrder);

// [Changement] Route pour marquer comme livrée
router.post('/:id/delivered', authorize('agent', 'admin'), orderController.markAsDelivered);

// [Changement] Route pour confirmer la réception (Client)
router.post('/:id/complete', authorize('client'), orderController.confirmReceipt);

router.get('/', orderController.listUserOrders);
router.get('/:id', orderController.getOrder);

module.exports = router;
