const { Company, sequelize } = require('./src/models');

async function fixData() {
    try {
        console.log('Activating all companies...');
        await Company.update({ is_active: true }, { where: {} });
        console.log('✅ All companies activated.');
    } catch (error) {
        console.error('❌ Error fixing data:', error);
    } finally {
        /* await sequelize.close(); */ // Don't close if it hangs the process or just exit
        process.exit(0);
    }
}

fixData();
