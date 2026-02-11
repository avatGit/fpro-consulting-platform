const { sequelize, Product } = require('./src/models');

async function checkServices() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Checking for products with type="service"...');
        const services = await Product.findAll({ where: { type: 'service' } });
        console.log(`Found ${services.length} services.`);

        if (services.length > 0) {
            console.log('Sample service:', JSON.stringify(services[0], null, 2));
        } else {
            console.log('No services found. Creating mock rental services...');
            await Product.bulkCreate([
                {
                    name: 'Location Imprimante Pro',
                    description: 'Imprimante ultra professionnelle (Location)',
                    type: 'service',
                    base_price: 90.00, // Daily/Weekly rate? Logic needs clarification
                    stock_quantity: 10,
                    is_active: true,
                    image_url: '/uploads/products/printer.jpg' // Placeholder
                },
                {
                    name: 'Location Serveur Rack',
                    description: 'Serveur haute performance (Location)',
                    type: 'service',
                    base_price: 150.00,
                    stock_quantity: 5,
                    is_active: true,
                    image_url: '/uploads/products/server.jpg'
                }
            ]);
            console.log('Mock services created.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkServices();
