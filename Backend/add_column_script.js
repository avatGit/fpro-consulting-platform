const { sequelize } = require('./src/models');

async function migrate() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Checking if image_url column exists in products table...');
        const [results] = await sequelize.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'image_url';
        `);

        if (results.length === 0) {
            console.log('Column image_url does not exist. Adding it...');
            await sequelize.query(`
                ALTER TABLE products 
                ADD COLUMN image_url VARCHAR(500);
            `);
            console.log('Column image_url added successfully.');
        } else {
            console.log('Column image_url already exists.');
        }

    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await sequelize.close();
    }
}

migrate();
