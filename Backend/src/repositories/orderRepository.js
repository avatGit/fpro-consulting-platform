const BaseRepository = require('./BaseRepository');
const { Order, OrderItem, Product, Company, User } = require('../models');
const { Op } = require('sequelize');

class OrderRepository extends BaseRepository {
    constructor() {
        super(Order);
    }

    async findWithDetails(orderId) {
        return await this.model.findByPk(orderId, {
            include: [
                { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
                { model: Company, as: 'company' },
                { model: User, as: 'user' }
            ]
        });
    }

    async generateOrderNumber() {
        const year = new Date().getFullYear();
        const count = await this.model.count({
            where: {
                order_number: { [Op.like]: `O-${year}-%` }
            }
        });
        return `O-${year}-${(count + 1).toString().padStart(6, '0')}`;
    }

    async createWithItems(orderData, items, transaction) {
        const order = await this.model.create(orderData, { transaction });
        for (const item of items) {
            await OrderItem.create({
                order_id: order.id,
                ...item
            }, { transaction });
        }
        return order;
    }

    async findAllWithDetails() {
        return await this.model.findAll({
            include: [
                { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
                { model: Company, as: 'company' },
                { model: User, as: 'user' }
            ],
            order: [['created_at', 'DESC']]
        });
    }
}

module.exports = new OrderRepository();
