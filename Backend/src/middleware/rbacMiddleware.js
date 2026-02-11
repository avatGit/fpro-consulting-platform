const ResponseHandler = require('../utils/responseHandler');

/**
 * Middleware RBAC (Role-Based Access Control)
 * Vérifie que l'utilisateur a le rôle requis
 * 
 * @param {Array|String} allowedRoles - Rôle(s) autorisé(s)
 * @returns {Function} Middleware Express
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user || !req.userRole) {
      return ResponseHandler.unauthorized(res, 'Authentification requise.');
    }

    // Vérifier que l'utilisateur a le bon rôle
    if (!allowedRoles.includes(req.userRole)) {
      console.log(`[DEBUG] RBAC Forbidden: User role=${req.userRole}, Allowed=${allowedRoles}`);
      return ResponseHandler.forbidden(
        res,
        `Accès refusé. Rôle requis : ${allowedRoles.join(' ou ')}. Votre rôle : ${req.userRole}`
      );
    }

    next();
  };
};

/**
 * Middleware : Vérifier que l'utilisateur accède à ses propres données
 * Sauf s'il est admin
 * 
 * @param {String} paramName - Nom du paramètre à vérifier (ex: 'userId')
 */
const authorizeOwnerOrAdmin = (paramName = 'id') => {
  return (req, res, next) => {
    const resourceUserId = req.params[paramName];
    const currentUserId = req.userId;
    const currentUserRole = req.userRole;

    // Admin peut tout faire
    if (currentUserRole === 'admin') {
      return next();
    }

    // Vérifier que l'utilisateur accède à ses propres données
    if (resourceUserId !== currentUserId) {
      return ResponseHandler.forbidden(
        res,
        'Vous ne pouvez accéder qu\'à vos propres données.'
      );
    }

    next();
  };
};

/**
 * Middleware : Vérifier que l'utilisateur appartient à la même entreprise
 * Ou qu'il est admin
 */
const authorizeSameCompanyOrAdmin = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const targetUserId = req.params.userId || req.params.id;

    // Admin peut tout faire
    if (currentUser.role === 'admin') {
      return next();
    }

    // Récupérer l'utilisateur cible
    const { User } = require('../models');
    const targetUser = await User.findByPk(targetUserId);

    if (!targetUser) {
      return ResponseHandler.notFound(res, 'Utilisateur non trouvé');
    }

    // Vérifier qu'ils sont dans la même entreprise
    if (currentUser.company_id !== targetUser.company_id) {
      return ResponseHandler.forbidden(
        res,
        'Vous ne pouvez accéder qu\'aux utilisateurs de votre entreprise.'
      );
    }

    next();
  } catch (error) {
    return ResponseHandler.serverError(res, error);
  }
};

/**
 * Définition des permissions par rôle
 */
const PERMISSIONS = {
  admin: [
    'manage_users',
    'manage_companies',
    'manage_products',
    'manage_services',
    'manage_orders',
    'manage_maintenance',
    'manage_rentals',
    'view_all_data',
    'manage_settings'
  ],
  agent: [
    'manage_products',
    'manage_services',
    'view_orders',
    'manage_orders',
    'assign_technicians',
    'view_maintenance',
    'manage_rentals'
  ],
  technicien: [
    'view_assigned_interventions',
    'update_interventions',
    'create_reports'
  ],
  client: [
    'view_own_data',
    'create_orders',
    'view_own_orders',
    'request_maintenance',
    'book_rentals'
  ]
};

/**
 * Middleware : Vérifier une permission spécifique
 * 
 * @param {String} permission - Permission à vérifier
 */
const checkPermission = (permission) => {
  return (req, res, next) => {
    const userRole = req.userRole;

    if (!PERMISSIONS[userRole] || !PERMISSIONS[userRole].includes(permission)) {
      return ResponseHandler.forbidden(
        res,
        `Permission requise : ${permission}`
      );
    }

    next();
  };
};

module.exports = {
  authorize,
  authorizeOwnerOrAdmin,
  authorizeSameCompanyOrAdmin,
  checkPermission,
  PERMISSIONS
};