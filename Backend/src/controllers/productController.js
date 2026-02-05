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
}

module.exports = new ProductController();
