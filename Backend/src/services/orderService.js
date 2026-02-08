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
                if (item.product && item.product.type === 'product') {
                    const product = await productRepository.findById(item.product_id);
                    if (product && product.stock_quantity < item.quantity) {
                        throw new Error(`Stock insuffisant pour ${product.name}`);
                    }
                    if (product) {
                        await product.decrement('stock_quantity', { by: item.quantity, transaction });
                    }
                } else if (!item.product) {
                    console.warn(`Product not found for order item ${item.id} (product_id: ${item.product_id})`);
                }
            }

            await order.update({ status: 'validated' }, { transaction });
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

        await order.update({ status });
        return await orderRepository.findWithDetails(orderId);
    }

    async listAllOrders() {
        return await orderRepository.findAllWithDetails();
    }
}

module.exports = new OrderService();
