const productRepository = require('../repositories/productRepository');
const { AuditLog } = require('../models');
const ResponseHandler = require('../utils/responseHandler');

class ProductController {
    /**
     * Récupérer tous les produits actifs
     */
    async getAllProducts(req, res) {
        try {
            const products = await productRepository.findActive();
            return ResponseHandler.success(res, products, 'Produits récupérés avec succès');
        } catch (error) {
            console.error('Error in getAllProducts:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Récupérer un produit par son ID
     */
    async getProductById(req, res) {
        try {
            const product = await productRepository.findById(req.params.id);
            if (!product) {
                return ResponseHandler.notFound(res, 'Produit non trouvé');
            }
            return ResponseHandler.success(res, product, 'Produit récupéré avec succès');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }
    async createProduct(req, res) {
        try {
            // FormData sends everything as strings, so we need to parse numbers
            const productData = {
                ...req.body,
                base_price: parseFloat(req.body.base_price) || 0,
                stock_quantity: parseInt(req.body.stock_quantity, 10) || 0,
                created_by: req.userId
            };

            // Only add min_threshold if it's sent and valid (it's not in the model yet, so it won't hurt to have in data object)
            if (req.body.min_threshold) {
                const mt = parseInt(req.body.min_threshold, 10);
                if (!isNaN(mt)) productData.min_threshold = mt;
            }

            // If an image was uploaded, save the relative path
            if (req.file) {
                productData.image_url = `/uploads/products/${req.file.filename}`;
            }

            const product = await productRepository.create(productData);

            // Audit Log
            await AuditLog.create({
                user_id: req.userId,
                action: 'CREATE',
                resource_type: 'Product',
                resource_id: product.id,
                new_value: product,
                description: `Produit/Service créé: ${product.name} (${product.type})`
            });

            return ResponseHandler.created(res, product, 'Produit créé avec succès');
        } catch (error) {
            console.error('Error in createProduct:', error); // Add logging
            return ResponseHandler.serverError(res, error);
        }
    }

    async updateProduct(req, res) {
        try {
            const updateData = { ...req.body };

            // Parse numbers if they are present (FormData sends strings)
            if (updateData.base_price !== undefined) updateData.base_price = parseFloat(updateData.base_price) || 0;
            if (updateData.stock_quantity !== undefined) updateData.stock_quantity = parseInt(updateData.stock_quantity, 10) || 0;

            if (updateData.min_threshold !== undefined) {
                const mt = parseInt(updateData.min_threshold, 10);
                if (!isNaN(mt)) updateData.min_threshold = mt;
                else delete updateData.min_threshold;
            }

            // If a new image was uploaded, update the image_url
            if (req.file) {
                updateData.image_url = `/uploads/products/${req.file.filename}`;
                // TODO: Optionally delete old image file from filesystem
            }

            const product = await productRepository.update(req.params.id, updateData);
            if (!product) return ResponseHandler.notFound(res, 'Produit non trouvé');

            // Audit Log
            await AuditLog.create({
                user_id: req.userId,
                action: 'UPDATE',
                resource_type: 'Product',
                resource_id: product.id,
                new_value: product,
                description: `Produit/Service mis à jour: ${product.name}`
            });

            return ResponseHandler.success(res, product, 'Produit mis à jour avec succès');
        } catch (error) {
            console.error('Error in updateProduct:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    async deleteProduct(req, res) {
        try {
            const result = await productRepository.delete(req.params.id);
            if (!result) return ResponseHandler.notFound(res, 'Produit non trouvé');

            // Audit Log
            await AuditLog.create({
                user_id: req.userId,
                action: 'DELETE',
                resource_type: 'Product',
                resource_id: req.params.id,
                description: `Produit/Service supprimé: ID ${req.params.id}`
            });

            return ResponseHandler.success(res, null, 'Produit supprimé avec succès');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }
}

module.exports = new ProductController();
