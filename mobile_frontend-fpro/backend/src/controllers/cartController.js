const cartService = require('../services/cartService');
const ResponseHandler = require('../utils/responseHandler');

class CartController {
    async getCart(req, res) {
        try {
            const cart = await cartService.getCart(req.userId);
            return ResponseHandler.success(res, cart, 'Panier récupéré');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    async addItem(req, res) {
        try {
            const { productId, quantity } = req.body;
            const cart = await cartService.addItem(req.userId, productId, quantity);
            return ResponseHandler.success(res, cart, 'Article ajouté au panier');
        } catch (error) {
            if (error.message === 'Produit non trouvé' || error.message === 'Stock insuffisant') {
                return ResponseHandler.error(res, error.message, 400);
            }
            return ResponseHandler.serverError(res, error);
        }
    }

    async updateItem(req, res) {
        try {
            const { itemId } = req.params;
            const { quantity } = req.body;
            const cart = await cartService.updateItem(req.userId, itemId, quantity);
            return ResponseHandler.success(res, cart, 'Article mis à jour');
        } catch (error) {
            if (error.message === 'Article non trouvé dans le panier' || error.message === 'Stock insuffisant') {
                return ResponseHandler.error(res, error.message, 400);
            }
            return ResponseHandler.serverError(res, error);
        }
    }

    async removeItem(req, res) {
        try {
            const { itemId } = req.params;
            const cart = await cartService.removeItem(req.userId, itemId);
            return ResponseHandler.success(res, cart, 'Article supprimé du panier');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    async clearCart(req, res) {
        try {
            const cart = await cartService.clearCart(req.userId);
            return ResponseHandler.success(res, cart, 'Panier vidé');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }
}

module.exports = new CartController();
