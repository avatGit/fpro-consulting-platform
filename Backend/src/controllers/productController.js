const { Product, Category, Supplier } = require('../models');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * GET /api/products
 * Liste des produits avec pagination, filtres et recherche
 */
const getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      category_id = '', 
      is_active = '',
      low_stock = ''
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Construction des filtres
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { reference: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (category_id) {
      where.category_id = category_id;
    }
    
    if (is_active !== '') {
      where.is_active = is_active === 'true';
    }

    // Filtre stock bas
    if (low_stock === 'true') {
      where[Op.and] = sequelize.literal('stock_quantity <= stock_alert_threshold');
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          association: 'category',
          attributes: ['id', 'name', 'type']
        },
        {
          association: 'supplier',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Ajouter les prix TTC
    const productsWithPrices = products.map(product => ({
      ...product.toJSON(),
      price_ttc: product.getPriceTTC(),
      is_low_stock: product.isLowStock()
    }));

    return ResponseHandler.successWithPagination(
      res,
      productsWithPrices,
      {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
        totalItems: count
      },
      'Produits récupérés avec succès'
    );

  } catch (error) {
    logger.error('Get all products error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

/**
 * GET /api/products/:id
 * Détails d'un produit
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          association: 'category',
          attributes: ['id', 'name', 'type', 'description']
        },
        {
          association: 'supplier',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    if (!product) {
      return ResponseHandler.notFound(res, 'Produit non trouvé');
    }

    const productData = {
      ...product.toJSON(),
      price_ttc: product.getPriceTTC(),
      is_low_stock: product.isLowStock()
    };

    return ResponseHandler.success(res, productData, 'Produit récupéré');

  } catch (error) {
    logger.error('Get product by ID error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

/**
 * POST /api/products
 * Créer un nouveau produit
 */
const createProduct = async (req, res) => {
  try {
    const productData = req.validatedData;

    // Vérifier que la catégorie existe
    const category = await Category.findByPk(productData.category_id);
    if (!category) {
      return ResponseHandler.notFound(res, 'Catégorie non trouvée');
    }

    // Vérifier que c'est une catégorie de produits
    if (category.type !== 'product') {
      return ResponseHandler.error(res, 'Cette catégorie n\'est pas pour les produits', 400);
    }

    // Créer le produit
    const product = await Product.create(productData);

    // Récupérer le produit avec ses relations
    const productWithRelations = await Product.findByPk(product.id, {
      include: ['category', 'supplier']
    });

    logger.info(`Product created: ${product.name} by user ${req.userId}`);

    return ResponseHandler.created(res, {
      ...productWithRelations.toJSON(),
      price_ttc: productWithRelations.getPriceTTC()
    }, 'Produit créé avec succès');

  } catch (error) {
    logger.error('Create product error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return ResponseHandler.error(res, 'Cette référence existe déjà', 409);
    }
    
    return ResponseHandler.serverError(res, error);
  }
};

/**
 * PUT /api/products/:id
 * Mettre à jour un produit
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.validatedData;

    const product = await Product.findByPk(id);

    if (!product) {
      return ResponseHandler.notFound(res, 'Produit non trouvé');
    }

    // Si changement de catégorie, vérifier qu'elle existe
    if (updates.category_id) {
      const category = await Category.findByPk(updates.category_id);
      if (!category || category.type !== 'product') {
        return ResponseHandler.error(res, 'Catégorie invalide', 400);
      }
    }

    await product.update(updates);

    const productWithRelations = await Product.findByPk(id, {
      include: ['category', 'supplier']
    });

    logger.info(`Product updated: ${product.name} by user ${req.userId}`);

    return ResponseHandler.success(res, {
      ...productWithRelations.toJSON(),
      price_ttc: productWithRelations.getPriceTTC()
    }, 'Produit mis à jour');

  } catch (error) {
    logger.error('Update product error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

/**
 * DELETE /api/products/:id
 * Désactiver un produit
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return ResponseHandler.notFound(res, 'Produit non trouvé');
    }

    // Désactiver plutôt que supprimer
    await product.update({ is_active: false });

    logger.info(`Product deactivated: ${product.name} by user ${req.userId}`);

    return ResponseHandler.success(res, null, 'Produit désactivé');

  } catch (error) {
    logger.error('Delete product error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

/**
 * GET /api/products/low-stock
 * Produits en alerte de stock bas
 */
const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: sequelize.literal('stock_quantity <= stock_alert_threshold AND is_active = true'),
      include: ['category', 'supplier'],
      order: [['stock_quantity', 'ASC']]
    });

    const productsData = products.map(p => ({
      ...p.toJSON(),
      price_ttc: p.getPriceTTC()
    }));

    return ResponseHandler.success(res, productsData, `${products.length} produits en stock bas`);

  } catch (error) {
    logger.error('Get low stock products error:', error);
    return ResponseHandler.serverError(res, error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts
};