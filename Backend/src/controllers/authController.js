const jwt = require('jsonwebtoken');
const { User, Company, sequelize } = require('../models');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * Générer un token JWT
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

/**
 * Générer un refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

/**
 * POST /api/auth/register
 * Inscription d'une nouvelle entreprise avec son premier utilisateur (admin entreprise)
 */
const register = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { company: companyData, user: userData } = req.validatedData;

    // 1. Vérifier si l'email utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      await transaction.rollback();
      return ResponseHandler.error(res, 'Cet email est déjà utilisé', 409);
    }

    // 2. Vérifier si l'email entreprise existe déjà
    const existingCompany = await Company.findOne({ where: { email: companyData.email } });
    if (existingCompany) {
      await transaction.rollback();
      return ResponseHandler.error(res, 'Cette entreprise existe déjà', 409);
    }

    // 3. Créer l'entreprise
    const company = await Company.create(companyData, { transaction });

    // 4. Créer l'utilisateur (le premier utilisateur d'une entreprise est automatiquement "client")
    const user = await User.create({
      ...userData,
      company_id: company.id,
      role: 'client',
      password_hash: userData.password // Sera hashé automatiquement par le hook
    }, { transaction });

    await transaction.commit();

    // 5. Générer les tokens
    const token = generateToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    logger.info(`New user registered: ${user.email}`);

    // 6. Retourner la réponse
    return ResponseHandler.created(res, {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        company: {
          id: company.id,
          name: company.name,
          email: company.email
        }
      },
      token,
      refreshToken
    }, 'Inscription réussie');

  } catch (error) {
    await transaction.rollback();
    logger.error('Register error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.validatedData;

    // 1. Récupérer l'utilisateur avec son entreprise
    const user = await User.findOne({
      where: { email },
      include: [
        {
          association: 'company',
          attributes: ['id', 'name', 'email', 'is_active']
        }
      ]
    });

    if (!user) {
      return ResponseHandler.error(res, 'Email ou mot de passe incorrect', 401);
    }

    // 2. Vérifier que le compte est actif
    if (!user.is_active) {
      return ResponseHandler.forbidden(res, 'Votre compte a été désactivé. Contactez l\'administrateur.');
    }

    // 3. Vérifier que l'entreprise est active (sauf pour admin)
    if (user.company && !user.company.is_active) {
      return ResponseHandler.forbidden(res, 'Le compte de votre entreprise a été désactivé.');
    }

    // 4. Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return ResponseHandler.error(res, 'Email ou mot de passe incorrect', 401);
    }

    // 5. Mettre à jour last_login
    await user.update({ last_login: new Date() });

    // 6. Générer les tokens
    const token = generateToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    logger.info(`User logged in: ${user.email}`);

    // 7. Retourner la réponse (le mot de passe est automatiquement exclu par toJSON)
    return ResponseHandler.success(res, {
      user: user.toJSON(),
      token,
      refreshToken
    }, 'Connexion réussie');

  } catch (error) {
    logger.error('Login error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

/**
 * GET /api/auth/profile
 * Récupérer le profil de l'utilisateur connecté
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [
        {
          association: 'company',
          attributes: ['id', 'name', 'email', 'phone', 'address', 'city']
        }
      ]
    });

    if (!user) {
      return ResponseHandler.notFound(res, 'Utilisateur non trouvé');
    }

    return ResponseHandler.success(res, user.toJSON(), 'Profil récupéré');

  } catch (error) {
    logger.error('Get profile error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

/**
 * PUT /api/auth/profile
 * Mettre à jour le profil de l'utilisateur connecté
 */
const updateProfile = async (req, res) => {
  try {
    const updates = req.validatedData;
    const user = await User.findByPk(req.userId);

    if (!user) {
      return ResponseHandler.notFound(res, 'Utilisateur non trouvé');
    }

    // Vérifier si le nouvel email n'est pas déjà utilisé
    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: updates.email } });
      if (existingUser) {
        return ResponseHandler.error(res, 'Cet email est déjà utilisé', 409);
      }
    }

    await user.update(updates);

    logger.info(`User updated profile: ${user.email}`);

    return ResponseHandler.success(res, user.toJSON(), 'Profil mis à jour');

  } catch (error) {
    logger.error('Update profile error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

/**
 * POST /api/auth/change-password
 * Changer le mot de passe de l'utilisateur connecté
 */
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.validatedData;
    const user = await User.findByPk(req.userId);

    if (!user) {
      return ResponseHandler.notFound(res, 'Utilisateur non trouvé');
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await user.comparePassword(current_password);
    if (!isPasswordValid) {
      return ResponseHandler.error(res, 'Mot de passe actuel incorrect', 401);
    }

    // Mettre à jour le mot de passe
    await user.update({ password_hash: new_password });

    logger.info(`User changed password: ${user.email}`);

    return ResponseHandler.success(res, null, 'Mot de passe modifié avec succès');

  } catch (error) {
    logger.error('Change password error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

/**
 * POST /api/auth/refresh-token
 * Rafraîchir le token d'accès avec un refresh token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return ResponseHandler.error(res, 'Refresh token manquant', 400);
    }

    // Vérifier le refresh token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return ResponseHandler.unauthorized(res, 'Refresh token invalide ou expiré');
    }

    // Récupérer l'utilisateur
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.is_active) {
      return ResponseHandler.unauthorized(res, 'Utilisateur non trouvé ou inactif');
    }

    // Générer un nouveau token
    const newToken = generateToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id);

    return ResponseHandler.success(res, {
      token: newToken,
      refreshToken: newRefreshToken
    }, 'Token rafraîchi');

  } catch (error) {
    logger.error('Refresh token error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

/**
 * POST /api/auth/logout
 * Déconnexion (côté client, invalider le token)
 */
const logout = async (req, res) => {
  try {
    logger.info(`User logged out: ${req.user.email}`);
    
    // Note: Avec JWT, la déconnexion est principalement gérée côté client
    // en supprimant le token. Pour une invalidation côté serveur, 
    // il faudrait implémenter une blacklist de tokens.
    
    return ResponseHandler.success(res, null, 'Déconnexion réussie');

  } catch (error) {
    logger.error('Logout error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  logout
};