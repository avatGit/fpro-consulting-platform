const cartRepository = require('../repositories/cartRepository');
const productRepository = require('../repositories/productRepository');

class CartService {
    async getCart(userId) {
        let cart = await cartRepository.findWithItems(userId);
        if (!cart) {
            cart = await cartRepository.findOrCreateActiveCart(userId);
            cart.items = [];
        }
        return cart;
    }

    async addItem(userId, productId, quantity) {
        const product = await productRepository.findById(productId);
        if (!product) throw new Error('Produit non trouvé');
        if (product.type === 'product' && product.stock_quantity < quantity) {
            throw new Error('Stock insuffisant');
        }

        const cart = await cartRepository.findOrCreateActiveCart(userId);

        // Check if item already in cart
        const existingItems = await cart.getItems({ where: { product_id: productId } });

        if (existingItems.length > 0) {
            const item = existingItems[0];
            const newQuantity = item.quantity + quantity;
            const newSubtotal = newQuantity * product.base_price;
            await cartRepository.updateItem(item.id, newQuantity, newSubtotal);
        } else {
            const subtotal = quantity * product.base_price;
            await cartRepository.addItem(cart.id, {
                product_id: productId,
                quantity,
                unit_price: product.base_price,
                subtotal
            });
        }

        await this.calculateTotal(cart.id);
        return await this.getCart(userId);
    }

    async updateItem(userId, itemId, quantity) {
        const cart = await cartRepository.findOrCreateActiveCart(userId);
        const item = await cart.getItems({ where: { id: itemId } });

        if (item.length === 0) throw new Error('Article non trouvé dans le panier');

        const product = await productRepository.findById(item[0].product_id);
        if (product.type === 'product' && product.stock_quantity < quantity) {
            throw new Error('Stock insuffisant');
        }

        const newSubtotal = quantity * item[0].unit_price;
        await cartRepository.updateItem(itemId, quantity, newSubtotal);
        await this.calculateTotal(cart.id);

        return await this.getCart(userId);
    }

    async removeItem(userId, itemId) {
        const cart = await cartRepository.findOrCreateActiveCart(userId);
        await cartRepository.removeItem(itemId);
        await this.calculateTotal(cart.id);
        return await this.getCart(userId);
    }

    async clearCart(userId) {
        const cart = await cartRepository.findOrCreateActiveCart(userId);
        await cartRepository.clearCart(cart.id);
        await cartRepository.update(cart.id, { total_amount: 0 });
        return await this.getCart(userId);
    }

    async calculateTotal(cartId) {
        const cart = await cartRepository.findById(cartId, {
            include: ['items']
        });
        const total = cart.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
        await cartRepository.update(cartId, { total_amount: total });
    }
}

module.exports = new CartService();
