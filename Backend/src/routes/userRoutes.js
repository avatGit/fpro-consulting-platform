const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

// Toutes les routes de ce fichier nécessitent d'être admin
router.use(authenticate);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lister tous les utilisateurs (Admin)
 *     tags: [Users]
 */
router.get('/', userController.listUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur (Admin)
 *     tags: [Users]
 */
router.put('/:id', userController.updateUser);

/**
 * @swagger
 * /api/users/{id}/toggle-status:
 *   patch:
 *     summary: Activer/Désactiver un compte utilisateur (Admin)
 *     tags: [Users]
 */
router.patch('/:id/toggle-status', userController.toggleUserStatus);

/**
 * @swagger
 * /api/users/bulk-update:
 *   post:
 *     summary: Opérations en masse sur les utilisateurs (Admin)
 *     tags: [Users]
 */
router.post('/bulk-update', userController.bulkUpdateUsers);

/**
 * @swagger
 * /api/users/{id}/stats:
 *   get:
 *     summary: Obtenir les statistiques d'un utilisateur (Admin)
 *     tags: [Users]
 */
router.get('/:id/stats', userController.getUserStats);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur (Admin)
 *     tags: [Users]
 */
router.delete('/:id', userController.deleteUser);

module.exports = router;
