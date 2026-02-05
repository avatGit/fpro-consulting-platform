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
            console.log(`Fetching orders for company_id: ${req.user.company_id}`);
            const orders = await Order.findAll({
                where: { company_id: req.user.company_id },
                include: [{
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                }],
                order: [['created_at', 'DESC']]
            });
            console.log(`Found ${orders.length} orders for company ${req.user.company_id}`);
            return ResponseHandler.success(res, orders, 'Liste des commandes récupérée');
        } catch (error) {
            console.error('Error listing user orders:', error);
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
}

module.exports = new OrderController();
