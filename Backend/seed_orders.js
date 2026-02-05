const { User, Product, Order, OrderItem, Company, Quote, sequelize } = require('./src/models');
const { v4: uuidv4 } = require('uuid');

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        // 1. Get or Create a Company
        let company = await Company.findOne();
        if (!company) {
            company = await Company.create({
                name: 'Test Company',
                email: 'test@company.com',
                phone: '123456789',
                address: '123 Main St'
            });
            console.log('Created Company:', company.id);
        }

        // 2. Get or Create a User (The one likely logged in, or create new)
        let user = await User.findOne({ where: { email: 'john.doe@entreprise.com' } });
        if (!user) {
            // Fallback to searching for ANY user if that one doesn't exist
            user = await User.findOne();
            if (!user) {
                user = await User.create({
                    email: 'john.doe@entreprise.com',
                    password_hash: 'hashedpassword',
                    first_name: 'John',
                    last_name: 'Doe',
                    role: 'client',
                    company_id: company.id,
                    is_active: true
                });
                console.log('Created User:', user.email);
            }
        }
        console.log('Using User:', user.email);

        // 3. Get or Create Product
        let product = await Product.findOne();
        if (!product) {
            product = await Product.create({
                name: 'Laptop Dell XPS',
                description: 'High performance laptop',
                price: 1500.00,
                stock_quantity: 10,
                category: 'Electronics'
            });
            console.log('Created Product:', product.name);
        }

        // 4. Create an Order
        const order = await Order.create({
            order_number: `CMD-${Math.floor(1000 + Math.random() * 9000)}`,
            user_id: user.id,
            company_id: company.id,
            status: 'pending',
            payment_status: 'pending',
            total_amount: 1500.00,
            delivery_address: '123 Test St',
            notes: 'Test order'
        });
        console.log('Created Order:', order.order_number);

        // 5. Create Order Item
        await OrderItem.create({
            order_id: order.id,
            product_id: product.id,
            quantity: 1,
            unit_price: 1500.00,
            subtotal: 1500.00
        });
        console.log('Created Order Item');

        console.log('Seed completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
}

seed();
