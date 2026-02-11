const productRepository = require('../repositories/productRepository');
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
                base_price: parseFloat(req.body.base_price),
                stock_quantity: parseInt(req.body.stock_quantity, 10),
                min_threshold: parseInt(req.body.min_threshold, 10),
                created_by: req.userId
            };

            // If an image was uploaded, save the relative path
            if (req.file) {
                productData.image_url = `/uploads/products/${req.file.filename}`;
            }

            const product = await productRepository.create(productData);
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
            if (updateData.base_price) updateData.base_price = parseFloat(updateData.base_price);
            if (updateData.stock_quantity) updateData.stock_quantity = parseInt(updateData.stock_quantity, 10);
            if (updateData.min_threshold) updateData.min_threshold = parseInt(updateData.min_threshold, 10);

            // If a new image was uploaded, update the image_url
            if (req.file) {
                updateData.image_url = `/uploads/products/${req.file.filename}`;
                // TODO: Optionally delete old image file from filesystem
            }

            const product = await productRepository.update(req.params.id, updateData);
            if (!product) return ResponseHandler.notFound(res, 'Produit non trouvé');
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
            return ResponseHandler.success(res, null, 'Produit supprimé avec succès');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }
}

module.exports = new ProductController();
