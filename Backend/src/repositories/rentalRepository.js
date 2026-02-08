const BaseRepository = require('./BaseRepository');
const { Rental, RentalItem, Product, User, Company } = require('../models');
const { Op } = require('sequelize');

class RentalRepository extends BaseRepository {
    constructor() {
        super(Rental);
    }

    async findWithDetails(rentalId) {
        return await this.model.findByPk(rentalId, {
            include: [
                { model: RentalItem, as: 'items', include: [{ model: Product, as: 'product' }] },
                { model: User, as: 'user' },
                { model: Company, as: 'company' }
            ]
        });
    }

    async checkAvailability(productId, startDate, endDate) {
        const conflictingItems = await RentalItem.findAll({
            where: {
                product_id: productId,
                [Op.or]: [
                    {
                        start_date: { [Op.between]: [startDate, endDate] }
                    },
                    {
                        end_date: { [Op.between]: [startDate, endDate] }
                    },
                    {
                        [Op.and]: [
                            { start_date: { [Op.lte]: startDate } },
                            { end_date: { [Op.gte]: endDate } }
                        ]
                    }
                ]
            },
            include: [
                {
                    model: Rental,
                    as: 'rental',
                    where: { status: { [Op.notIn]: ['cancelled', 'returned'] } }
                }
            ]
        });

        return conflictingItems.length === 0;
    }

    async findAllWithDetails() {
        return await this.model.findAll({
            include: [
                { model: RentalItem, as: 'items', include: [{ model: Product, as: 'product' }] },
                { model: User, as: 'user' },
                { model: Company, as: 'company' }
            ],
            order: [['created_at', 'DESC']]
        });
    }
}

module.exports = new RentalRepository();
