const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

/**
 * @swagger
 * tags:
 *   name: AdminUsers
 *   description: Gestion des utilisateurs (Admin uniquement)
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Lister les utilisateurs
 *     tags: [AdminUsers]
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
 *         name: role
 *         schema: { type: string, enum: [admin, client, agent, technicien] }
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *       403:
 *         description: Accès refusé (Admin uniquement)
 */
router.get('/',
    authenticate,
    authorize('admin'),
    adminUserController.listUsers
);

/**
 * @swagger
 * /api/admin/users/agent:
 *   post:
 *     summary: Créer un nouvel Agent
 *     tags: [AdminUsers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, first_name, last_name]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               first_name: { type: string }
 *               last_name: { type: string }
 *               phone: { type: string }
 *               company_id: { type: string }
 *     responses:
 *       201:
 *         description: Agent créé avec succès
 *       400:
 *         description: Champs manquants ou invalides
 *       403:
 *         description: Accès refusé
 *       409:
 *         description: Email déjà utilisé
 */
router.post('/agent',
    authenticate,
    authorize('admin'),
    adminUserController.createAgent
);

/**
 * @swagger
 * /api/admin/users/technician:
 *   post:
 *     summary: Créer un nouveau Technicien
 *     tags: [AdminUsers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, first_name, last_name, skills]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               first_name: { type: string }
 *               last_name: { type: string }
 *               phone: { type: string }
 *               company_id: { type: string }
 *               skills: 
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       201:
 *         description: Technicien créé avec succès
 *       400:
 *         description: Champs manquants ou invalides
 *       403:
 *         description: Accès refusé
 *       409:
 *         description: Email déjà utilisé
 */
router.post('/technician',
    authenticate,
    authorize('admin'),
    adminUserController.createTechnician
);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Activer/Désactiver un utilisateur
 *     tags: [AdminUsers]
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
    adminUserController.updateUserStatus
);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     summary: Changer le rôle d'un utilisateur
 *     tags: [AdminUsers]
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
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [admin, client, agent, technicien] }
 *     responses:
 *       200:
 *         description: Rôle mis à jour
 *       403:
 *         description: Accès refusé
 */
router.put('/:id/role',
    authenticate,
    authorize('admin'),
    adminUserController.updateUserRole
);

module.exports = router;
