const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { validate } = require('../validators/authValidators');
const { authenticate } = require('../middleware/authMiddleware');
const { addItemSchema, updateItemSchema } = require('../validators/salesValidators');

router.use(authenticate);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Récupérer le panier actif
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Panier récupéré
 */
router.get('/', cartController.getCart);

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     summary: Ajouter un article au panier
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId: { type: string, format: uuid }
 *               quantity: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Article ajouté
 */
router.post('/items', validate(addItemSchema), cartController.addItem);

/**
 * @swagger
 * /api/cart/items/{itemId}:
 *   put:
 *     summary: Mettre à jour la quantité d'un article
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Panier mis à jour
 */
router.put('/items/:itemId', validate(updateItemSchema), cartController.updateItem);

router.delete('/items/:itemId', cartController.removeItem);
router.delete('/', cartController.clearCart);

module.exports = router;
