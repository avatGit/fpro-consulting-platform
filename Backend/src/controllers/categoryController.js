const { Category, Product, Service } = require('../models');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * GET /api/categories
 * Liste des catégories
 */
const getAllCategories = async (req, res) => {
  try {
    const { type = '', is_active = '' } = req.query;

    const where = {};
    
    if (type) {
      where.type = type;
    }
    
    if (is_active !== '') {
      where.is_active = is_active === 'true';
    }

    const categories = await Category.findAll({
      where,
      include: [
        {
          association: 'parent',
          attributes: ['id', 'name']
        },
        {
          association: 'subcategories',
          attributes: ['id', 'name', 'is_active']
        }
      ],
      order: [['name', 'ASC']]
    });

    return ResponseHandler.success(res, categories, 'Catégories récupérées');

  } catch (error) {
    logger.error('Get all categories error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

/**
 * GET /api/categories/:id
 * Détails d'une catégorie
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [
        {
          association: 'parent',
          attributes: ['id', 'name']
        },
        {
          association: 'subcategories',
          attributes: ['id', 'name', 'is_active']
        }
      ]
    });

    if (!category) {
      return ResponseHandler.notFound(res, 'Catégorie non trouvée');
    }

    // Compter les produits/services dans cette catégorie
    let itemCount = 0;
    if (category.type === 'product') {
      itemCount = await Product.count({ where: { category_id: id } });
    } else {
      itemCount = await Service.count({ where: { category_id: id } });
    }

    const categoryData = {
      ...category.toJSON(),
      item_count: itemCount
    };

    return ResponseHandler.success(res, categoryData, 'Catégorie récupérée');

  } catch (error) {
    logger.error('Get category by ID error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

/**
 * POST /api/categories
 * Créer une nouvelle catégorie
 */
const createCategory = async (req, res) => {
  try {
    const categoryData = req.validatedData;

    // Si parent_id est fourni, vérifier qu'il existe
    if (categoryData.parent_id) {
      const parentCategory = await Category.findByPk(categoryData.parent_id);
      
      if (!parentCategory) {
        return ResponseHandler.notFound(res, 'Catégorie parente non trouvée');
      }
      
      // Vérifier que les types correspondent
      if (parentCategory.type !== categoryData.type) {
        return ResponseHandler.error(
          res, 
          'La catégorie parente doit être du même type (product ou service)', 
          400
        );
      }
    }

    const category = await Category.create(categoryData);

    logger.info(`Category created: ${category.name} by user ${req.userId}`);

    return ResponseHandler.created(res, category, 'Catégorie créée avec succès');

  } catch (error) {
    logger.error('Create category error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

/**
 * PUT /api/categories/:id
 * Mettre à jour une catégorie
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.validatedData;

    const category = await Category.findByPk(id);

    if (!category) {
      return ResponseHandler.notFound(res, 'Catégorie non trouvée');
    }

    // Ne pas permettre de changer le type si la catégorie contient des items
    if (updates.type && updates.type !== category.type) {
      const itemCount = category.type === 'product' 
        ? await Product.count({ where: { category_id: id } })
        : await Service.count({ where: { category_id: id } });
      
      if (itemCount > 0) {
        return ResponseHandler.error(
          res, 
          'Impossible de changer le type d\'une catégorie contenant des éléments', 
          400
        );
      }
    }

    // Vérifier qu'on ne crée pas de boucle dans la hiérarchie
    if (updates.parent_id) {
      if (updates.parent_id === id) {
        return ResponseHandler.error(res, 'Une catégorie ne peut pas être son propre parent', 400);
      }
      
      const parentCategory = await Category.findByPk(updates.parent_id);
      if (!parentCategory) {
        return ResponseHandler.notFound(res, 'Catégorie parente non trouvée');
      }
    }

    await category.update(updates);

    logger.info(`Category updated: ${category.name} by user ${req.userId}`);

    return ResponseHandler.success(res, category, 'Catégorie mise à jour');

  } catch (error) {
    logger.error('Update category error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

/**
 * DELETE /api/categories/:id
 * Désactiver une catégorie
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return ResponseHandler.notFound(res, 'Catégorie non trouvée');
    }

    // Vérifier si la catégorie contient des items
    const itemCount = category.type === 'product'
      ? await Product.count({ where: { category_id: id } })
      : await Service.count({ where: { category_id: id } });
    
    if (itemCount > 0) {
      return ResponseHandler.error(
        res,
        `Impossible de supprimer une catégorie contenant ${itemCount} élément(s)`,
        400
      );
    }

    // Désactiver plutôt que supprimer
    await category.update({ is_active: false });

    logger.info(`Category deactivated: ${category.name} by user ${req.userId}`);

    return ResponseHandler.success(res, null, 'Catégorie désactivée');

  } catch (error) {
    logger.error('Delete category error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};