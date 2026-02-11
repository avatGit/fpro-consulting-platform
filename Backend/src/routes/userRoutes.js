const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

// Toutes les routes de ce fichier nécessitent d'être authentifiées
router.use(authenticate);

// NOTE: Specific RBAC is now applied per route to allow agents on /clients

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lister tous les utilisateurs (Admin)
 *     tags: [Users]
 */
router.get('/', authorize('admin'), userController.listUsers);

/**
 * @swagger
 * /api/users/clients:
 *   get:
 *     summary: Lister les clients (Admin & Agent)
 *     tags: [Users]
 */
router.get('/clients', authorize('admin', 'agent'), userController.listClients);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur (Admin)
 *     tags: [Users]
 */
router.put('/:id', authorize('admin'), userController.updateUser);

/**
 * @swagger
 * /api/users/{id}/toggle-status:
 *   patch:
 *     summary: Activer/Désactiver un compte utilisateur (Admin)
 *     tags: [Users]
 */
router.patch('/:id/toggle-status', authorize('admin'), userController.toggleUserStatus);

/**
 * @swagger
 * /api/users/bulk-update:
 *   post:
 *     summary: Opérations en masse sur les utilisateurs (Admin)
 *     tags: [Users]
 */
router.post('/bulk-update', authorize('admin'), userController.bulkUpdateUsers);

/**
 * @swagger
 * /api/users/{id}/stats:
 *   get:
 *     summary: Obtenir les statistiques d'un utilisateur (Admin)
 *     tags: [Users]
 */
router.get('/:id/stats', authorize('admin'), userController.getUserStats);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur (Admin)
 *     tags: [Users]
 */
router.delete('/:id', authorize('admin'), userController.deleteUser);

module.exports = router;
