const Joi = require('joi');

/**
 * Schéma de validation pour l'inscription
 */
const registerSchema = Joi.object({
  companyName: Joi.string().min(2).max(255).required()
    .messages({
      'string.empty': 'Le nom de l\'entreprise est requis',
      'string.min': 'Le nom doit contenir au moins 2 caractères'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Email invalide',
      'string.empty': 'L\'email est requis'
    }),
  phone: Joi.string().max(20).required()
    .messages({
      'string.empty': 'Le téléphone est requis'
    }),
  password: Joi.string().min(6).max(100).required()
    .messages({ // Removed strict regex for now to match frontend simple validation length > 6
      'string.empty': 'Le mot de passe est requis',
      'string.min': 'Le mot de passe doit contenir au moins 6 caractères'
    }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    .messages({
      'any.only': 'Les mots de passe ne correspondent pas'
    })
});

/**
 * Schéma de validation pour la connexion
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Email invalide',
      'string.empty': 'L\'email est requis'
    }),
  password: Joi.string().required()
    .messages({
      'string.empty': 'Le mot de passe est requis'
    })
});

/**
 * Schéma de validation pour la mise à jour du profil
 */
const updateProfileSchema = Joi.object({
  first_name: Joi.string().min(2).max(100).optional(),
  last_name: Joi.string().allow('').max(100).optional(),
  phone: Joi.string().max(20).optional(),
  email: Joi.string().email().optional()
    .messages({
      'string.email': 'Email invalide'
    })
});

/**
 * Schéma de validation pour le changement de mot de passe
 */
const changePasswordSchema = Joi.object({
  current_password: Joi.string().required()
    .messages({
      'string.empty': 'Le mot de passe actuel est requis'
    }),
  new_password: Joi.string().min(8).max(100).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'string.empty': 'Le nouveau mot de passe est requis',
      'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
      'string.pattern.base': 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    })
});

/**
 * Middleware de validation
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(422).json({
        success: false,
        message: 'Erreur de validation',
        errors
      });
    }

    req.validatedData = value;
    next();
  };
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema
};