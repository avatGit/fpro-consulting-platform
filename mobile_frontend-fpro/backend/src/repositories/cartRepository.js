const BaseRepository = require('./BaseRepository');
const { Cart, CartItem, Product } = require('../models');

class CartRepository extends BaseRepository {
    constructor() {
        super(Cart);
    }

    async findWithItems(userId) {
        return await this.model.findOne({
            where: { user_id: userId, status: 'active' },
            include: [
                {
                    model: CartItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                }
            ]
        });
    }

    async findOrCreateActiveCart(userId) {
        const [cart] = await this.model.findOrCreate({
            where: { user_id: userId, status: 'active' },
            defaults: { total_amount: 0 }
        });
        return cart;
    }

    async addItem(cartId, itemData) {
        return await CartItem.create({
            cart_id: cartId,
            ...itemData
        });
    }

    async updateItem(itemId, quantity, subtotal) {
        const item = await CartItem.findByPk(itemId);
        if (!item) return null;
        return await item.update({ quantity, subtotal });
    }

    async removeItem(itemId) {
        const item = await CartItem.findByPk(itemId);
        if (!item) return null;
        return await item.destroy();
    }

    async clearCart(cartId) {
        return await CartItem.destroy({ where: { cart_id: cartId } });
    }
}

module.exports = new CartRepository();
