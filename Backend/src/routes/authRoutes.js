const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate, registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } = require('../validators/authValidators');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscrire un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, first_name, last_name]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               first_name: { type: string }
 *               last_name: { type: string }
 *               company_name: { type: string }
 *     responses:
 *       201:
 *         description: Utilisateur créé
 */
router.post('/register',
  validate(registerSchema),
  authController.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Se connecter au système
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Connexion réussie, retourne le token
 */
router.post('/login',
  validate(loginSchema),
  authController.login
);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Rafraîchir le token d'accès
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Nouveau token généré
 */
router.post('/refresh-token',
  authController.refreshToken
);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré
 */
router.get('/profile',
  authenticate,
  authController.getProfile
);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Mettre à jour le profil utilisateur
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name: { type: string }
 *               last_name: { type: string }
 *               phone: { type: string }
 *     responses:
 *       200:
 *         description: Profil mis à jour
 */
router.put('/profile',
  authenticate,
  validate(updateProfileSchema),
  authController.updateProfile
);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Changer le mot de passe
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Mot de passe modifié
 */
router.post('/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion de l'utilisateur
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
router.post('/logout',
  authenticate,
  authController.logout
);

/**
 * @swagger
 * /api/auth/update-role:
 *   put:
 *     summary: Mettre à jour le rôle de l'utilisateur (démo)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
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
 */
router.put('/update-role',
  authenticate,
  authController.updateRole
);

module.exports = router;