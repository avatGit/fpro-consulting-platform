const jwt = require('jsonwebtoken');
const ResponseHandler = require('../utils/responseHandler');
const { User } = require('../models');

/**
 * Middleware de vérification du token JWT
 * Vérifie que l'utilisateur est authentifié
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseHandler.unauthorized(res, 'Token manquant. Veuillez vous connecter.');
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // 2. Vérifier et décoder le token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return ResponseHandler.unauthorized(res, 'Token expiré. Veuillez vous reconnecter.');
      }
      if (error.name === 'JsonWebTokenError') {
        return ResponseHandler.unauthorized(res, 'Token invalide.');
      }
      throw error;
    }

    // 3. Récupérer l'utilisateur depuis la base de données
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          association: 'company',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!user) {
      return ResponseHandler.unauthorized(res, 'Utilisateur non trouvé.');
    }

    // 4. Vérifier que le compte est actif
    if (!user.is_active) {
      return ResponseHandler.forbidden(res, 'Compte désactivé. Contactez l\'administrateur.');
    }

    // 5. Attacher l'utilisateur à la requête
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

/**
 * Middleware optionnel : authentification non obligatoire
 * Attache l'utilisateur s'il est connecté, sinon continue
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password_hash'] }
      });

      if (user && user.is_active) {
        req.user = user;
        req.userId = user.id;
        req.userRole = user.role;
      }
    } catch (error) {
      // En cas d'erreur, on continue sans utilisateur
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth
};