const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: Gestion des entreprises (Admin uniquement)
 */

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Lister les entreprises
 *     tags: [Companies]
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
 *         name: is_active
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Liste des entreprises
 *       403:
 *         description: Accès refusé
 */
router.get('/',
    authenticate,
    authorize('admin'),
    companyController.listCompanies
);

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Obtenir les détails d'une entreprise
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Détails de l'entreprise
 *       404:
 *         description: Entreprise non trouvée
 */
router.get('/:id',
    authenticate,
    authorize('admin'),
    companyController.getCompany
);

/**
 * @swagger
 * /api/companies/{id}/status:
 *   put:
 *     summary: Activer/Désactiver une entreprise
 *     tags: [Companies]
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
 *             required: [is_active]
 *             properties:
 *               is_active: { type: boolean }
 *     responses:
 *       200:
 *         description: Statut mis à jour
 *       403:
 *         description: Accès refusé
 */
router.put('/:id/status',
    authenticate,
    authorize('admin'),
    companyController.updateCompanyStatus
);

module.exports = router;
