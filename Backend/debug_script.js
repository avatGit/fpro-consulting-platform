const { sequelize } = require('./src/models');
const productRepository = require('./src/repositories/productRepository');
const orderRepository = require('./src/repositories/orderRepository');

async function test() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Testing ProductRepository.findActive()...');
        try {
            const products = await productRepository.findActive();
            console.log(`Products found: ${products.length}`);
        } catch (error) {
            console.error('Error in ProductRepository.findActive:', error);
        }

        console.log('Testing OrderRepository.findAllWithDetails()...');
        try {
            const orders = await orderRepository.findAllWithDetails();
            console.log(`Orders found: ${orders.length}`);
        } catch (error) {
            console.error('Error in OrderRepository.findAllWithDetails:', error);
        }

    } catch (error) {
        console.error('Global error:', error);
    } finally {
        await sequelize.close();
    }
}

test();
