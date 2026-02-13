/**
 * Migration Script: Update order and quote number prefixes
 * - Orders: O-YYYY-XXXXXX → CMD-YYYY-XXXXXX
 * - Quotes: Q-YYYY-XXXXXX → DEVIS-YYYY-XXXXXX
 */
const { sequelize } = require('../config/database');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        // Update orders: O- → CMD-
        const [orderResults] = await sequelize.query(
            `UPDATE orders SET order_number = REPLACE(order_number, 'O-', 'CMD-') WHERE order_number LIKE 'O-%'`
        );
        console.log(`📦 Orders updated: ${orderResults?.rowCount ?? 'done'}`);

        // Update quotes: Q- → DEVIS-
        const [quoteResults] = await sequelize.query(
            `UPDATE quotes SET quote_number = REPLACE(quote_number, 'Q-', 'DEVIS-') WHERE quote_number LIKE 'Q-%'`
        );
        console.log(`📄 Quotes updated: ${quoteResults?.rowCount ?? 'done'}`);

        console.log('✅ Migration complete!');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

migrate();
