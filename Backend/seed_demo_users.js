/**
 * seed_demo_users.js
 * ------------------
 * Creates 3 demo accounts (admin, agent, client) for quick local demo/testing.
 *
 * Usage (from the Backend/ directory):
 *   node seed_demo_users.js
 *
 * The script is idempotent: if an account already exists it skips it gracefully.
 */

require('dotenv').config();

const { sequelize } = require('./src/config/database');
const { User, Company } = require('./src/models');

// ──────────────────────────────────────────────
// Demo credentials — keep in sync with README
// ──────────────────────────────────────────────
const DEMO_COMPANY = {
    name: 'Demo Company',
    email: 'company@demo.fpro',
    phone: '+22600000000',
    address: '1 Rue de la Démo',
    city: 'Ouagadougou',
};

const DEMO_USERS = [
    {
        email: 'admin@demo.fpro',
        // password stored in plain-text here; the model's beforeCreate hook hashes it
        password_hash: 'Admin@2026',
        first_name: 'Alice',
        last_name: 'Admin',
        phone: '+22611000001',
        role: 'admin',
        company_id: null, // admin has no company
    },
    {
        email: 'agent@demo.fpro',
        password_hash: 'Agent@2026',
        first_name: 'Bob',
        last_name: 'Agent',
        phone: '+22611000002',
        role: 'agent',
        // company_id filled in at runtime after the demo company is created
    },
    {
        email: 'client@demo.fpro',
        password_hash: 'Client@2026',
        first_name: 'Charlie',
        last_name: 'Client',
        phone: '+22611000003',
        role: 'client',
        // company_id filled in at runtime after the demo company is created
    },
];

// ──────────────────────────────────────────────
// Main seeding logic
// ──────────────────────────────────────────────
const seedDemoUsers = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to the database.');

        // 1. Ensure the demo company exists (findOrCreate so it's idempotent)
        const [company, companyCreated] = await Company.findOrCreate({
            where: { email: DEMO_COMPANY.email },
            defaults: DEMO_COMPANY,
        });

        if (companyCreated) {
            console.log(`🏢 Demo company created: ${company.name} (id: ${company.id})`);
        } else {
            console.log(`🏢 Demo company already exists (id: ${company.id}), skipping.`);
        }

        // 2. Create (or skip) each demo user
        for (const userData of DEMO_USERS) {
            // Assign company to non-admin users
            if (userData.role !== 'admin') {
                userData.company_id = company.id;
            }

            // Check if the user already exists
            const existing = await User.findOne({ where: { email: userData.email } });

            if (existing) {
                console.log(`⚠️  User ${userData.email} already exists — skipping.`);
                continue;
            }

            // Create the user — the model's beforeCreate hook handles password hashing
            const user = await User.create(userData);
            console.log(`👤 Created [${user.role.toUpperCase()}] ${user.first_name} ${user.last_name} <${user.email}>`);
        }

        // 3. Summary
        console.log('\n──────────────────────────────────────────────');
        console.log('🎉 Demo accounts ready! Login credentials:');
        console.log('──────────────────────────────────────────────');
        console.log('ADMIN   → email: admin@demo.fpro   | password: Admin@2026');
        console.log('AGENT   → email: agent@demo.fpro   | password: Agent@2026');
        console.log('CLIENT  → email: client@demo.fpro  | password: Client@2026');
        console.log('──────────────────────────────────────────────\n');

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
    } finally {
        await sequelize.close();
    }
};

seedDemoUsers();
