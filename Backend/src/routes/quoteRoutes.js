const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

const { validate } = require('../validators/authValidators');
const { generateQuoteSchema, updateQuoteStatusSchema } = require('../validators/salesValidators');

router.use(authenticate);

/**
 * @swagger
 * /api/quotes/generate:
 *   post:
 *     summary: Générer un devis à partir du panier
 *     tags: [Quotes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [companyId]
 *             properties:
 *               companyId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Devis créé
 */
router.post('/generate', authorize('client'), validate(generateQuoteSchema), quoteController.createFromCart);

/**
 * @swagger
 * /api/quotes:
 *   get:
 *     summary: Liste des devis de l'utilisateur
 *     tags: [Quotes]
 *     responses:
 *       200:
 *         description: Liste récupérée
 */
router.get('/', quoteController.listUserQuotes);

/**
 * @swagger
 * /api/quotes/{id}/pdf:
 *   get:
 *     summary: Télécharger le PDF du devis
 *     tags: [Quotes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Fichier PDF
 *         content:
 *           application/pdf:
 *             schema: { type: string, format: binary }
 */
router.get('/:id/pdf', quoteController.downloadPdf);

router.get('/:id', quoteController.getQuote);
router.patch('/:id/status', validate(updateQuoteStatusSchema), quoteController.updateStatus);

module.exports = router;
