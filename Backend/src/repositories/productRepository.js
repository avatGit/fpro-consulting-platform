const BaseRepository = require('./BaseRepository');
const { Product } = require('../models');

class ProductRepository extends BaseRepository {
    constructor() {
        super(Product);
    }

    async findBySku(sku) {
        return await this.model.findOne({ where: { sku } });
    }

    async findActive(options = {}) {
        return await this.model.findAll({
            where: { is_active: true },
            ...options
        });
    }
}

module.exports = new ProductRepository();
