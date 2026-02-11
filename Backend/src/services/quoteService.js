const quoteRepository = require('../repositories/quoteRepository');
const cartService = require('./cartService');
const pdfService = require('./pdfService');
const { sequelize } = require('../models');

class QuoteService {
    async createFromCart(userId, companyId) {
        const cart = await cartService.getCart(userId);
        if (!cart.items || cart.items.length === 0) {
            throw new Error('Le panier est vide');
        }

        const transaction = await sequelize.transaction();
        try {
            const quoteNumber = await quoteRepository.generateQuoteNumber();
            const vatRate = 18.00; // Default VAT for Burkina Faso
            const subtotal = parseFloat(cart.total_amount);
            const vatAmount = subtotal * (vatRate / 100);
            const totalAmount = subtotal + vatAmount;

            const quoteData = {
                quote_number: quoteNumber,
                user_id: userId,
                company_id: companyId,
                status: 'pending',
                subtotal,
                vat_rate: vatRate,
                vat_amount: vatAmount,
                total_amount: totalAmount,
                valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            };

            const quoteItems = cart.items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                subtotal: item.subtotal
            }));

            const quote = await quoteRepository.createWithItems(quoteData, quoteItems, transaction);

            // Clear cart after successful quote generation
            await cartService.clearCart(userId);

            await transaction.commit();
            return await quoteRepository.findWithDetails(quote.id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async createFromOrder(orderId, transaction) {
        const { Order, OrderItem } = require('../models');
        const order = await Order.findByPk(orderId, {
            include: [{ model: OrderItem, as: 'items' }]
        });

        if (!order) throw new Error('Commande non trouvée');

        const quoteNumber = await quoteRepository.generateQuoteNumber();
        const vatRate = 18.00;
        const subtotal = parseFloat(order.total_amount);
        const vatAmount = subtotal * (vatRate / 100);
        const totalAmount = subtotal + vatAmount;

        const quoteData = {
            quote_number: quoteNumber,
            user_id: order.user_id,
            company_id: order.company_id,
            status: 'accepted', // Auto-accepted for direct orders
            subtotal,
            vat_rate: vatRate,
            vat_amount: vatAmount,
            total_amount: totalAmount,
            valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };

        const quoteItems = order.items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal
        }));

        const quote = await quoteRepository.createWithItems(quoteData, quoteItems, transaction);

        // Link quote back to order
        await order.update({ quote_id: quote.id }, { transaction });

        return quote;
    }

    async createManually(userId, companyId, items) {
        if (!items || items.length === 0) {
            throw new Error('Aucun article fourni');
        }

        const transaction = await sequelize.transaction();
        try {
            const quoteNumber = await quoteRepository.generateQuoteNumber();
            const vatRate = 18.00;

            // Calculate totals
            let subtotal = 0;
            const quoteItems = [];

            for (const item of items) {
                const itemSubtotal = parseFloat(item.unit_price) * parseInt(item.quantity);
                subtotal += itemSubtotal;
                quoteItems.push({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    subtotal: itemSubtotal
                });
            }

            const vatAmount = subtotal * (vatRate / 100);
            const totalAmount = subtotal + vatAmount;

            const quoteData = {
                quote_number: quoteNumber,
                user_id: userId,
                company_id: companyId,
                status: 'pending',
                subtotal,
                vat_rate: vatRate,
                vat_amount: vatAmount,
                total_amount: totalAmount,
                valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            };

            const quote = await quoteRepository.createWithItems(quoteData, quoteItems, transaction);
            await transaction.commit();
            return await quoteRepository.findWithDetails(quote.id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async updateStatus(quoteId, status) {
        const quote = await quoteRepository.findById(quoteId);
        if (!quote) throw new Error('Devis non trouvé');

        // Business rule: only draft can be sent, etc.
        return await quoteRepository.update(quoteId, { status });
    }

    async updateQuote(quoteId, data) {
        const quote = await quoteRepository.findById(quoteId);
        if (!quote) throw new Error('Devis non trouvé');

        const { items, ...quoteData } = data;

        const transaction = await sequelize.transaction();
        try {
            // Update items if provided
            if (items && items.length > 0) {
                // Remove old items
                const { QuoteItem } = require('../models');
                await QuoteItem.destroy({ where: { quote_id: quoteId }, transaction });

                // Create new items
                for (const item of items) {
                    await QuoteItem.create({
                        quote_id: quoteId,
                        ...item
                    }, { transaction });
                }
            }

            // Update quote metadata
            await quoteRepository.update(quoteId, quoteData, { transaction });

            await transaction.commit();
            return await quoteRepository.findWithDetails(quoteId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async getQuoteDetails(quoteId) {
        const quote = await quoteRepository.findWithDetails(quoteId);
        if (!quote) throw new Error('Devis non trouvé');
        return quote;
    }

    async generatePdf(quoteId) {
        const quote = await this.getQuoteDetails(quoteId);
        return await pdfService.generateQuotePdf(quote);
    }
}

module.exports = new QuoteService();
