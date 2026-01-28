const { Product, Company, User, Technician, sequelize } = require('./models');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const seedData = async () => {
    const transaction = await sequelize.transaction();
    try {
        // 1. Create a Company
        const company = await Company.create({
            name: 'Client Corp',
            email: 'client@corp.com',
            phone: '22612345678',
            address: '123 Business Ave',
            city: 'Ouagadougou'
        }, { transaction });

        // 2. Create an Admin User
        const adminPassword = await bcrypt.hash('Admin@123', 10);
        const admin = await User.create({
            email: 'admin@fpro.com',
            password_hash: adminPassword,
            first_name: 'Super',
            last_name: 'Admin',
            role: 'admin'
        }, { transaction });

        // 3. Create a Technician User & Profile
        const techPassword = await bcrypt.hash('Tech@123', 10);
        const techUser = await User.create({
            email: 'tech1@fpro.com',
            password_hash: techPassword,
            first_name: 'Tenga',
            last_name: 'Zoundi',
            role: 'technicien'
        }, { transaction });

        await Technician.create({
            user_id: techUser.id,
            skills: ['Hardware', 'Networking'],
            is_available: true
        }, { transaction });

        // 4. Create Products & Services
        await Product.bulkCreate([
            {
                name: 'Pack Maintenance Pro',
                description: 'Support annuel complet',
                type: 'service',
                base_price: 150000,
                sku: 'SRV-MNT-01'
            },
            {
                name: 'Serveur NAS 2To',
                description: 'Stockage réseau haute performance',
                type: 'product',
                base_price: 250000,
                sku: 'PRD-NAS-01',
                stock_quantity: 10
            },
            {
                name: 'Routeur Wifi 6',
                description: 'Ultra rapide',
                type: 'product',
                base_price: 85000,
                sku: 'PRD-RT-01',
                stock_quantity: 25
            }
        ], { transaction });

        await transaction.commit();
        console.log('✅ Seed data successfully inserted');
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Error seeding data:', error);
    }
};

module.exports = seedData;
