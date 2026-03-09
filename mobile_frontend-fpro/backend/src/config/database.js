const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuration de la connexion PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

// Tester la connexion à PostgreSQL
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à PostgreSQL établie avec succès');
    return true;
  } catch (error) {
    console.error('❌ Impossible de se connecter à PostgreSQL:', error.message);
    return false;
  }
};

// Synchroniser les modèles avec la base de données
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('📊 Base de données synchronisée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};