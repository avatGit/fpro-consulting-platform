const { Product, Company, User, Technician, sequelize } = require('./models');
const bcrypt = require('bcrypt');

const seedData = async () => {
    const transaction = await sequelize.transaction();
    try {
        // 1. Vérifier/Créer l'entreprise
        let company = await Company.findOne({
            where: { email: 'client@corp.com' }
        });

        if (!company) {
            company = await Company.create({
                name: 'Client Corp',
                email: 'client@corp.com',
                phone: '22612345678',
                address: '123 Business Ave',
                city: 'Ouagadougou'
            }, { transaction });
            console.log('Entreprise créée');
        } else {
            console.log('Entreprise existe déjà');
        }

        // 2. Vérifier/Créer l'Admin
        let admin = await User.findOne({
            where: { email: 'admin@demo.com' }
        });

        if (!admin) {
            admin = await User.create({
                email: 'admin@demo.com',
                password_hash: 'Admin@2026', 
                first_name: 'Super',
                last_name: 'Admin',
                role: 'admin',
                company_id: null,
                is_active: true
            }, { transaction });
            console.log('Admin créé');
        } else {
            console.log('Admin existe déjà');
        }

        // 3. Vérifier/Créer le technicien
        let techUser = await User.findOne({
            where: { email: 'tech1@fpro.com' }
        });

        if (!techUser) {
            techUser = await User.create({
                email: 'tech1@fpro.com',
                password_hash: 'Tech@123',
                first_name: 'Tenga',
                last_name: 'Zoundi',
                role: 'technicien',
                company_id: company.id,
                is_active: true
            }, { transaction });
            console.log('Technicien créé');

            // Créer le profil Technician associé
            await Technician.create({
                user_id: techUser.id,
                skills: ['Hardware', 'Networking'],
                is_available: true
            }, { transaction });
            console.log('Profil technician créé');
        } else {
            console.log('Technicien existe déjà');
        }

        // 4. Vérifier/Créer les produits (basé sur SKU unique)
        const products = [
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
        ];

        for (const productData of products) {
            const existingProduct = await Product.findOne({
                where: { sku: productData.sku }
            });

            if (!existingProduct) {
                await Product.create(productData, { transaction });
                console.log(`Produit créé: ${productData.name}`);
            } else {
                console.log(`Produit existe déjà: ${productData.name}`);
            }
        }

        await transaction.commit();
        console.log('Seed data successfully inserted');

    } catch (error) {
        await transaction.rollback();
        console.error('Error seeding data:', error);
    }
};

module.exports = seedData;