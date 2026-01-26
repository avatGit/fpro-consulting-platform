const { sequelize } = require('../config/database');
const Company = require('./Company');
const User = require('./User');

// ============================================
// DÉFINITION DES RELATIONS
// ============================================

// Une entreprise a plusieurs utilisateurs
Company.hasMany(User, {
  foreignKey: 'company_id',
  as: 'users',
  onDelete: 'CASCADE'
});

// Un utilisateur appartient à une entreprise (nullable pour les admins)
User.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'company'
});

// ============================================
// SYNCHRONISATION
// ============================================

const syncModels = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('✅ Tous les modèles ont été synchronisés');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation des modèles:', error);
    throw error;
  }
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  sequelize,
  Company,
  User,
  syncModels
};