const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Gestion du catalogue produits et services
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Créer un nouveau produit ou service
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type, base_price]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               type: { type: string, enum: [product, service] }
 *               base_price: { type: number }
 *               sku: { type: string }
 *               stock_quantity: { type: integer }
 *     responses:
 *       201:
 *         description: Produit créé
 *       403:
 *         description: Accès refusé (Admin/Agent uniquement)
 */
router.post('/',
    authenticate,
    authorize('admin', 'agent'),
    productController.createProduct
);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lister les produits (avec filtres et pagination)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [product, service] }
 *     responses:
 *       200:
 *         description: Liste des produits
 */
router.get('/',
    authenticate,
    productController.listProducts
);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtenir les détails d'un produit
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Détails du produit
 *       404:
 *         description: Produit non trouvé
 */
router.get('/:id',
    authenticate,
    productController.getProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Mettre à jour un produit
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               base_price: { type: number }
 *               stock_quantity: { type: integer }
 *               is_active: { type: boolean }
 *     responses:
 *       200:
 *         description: Produit mis à jour
 *       403:
 *         description: Accès refusé
 */
router.put('/:id',
    authenticate,
    authorize('admin', 'agent'),
    productController.updateProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Supprimer (désactiver) un produit
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Produit supprimé
 *       403:
 *         description: Accès refusé
 */
router.delete('/:id',
    authenticate,
    authorize('admin', 'agent'),
    productController.deleteProduct
);

module.exports = router;
