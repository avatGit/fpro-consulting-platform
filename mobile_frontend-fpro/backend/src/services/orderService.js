const orderRepository = require('../repositories/orderRepository');
const quoteRepository = require('../repositories/quoteRepository');
const productRepository = require('../repositories/productRepository');
const { sequelize } = require('../models');

class OrderService {
    async createFromQuote(quoteId) {
        const quote = await quoteRepository.findWithDetails(quoteId);
        if (!quote) throw new Error('Devis non trouvé');
        if (quote.status !== 'accepted') {
            throw new Error('Le devis doit être accepté pour créer une commande');
        }

        const transaction = await sequelize.transaction();
        try {
            const orderNumber = await orderRepository.generateOrderNumber();

            const orderData = {
                order_number: orderNumber,
                quote_id: quote.id,
                user_id: quote.user_id,
                company_id: quote.company_id,
                status: 'pending',
                payment_status: 'pending',
                total_amount: quote.total_amount
            };

            const orderItems = quote.items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                subtotal: item.subtotal
            }));

            const order = await orderRepository.createWithItems(orderData, orderItems, transaction);

            // Mark quote as converted? (handled by quote status update usually)

            await transaction.commit();
            return await orderRepository.findWithDetails(order.id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async validateOrder(orderId) {
        const order = await orderRepository.findWithDetails(orderId);
        if (!order) throw new Error('Commande non trouvée');
        if (order.status !== 'pending') throw new Error('La commande est déjà validée ou traitée');

        const transaction = await sequelize.transaction();
        try {
            // Stock impact
            for (const item of order.items) {
                if (item.product.type === 'product') {
                    const product = await productRepository.findById(item.product_id);
                    if (product.stock_quantity < item.quantity) {
                        throw new Error(`Stock insuffisant pour ${product.name}`);
                    }
                    await product.decrement('stock_quantity', { by: item.quantity, transaction });
                }
            }

            await order.update({ status: 'validated' }, { transaction });

            // [Changement] Notification au client lors de la validation
            const notificationService = require('./notificationService');
            await notificationService.sendNotification(
                order.user_id,
                'order_confirmation',
                'in_app',
                {
                    subject: 'Commande confirmée',
                    message: `Votre commande #${order.order_number} a été validée.`
                }
            );

            await transaction.commit();
            return await orderRepository.findWithDetails(orderId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // [Changement] Ajout de la méthode refuseOrder pour permettre à l'agent d'annuler une commande.
    // Cette méthode met à jour le statut, et pourrait être étendue pour envoyer une notification.
    async refuseOrder(orderId, message) {
        const order = await orderRepository.findWithDetails(orderId);
        if (!order) throw new Error('Commande non trouvée');
        if (order.status !== 'pending') throw new Error('La commande est déjà validée ou traitée');

        await order.update({
            status: 'refused', // [Changement] Utilisation de 'refused' au lieu de 'cancelled'
            notes: message
        });

        // [Changement] Notification in-app via notificationService
        const notificationService = require('./notificationService');
        await notificationService.sendNotification(
            order.user_id,
            'order_confirmation',
            'in_app',
            {
                subject: 'Commande refusée',
                message: `Votre commande #${order.order_number} a été refusée. Motif : ${message || 'Non spécifié'}`
            }
        );

        return await orderRepository.findWithDetails(orderId);
    }

    // [Changement] Marquer la commande comme livrée (Agent)
    async markAsDelivered(orderId) {
        const order = await orderRepository.findWithDetails(orderId);
        if (!order) throw new Error('Commande non trouvée');
        if (order.status !== 'validated' && order.status !== 'processing') {
            throw new Error('La commande doit être validée pour être marquée comme livrée');
        }

        await order.update({ status: 'delivered' });

        const notificationService = require('./notificationService');
        await notificationService.sendNotification(
            order.user_id,
            'order_confirmation',
            'in_app',
            {
                subject: 'Commande livrée',
                message: `Votre commande #${order.order_number} est maintenant livrée.`
            }
        );

        return await orderRepository.findWithDetails(orderId);
    }

    // [Changement] Confirmer la réception (Client)
    async confirmReceipt(orderId, userId) {
        const order = await orderRepository.findWithDetails(orderId);
        if (!order) throw new Error('Commande non trouvée');
        if (order.user_id !== userId) throw new Error('Accès non autorisé');
        if (order.status !== 'delivered') {
            throw new Error('Vous ne pouvez confirmer que les commandes déjà livrées');
        }

        await order.update({ status: 'completed' });

        // Notification facultative aux agents ou juste log
        return await orderRepository.findWithDetails(orderId);
    }
}

module.exports = new OrderService();
