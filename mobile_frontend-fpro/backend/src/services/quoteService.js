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
                status: 'draft',
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

    async updateStatus(quoteId, status) {
        const quote = await quoteRepository.findById(quoteId);
        if (!quote) throw new Error('Devis non trouvé');

        // Business rule: only draft can be sent, etc.
        return await quoteRepository.update(quoteId, { status });
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
