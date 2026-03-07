const express = require('express');
const router = express.Router();
const interventionController = require('../controllers/interventionController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../validators/authValidators');
const { createReportSchema } = require('../validators/maintenanceValidators');

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Interventions
 *   description: Gestion des interventions et rapports
 */

/**
 * @swagger
 * /api/interventions/{id}/start:
 *   post:
 *     summary: Démarrer une intervention
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'intervention (UUID)
 *     responses:
 *       200:
 *         description: Intervention démarrée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: object }
 *       404:
 *         description: Intervention non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.post('/:id/start', interventionController.startIntervention);

/**
 * @swagger
 * /api/interventions/{id}/report:
 *   post:
 *     summary: Soumettre un rapport d'intervention
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'intervention
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [time_spent_minutes, parts_used]
 *             properties:
 *               notes:
 *                 type: string
 *                 example: "Remplacement de pièce effectué."
 *               photo_links:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *               time_spent_minutes:
 *                 type: integer
 *                 example: 45
 *               parts_used:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [part_name, quantity]
 *                   properties:
 *                     part_name: { type: string, example: "Filtre à huile" }
 *                     quantity: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Rapport créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: object }
 *       400:
 *         description: Données invalides
 */
router.post('/:id/report', validate(createReportSchema), interventionController.createReport);

/**
 * @swagger
 * /api/interventions/{id}/report:
 *   get:
 *     summary: Récupérer le rapport d'une intervention
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'intervention
 *     responses:
 *       200:
 *         description: Rapport récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: object }
 *       404:
 *         description: Rapport non trouvé
 */
router.get('/:id/report', interventionController.getReport);

/**
 * @swagger
 * /api/interventions/my:
 *   get:
 *     summary: Récupérer les interventions assignées au technicien connecté
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des interventions récupérée
 *       401:
 *         description: Non authentifié
 */
// [Changement] Enregistrement de la nouvelle route /api/interventions/my.
// Cette route doit être placée AVANT les routes avec paramètres :id pour éviter qu'elle ne soit interprétée comme un UUID.
router.get('/my', interventionController.getMyInterventions);

module.exports = router;
