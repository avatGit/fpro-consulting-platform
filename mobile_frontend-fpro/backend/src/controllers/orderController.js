const orderService = require('../services/orderService');
const ResponseHandler = require('../utils/responseHandler');

class OrderController {
    async createFromQuote(req, res) {
        try {
            const { quoteId } = req.body;
            const order = await orderService.createFromQuote(quoteId);
            return ResponseHandler.created(res, order, 'Commande créée avec succès');
        } catch (error) {
            if (error.message === 'Devis non trouvé' || error.message === 'Le devis doit être accepté pour créer une commande') {
                return ResponseHandler.error(res, error.message, 400);
            }
            return ResponseHandler.serverError(res, error);
        }
    }

    async getOrder(req, res) {
        try {
            const { id } = req.params;
            const order = await require('../repositories/orderRepository').findWithDetails(id);
            if (!order) return ResponseHandler.notFound(res, 'Commande non trouvée');
            return ResponseHandler.success(res, order, 'Détails de la commande récupérés');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    async listUserOrders(req, res) {
        try {
            const { Order, OrderItem, Product } = require('../models');
            // [Changement] Modification de la visibilité des commandes : les Agents et Admins peuvent désormais voir toutes les commandes
            const where = (req.userRole === 'admin' || req.userRole === 'agent')
                ? {}
                : { user_id: req.userId };

            const orders = await Order.findAll({
                where,
                include: [
                    {
                        model: OrderItem,
                        as: 'items',
                        include: [{ model: Product, as: 'product' }]
                    },
                    { model: require('../models').User, as: 'user', attributes: ['first_name', 'last_name', 'email'] }
                ],
                order: [['created_at', 'DESC']]
            });
            return ResponseHandler.success(res, orders, 'Liste des commandes récupérée');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    async validateOrder(req, res) {
        try {
            const { id } = req.params;
            const order = await orderService.validateOrder(id);
            return ResponseHandler.success(res, order, 'Commande validée et stock mis à jour');
        } catch (error) {
            if (error.message.includes('Stock insuffisant') || error.message === 'Commande non trouvée') {
                return ResponseHandler.error(res, error.message, 400);
            }
            return ResponseHandler.serverError(res, error);
        }
    }

    // [Changement] Ajout de la méthode refuseOrder pour permettre à l'Agent de refuser une commande.
    async refuseOrder(req, res) {
        try {
            const { id } = req.params;
            const { message } = req.body;
            const order = await orderService.refuseOrder(id, message);
            return ResponseHandler.success(res, order, 'Commande refusée avec succès');
        } catch (error) {
            if (error.message === 'Commande non trouvée' || error.message === 'La commande est déjà validée ou traitée') {
                return ResponseHandler.error(res, error.message, 400);
            }
            return ResponseHandler.serverError(res, error);
        }
    }

    // [Changement] Marquer comme livrée
    async markAsDelivered(req, res) {
        try {
            const { id } = req.params;
            const order = await orderService.markAsDelivered(id);
            return ResponseHandler.success(res, order, 'Commande marquée comme livrée');
        } catch (error) {
            return ResponseHandler.error(res, error.message, 400);
        }
    }

    // [Changement] Confirmer la réception
    async confirmReceipt(req, res) {
        try {
            const { id } = req.params;
            const order = await orderService.confirmReceipt(id, req.userId);
            return ResponseHandler.success(res, order, 'Réception confirmée avec succès');
        } catch (error) {
            return ResponseHandler.error(res, error.message, 400);
        }
    }
}

module.exports = new OrderController();
