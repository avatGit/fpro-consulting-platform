const orderRepository = require('../repositories/orderRepository');
const quoteRepository = require('../repositories/quoteRepository');
const productRepository = require('../repositories/productRepository');
const cartService = require('./cartService');
const quoteService = require('./quoteService');
const { sequelize } = require('../models');
const logger = require('../utils/logger');

class OrderService {
    /**
     * Create an order directly from the cart (auto-generates quote)
     */
    async createFromCart(userId, companyId) {
        const cart = await cartService.getCart(userId);
        if (!cart.items || cart.items.length === 0) {
            throw new Error('Le panier est vide');
        }

        const transaction = await sequelize.transaction();
        try {
            const orderNumber = await orderRepository.generateOrderNumber();
            const orderData = {
                order_number: orderNumber,
                quote_id: null,
                user_id: userId,
                company_id: companyId,
                status: 'pending',
                payment_status: 'pending',
                total_amount: cart.total_amount
            };

            const orderItems = cart.items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                subtotal: item.subtotal
            }));

            const order = await orderRepository.createWithItems(orderData, orderItems, transaction);

            // 2. Generate Quote automatically from the created order
            await quoteService.createFromOrder(order.id, transaction);

            // 3. Clear cart
            await cartService.clearCart(userId);

            await transaction.commit();

            return await orderRepository.findWithDetails(order.id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async createFromQuote(quoteId) {
        logger.info(`[DEBUG] orderService.createFromQuote: quoteId=${quoteId}`);
        const quote = await quoteRepository.findWithDetails(quoteId);
        if (!quote) {
            logger.warn(`[DEBUG] createFromQuote: Quote not found: ${quoteId}`);
            throw new Error('Devis non trouvé');
        }

        logger.info(`[DEBUG] createFromQuote: quote status=${quote.status}`);
        if (quote.status !== 'accepted') {
            logger.warn(`[DEBUG] createFromQuote: Quote not accepted. Current status=${quote.status}`);
            throw new Error('Le devis doit être accepté pour créer une commande');
        }

        const transaction = await sequelize.transaction();
        try {
            const orderNumber = await orderRepository.generateOrderNumber();
            logger.info(`[DEBUG] createFromQuote: Generated orderNumber=${orderNumber}`);

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

            logger.info(`[DEBUG] createFromQuote: Creating order with ${orderItems.length} items...`);
            const order = await orderRepository.createWithItems(orderData, orderItems, transaction);

            await transaction.commit();
            logger.info(`[DEBUG] createFromQuote: Transaction committed. orderId=${order.id}`);

            return await orderRepository.findWithDetails(order.id);
        } catch (error) {
            logger.error('[ERROR] orderService.createFromQuote failed:', error);
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
                if (item.product && item.product.type === 'product') {
                    const product = await productRepository.findById(item.product_id);
                    if (product && product.stock_quantity < item.quantity) {
                        throw new Error(`Stock insuffisant pour ${product.name}`);
                    }
                    if (product) {
                        await product.decrement('stock_quantity', { by: item.quantity, transaction });
                    }
                }
            }

            // Move to 'processing' which represents 'In Progress' for the frontend
            await order.update({ status: 'processing' }, { transaction });
            await transaction.commit();
            return await orderRepository.findWithDetails(orderId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async updateStatus(orderId, status) {
        const order = await orderRepository.findWithDetails(orderId);
        if (!order) throw new Error('Commande non trouvée');

        // Map 'completed' to 'delivered'
        let finalStatus = status;
        if (status === 'completed') finalStatus = 'delivered';
        if (status === 'in_progress') finalStatus = 'processing';

        await order.update({ status: finalStatus });
        return await orderRepository.findWithDetails(orderId);
    }

    async listAllOrders() {
        return await orderRepository.findAllWithDetails();
    }

    async cancelOrder(orderId, reason) {
        const order = await orderRepository.findWithDetails(orderId);
        if (!order) throw new Error('Commande non trouvée');

        if (['delivered', 'cancelled'].includes(order.status)) {
            throw new Error('Impossible d\'annuler une commande déjà livrée ou annulée');
        }

        const transaction = await sequelize.transaction();
        try {
            // Restore stock if previously deducted (i.e. if order was not pending)
            // Assuming 'pending' means stock wasn't deducted yet based on validateOrder logic
            // Actually, validateOrder deducts stock. So if status is processing/shipped, stock was deducted.
            if (['processing', 'shipped'].includes(order.status)) {
                for (const item of order.items) {
                    if (item.product && item.product.type === 'product') {
                        const product = await productRepository.findById(item.product_id);
                        if (product) {
                            await product.increment('stock_quantity', { by: item.quantity, transaction });
                        }
                    }
                }
            }

            await order.update({ status: 'cancelled', cancellation_reason: reason }, { transaction });
            await transaction.commit();
            return await orderRepository.findWithDetails(orderId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = new OrderService();
