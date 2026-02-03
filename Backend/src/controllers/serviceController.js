const { Service, Category } = require('../models');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * GET /api/services
 * Liste des services avec pagination et filtres
 */
const getAllServices = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      category_id = '', 
      type = '',
      is_active = ''
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Construction des filtres
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (category_id) {
      where.category_id = category_id;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (is_active !== '') {
      where.is_active = is_active === 'true';
    }

    const { count, rows: services } = await Service.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          association: 'category',
          attributes: ['id', 'name', 'type']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Ajouter les prix TTC
    const servicesWithPrices = services.map(service => ({
      ...service.toJSON(),
      price_ttc: service.getPriceTTC()
    }));

    return ResponseHandler.successWithPagination(
      res,
      servicesWithPrices,
      {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
        totalItems: count
      },
      'Services récupérés avec succès'
    );

  } catch (error) {
    logger.error('Get all services error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

/**
 * GET /api/services/:id
 * Détails d'un service
 */
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id, {
      include: [
        {
          association: 'category',
          attributes: ['id', 'name', 'type', 'description']
        }
      ]
    });

    if (!service) {
      return ResponseHandler.notFound(res, 'Service non trouvé');
    }

    const serviceData = {
      ...service.toJSON(),
      price_ttc: service.getPriceTTC()
    };

    return ResponseHandler.success(res, serviceData, 'Service récupéré');

  } catch (error) {
    logger.error('Get service by ID error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

/**
 * GET /api/services/by-type/:type
 * Services par type
 */
const getServicesByType = async (req, res) => {
  try {
    const { type } = req.params;

    const validTypes = ['maintenance', 'location', 'development', 'formation', 'audit', 'marketing', 'other'];
    
    if (!validTypes.includes(type)) {
      return ResponseHandler.error(res, 'Type de service invalide', 400);
    }

    const services = await Service.findAll({
      where: { 
        type,
        is_active: true
      },
      include: ['category'],
      order: [['name', 'ASC']]
    });

    const servicesData = services.map(s => ({
      ...s.toJSON(),
      price_ttc: s.getPriceTTC()
    }));

    return ResponseHandler.success(res, servicesData, `Services de type ${type}`);

  } catch (error) {
    logger.error('Get services by type error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

/**
 * POST /api/services
 * Créer un nouveau service
 */
const createService = async (req, res) => {
  try {
    const serviceData = req.validatedData;

    // Vérifier que la catégorie existe
    const category = await Category.findByPk(serviceData.category_id);
    if (!category) {
      return ResponseHandler.notFound(res, 'Catégorie non trouvée');
    }

    // Vérifier que c'est une catégorie de services
    if (category.type !== 'service') {
      return ResponseHandler.error(res, 'Cette catégorie n\'est pas pour les services', 400);
    }

    // Créer le service
    const service = await Service.create(serviceData);

    // Récupérer le service avec ses relations
    const serviceWithRelations = await Service.findByPk(service.id, {
      include: ['category']
    });

    logger.info(`Service created: ${service.name} by user ${req.userId}`);

    return ResponseHandler.created(res, {
      ...serviceWithRelations.toJSON(),
      price_ttc: serviceWithRelations.getPriceTTC()
    }, 'Service créé avec succès');

  } catch (error) {
    logger.error('Create service error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

/**
 * PUT /api/services/:id
 * Mettre à jour un service
 */
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.validatedData;

    const service = await Service.findByPk(id);

    if (!service) {
      return ResponseHandler.notFound(res, 'Service non trouvé');
    }

    // Si changement de catégorie, vérifier qu'elle existe
    if (updates.category_id) {
      const category = await Category.findByPk(updates.category_id);
      if (!category || category.type !== 'service') {
        return ResponseHandler.error(res, 'Catégorie invalide', 400);
      }
    }

    await service.update(updates);

    const serviceWithRelations = await Service.findByPk(id, {
      include: ['category']
    });

    logger.info(`Service updated: ${service.name} by user ${req.userId}`);

    return ResponseHandler.success(res, {
      ...serviceWithRelations.toJSON(),
      price_ttc: serviceWithRelations.getPriceTTC()
    }, 'Service mis à jour');

  } catch (error) {
    logger.error('Update service error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

/**
 * DELETE /api/services/:id
 * Désactiver un service
 */
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);

    if (!service) {
      return ResponseHandler.notFound(res, 'Service non trouvé');
    }

    // Désactiver plutôt que supprimer
    await service.update({ is_active: false });

    logger.info(`Service deactivated: ${service.name} by user ${req.userId}`);

    return ResponseHandler.success(res, null, 'Service désactivé');

  } catch (error) {
    logger.error('Delete service error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  getServicesByType,
  createService,
  updateService,
  deleteService
};