const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate, registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } = require('../validators/authValidators');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Gestion de l'authentification et des profils
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'une nouvelle entreprise
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [company, user]
 *             properties:
 *               company:
 *                 type: object
 *                 required: [name, email]
 *                 properties:
 *                   name: { type: string, example: "Ma Société" }
 *                   siret: { type: string, example: "12345678901234" }
 *                   address: { type: string }
 *                   city: { type: string }
 *                   postal_code: { type: string }
 *                   phone: { type: string }
 *                   email: { type: string, format: email, example: "contact@company.com" }
 *                   website: { type: string, format: uri }
 *               user:
 *                 type: object
 *                 required: [first_name, last_name, email, password]
 *                 properties:
 *                   first_name: { type: string, example: "Jean" }
 *                   last_name: { type: string, example: "Dupont" }
 *                   email: { type: string, format: email, example: "jean.dupont@company.com" }
 *                   password: { type: string, format: password, example: "Password123!" }
 *                   phone: { type: string }
 *     responses:
 *       201:
 *         description: Compte créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id: { type: string, format: uuid }
 *                         email: { type: string }
 *                         role: { type: string }
 *                     token: { type: string }
 *                     refreshToken: { type: string }
 *       400:
 *         description: Données invalides
 *       409:
 *         description: Email ou entreprise déjà existant
 */
router.post('/register',
  validate(registerSchema),
  authController.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: "jean.dupont@company.com" }
 *               password: { type: string, format: password, example: "Password123!" }
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { type: object }
 *                     token: { type: string }
 *                     refreshToken: { type: string }
 *       401:
 *         description: Identifiants invalides
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Nouveau token généré
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     token: { type: string }
 *                     refreshToken: { type: string }
 *       401:
 *         description: Refresh token invalide ou expiré
 */
router.post('/refresh-token',
  authController.refreshToken
);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtenir le profil utilisateur
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     email: { type: string }
 *                     first_name: { type: string }
 *                     last_name: { type: string }
 *                     role: { type: string }
 *                     company: { type: object }
 *       401:
 *         description: Non authentifié
 */
router.get('/profile',
  authenticate,
  authController.getProfile
);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Mettre à jour le profil
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
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
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
 *             required: [current_password, new_password]
 *             properties:
 *               current_password: { type: string, format: password }
 *               new_password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Mot de passe modifié avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Mot de passe actuel incorrect ou non authentifié
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
 *     summary: Déconnexion
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

module.exports = router;