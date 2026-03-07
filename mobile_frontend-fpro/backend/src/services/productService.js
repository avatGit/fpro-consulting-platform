const { Product } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class ProductService {
    /**
     * Create a new product or service
     * @param {Object} data - Product data
     * @param {String} userId - ID of the user creating the product
     * @returns {Promise<Object>} Created product
     */
    async createProduct(data, userId) {
        try {
            const product = await Product.create({
                ...data,
                created_by: userId,
                updated_by: userId
            });
            logger.info(`Product created: ${product.id} by user ${userId}`);
            return product;
        } catch (error) {
            logger.error('Error creating product:', error);
            throw error;
        }
    }

    /**
     * Update an existing product
     * @param {String} id - Product ID
     * @param {Object} data - Updates
     * @param {String} userId - ID of the user updating the product
     * @returns {Promise<Object>} Updated product
     */
    async updateProduct(id, data, userId) {
        try {
            const product = await Product.findByPk(id);
            if (!product) {
                throw new Error('Produit non trouvé');
            }

            await product.update({
                ...data,
                updated_by: userId
            });
            logger.info(`Product updated: ${id} by user ${userId}`);
            return product;
        } catch (error) {
            logger.error(`Error updating product ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete a product (Soft delete via is_active = false)
     * @param {String} id - Product ID
     * @param {String} userId - ID of the user deleting the product
     * @returns {Promise<void>}
     */
    async deleteProduct(id, userId) {
        try {
            const product = await Product.findByPk(id);
            if (!product) {
                throw new Error('Produit non trouvé');
            }

            // Soft delete
            await product.update({
                is_active: false,
                updated_by: userId
            });
            logger.info(`Product soft-deleted: ${id} by user ${userId}`);
        } catch (error) {
            logger.error(`Error deleting product ${id}:`, error);
            throw error;
        }
    }

    /**
     * Get product details
     * @param {String} id - Product ID
     * @returns {Promise<Object>} Product details
     */
    async getProduct(id) {
        try {
            const product = await Product.findByPk(id);
            if (!product) {
                throw new Error('Produit non trouvé');
            }
            return product;
        } catch (error) {
            logger.error(`Error fetching product ${id}:`, error);
            throw error;
        }
    }

    /**
     * List products with pagination and filtering
     * @param {Object} options - Filter and pagination options
     * @returns {Promise<Object>} List of products and pagination info
     */
    async listProducts(options = {}) {
        try {
            const { page = 1, limit = 20, type, search, is_active } = options;
            const offset = (page - 1) * limit;

            const where = {};

            // Filter by active status (default to true unless explicitly requested otherwise)
            if (is_active !== undefined) {
                where.is_active = is_active === 'true';
            } else {
                where.is_active = true;
            }

            // Filter by type
            if (type) {
                where.type = type;
            }

            // Search by name or sku
            if (search) {
                where[Op.or] = [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { sku: { [Op.iLike]: `%${search}%` } }
                ];
            }

            const { rows, count } = await Product.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['name', 'ASC']]
            });

            return {
                products: rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalItems: count,
                    totalPages: Math.ceil(count / limit)
                }
            };
        } catch (error) {
            logger.error('Error listing products:', error);
            throw error;
        }
    }
}

module.exports = new ProductService();
