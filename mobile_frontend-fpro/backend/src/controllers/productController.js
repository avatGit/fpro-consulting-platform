const productService = require('../services/productService');
const ResponseHandler = require('../utils/responseHandler');

class ProductController {
    /**
     * Create a new product or service
     * @route POST /api/products
     */
    async createProduct(req, res) {
        try {
            const product = await productService.createProduct(req.body, req.userId);
            return ResponseHandler.created(res, product, 'Produit créé avec succès');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Update an existing product
     * @route PUT /api/products/:id
     */
    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const product = await productService.updateProduct(id, req.body, req.userId);
            return ResponseHandler.success(res, product, 'Produit mis à jour avec succès');
        } catch (error) {
            if (error.message === 'Produit non trouvé') {
                return ResponseHandler.notFound(res, error.message);
            }
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Delete a product (Soft delete)
     * @route DELETE /api/products/:id
     */
    async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            await productService.deleteProduct(id, req.userId);
            return ResponseHandler.success(res, null, 'Produit supprimé avec succès');
        } catch (error) {
            if (error.message === 'Produit non trouvé') {
                return ResponseHandler.notFound(res, error.message);
            }
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Get a single product by ID
     * @route GET /api/products/:id
     */
    async getProduct(req, res) {
        try {
            const { id } = req.params;
            const product = await productService.getProduct(id);
            return ResponseHandler.success(res, product, 'Détails du produit récupérés');
        } catch (error) {
            if (error.message === 'Produit non trouvé') {
                return ResponseHandler.notFound(res, error.message);
            }
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * List all products with pagination and filters
     * @route GET /api/products
     */
    async listProducts(req, res) {
        try {
            const result = await productService.listProducts(req.query);
            return ResponseHandler.successWithPagination(
                res,
                result.products,
                result.pagination,
                'Liste des produits récupérée'
            );
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }
}

module.exports = new ProductController();
