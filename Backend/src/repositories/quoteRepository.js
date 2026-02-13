const BaseRepository = require('./BaseRepository');
const { Quote, QuoteItem, Product, Company, User } = require('../models');
const { Op } = require('sequelize');

class QuoteRepository extends BaseRepository {
    constructor() {
        super(Quote);
    }

    async findWithDetails(quoteId) {
        return await this.model.findByPk(quoteId, {
            include: [
                { model: QuoteItem, as: 'items', include: [{ model: Product, as: 'product' }] },
                { model: Company, as: 'company' },
                { model: User, as: 'user' }
            ]
        });
    }

    async generateQuoteNumber() {
        const year = new Date().getFullYear();
        const count = await this.model.count({
            where: {
                quote_number: { [Op.like]: `DEVIS-${year}-%` }
            }
        });
        return `DEVIS-${year}-${(count + 1).toString().padStart(6, '0')}`;
    }

    async createWithItems(quoteData, items, transaction) {
        const quote = await this.model.create(quoteData, { transaction });
        for (const item of items) {
            await QuoteItem.create({
                quote_id: quote.id,
                ...item
            }, { transaction });
        }
        return quote;
    }
}

module.exports = new QuoteRepository();
