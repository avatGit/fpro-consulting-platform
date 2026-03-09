const Joi = require('joi');

/**
 * Schéma de validation pour l'inscription
 */
const registerSchema = Joi.object({
  // Informations entreprise
  company: Joi.object({
    name: Joi.string().min(2).max(255).required()
      .messages({
        'string.empty': 'Le nom de l\'entreprise est requis',
        'string.min': 'Le nom doit contenir au moins 2 caractères'
      }),
    siret: Joi.string().length(14).pattern(/^[0-9]+$/).optional()
      .messages({
        'string.length': 'Le SIRET doit contenir exactement 14 chiffres',
        'string.pattern.base': 'Le SIRET ne doit contenir que des chiffres'
      }),
    address: Joi.string().max(500).optional(),
    city: Joi.string().max(100).optional(),
    postal_code: Joi.string().max(10).optional(),
    phone: Joi.string().max(20).optional(),
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Email entreprise invalide',
        'string.empty': 'L\'email de l\'entreprise est requis'
      }),
    website: Joi.string().uri().allow('', null).optional()
  }).required(),

  // Informations utilisateur
  user: Joi.object({
    first_name: Joi.string().min(2).max(100).required()
      .messages({
        'string.empty': 'Le prénom est requis',
        'string.min': 'Le prénom doit contenir au moins 2 caractères'
      }),
    last_name: Joi.string().min(2).max(100).required()
      .messages({
        'string.empty': 'Le nom est requis',
        'string.min': 'Le nom doit contenir au moins 2 caractères'
      }),
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Email utilisateur invalide',
        'string.empty': 'L\'email est requis'
      }),
    password: Joi.string().min(8).max(100).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.empty': 'Le mot de passe est requis',
        'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
        'string.pattern.base': 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      }),
    phone: Joi.string().max(20).optional()
  }).required()
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
  last_name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().max(20).optional(),
  email: Joi.string().email().optional()
    .messages({
      'string.email': 'Email invalide'
    }),
  skills: Joi.array().items(Joi.string()).optional()
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