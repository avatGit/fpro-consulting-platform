const Joi = require('joi');

/**
 * Schéma de validation pour créer une catégorie
 */
const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
    .messages({
      'string.empty': 'Le nom de la catégorie est requis',
      'string.min': 'Le nom doit contenir au moins 2 caractères'
    }),
  type: Joi.string().valid('product', 'service').required()
    .messages({
      'any.only': 'Le type doit être "product" ou "service"',
      'any.required': 'Le type est requis'
    }),
  description: Joi.string().max(1000).optional().allow(''),
  parent_id: Joi.string().uuid().optional().allow(null),
  is_active: Joi.boolean().optional()
});

/**
 * Schéma de validation pour créer un produit
 */
const createProductSchema = Joi.object({
  category_id: Joi.string().uuid().required()
    .messages({
      'string.empty': 'La catégorie est requise',
      'string.guid': 'ID de catégorie invalide'
    }),
  supplier_id: Joi.string().uuid().optional().allow(null),
  name: Joi.string().min(2).max(255).required()
    .messages({
      'string.empty': 'Le nom du produit est requis'
    }),
  reference: Joi.string().max(100).optional().allow(''),
  description: Joi.string().max(5000).optional().allow(''),
  unit_price: Joi.number().min(0).required()
    .messages({
      'number.min': 'Le prix doit être positif',
      'any.required': 'Le prix unitaire est requis'
    }),
  tax_rate: Joi.number().min(0).max(100).default(18),
  stock_quantity: Joi.number().integer().min(0).default(0),
  stock_alert_threshold: Joi.number().integer().min(0).default(10),
  unit: Joi.string().max(50).default('unité'),
  image_url: Joi.string().uri().max(500).optional().allow(''),
  is_active: Joi.boolean().default(true)
});

/**
 * Schéma de validation pour mettre à jour un produit
 */
const updateProductSchema = Joi.object({
  category_id: Joi.string().uuid().optional(),
  supplier_id: Joi.string().uuid().optional().allow(null),
  name: Joi.string().min(2).max(255).optional(),
  reference: Joi.string().max(100).optional().allow(''),
  description: Joi.string().max(5000).optional().allow(''),
  unit_price: Joi.number().min(0).optional(),
  tax_rate: Joi.number().min(0).max(100).optional(),
  stock_quantity: Joi.number().integer().min(0).optional(),
  stock_alert_threshold: Joi.number().integer().min(0).optional(),
  unit: Joi.string().max(50).optional(),
  image_url: Joi.string().uri().max(500).optional().allow(''),
  is_active: Joi.boolean().optional()
});

/**
 * Schéma de validation pour créer un service
 */
const createServiceSchema = Joi.object({
  category_id: Joi.string().uuid().required()
    .messages({
      'string.empty': 'La catégorie est requise'
    }),
  name: Joi.string().min(2).max(255).required()
    .messages({
      'string.empty': 'Le nom du service est requis'
    }),
  type: Joi.string()
    .valid('maintenance', 'location', 'development', 'formation', 'audit', 'marketing', 'other')
    .required()
    .messages({
      'any.only': 'Type de service invalide'
    }),
  description: Joi.string().max(5000).optional().allow(''),
  base_price: Joi.number().min(0).optional().allow(null),
  tax_rate: Joi.number().min(0).max(100).default(18),
  duration_hours: Joi.number().integer().min(0).optional().allow(null),
  unit: Joi.string().max(50).default('intervention'),
  is_active: Joi.boolean().default(true)
});

/**
 * Schéma de validation pour mettre à jour un service
 */
const updateServiceSchema = Joi.object({
  category_id: Joi.string().uuid().optional(),
  name: Joi.string().min(2).max(255).optional(),
  type: Joi.string()
    .valid('maintenance', 'location', 'development', 'formation', 'audit', 'marketing', 'other')
    .optional(),
  description: Joi.string().max(5000).optional().allow(''),
  base_price: Joi.number().min(0).optional().allow(null),
  tax_rate: Joi.number().min(0).max(100).optional(),
  duration_hours: Joi.number().integer().min(0).optional().allow(null),
  unit: Joi.string().max(50).optional(),
  is_active: Joi.boolean().optional()
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
  createCategorySchema,
  createProductSchema,
  updateProductSchema,
  createServiceSchema,
  updateServiceSchema
};