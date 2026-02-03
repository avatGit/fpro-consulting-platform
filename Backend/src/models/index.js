const { sequelize } = require('../config/database');

// Importer les modèles Sprint 1
const Company = require('./Company');
const User = require('./User');

// Importer les modèles Sprint 2
const Category = require('./Category');
const Supplier = require('./Supplier');
const Product = require('./Product');
const Service = require('./Service');
const StockMovement = require('./StockMovement');

// ============================================
// RELATIONS SPRINT 1
// ============================================

// Une entreprise a plusieurs utilisateurs
Company.hasMany(User, {
  foreignKey: 'company_id',
  as: 'users',
  onDelete: 'CASCADE'
});

// Un utilisateur appartient à une entreprise
User.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'company'
});

// ============================================
// RELATIONS SPRINT 2
// ============================================

// Relations Category (hiérarchie)
Category.hasMany(Category, {
  foreignKey: 'parent_id',
  as: 'subcategories',
  onDelete: 'SET NULL'
});

Category.belongsTo(Category, {
  foreignKey: 'parent_id',
  as: 'parent'
});

// Une catégorie a plusieurs produits
Category.hasMany(Product, {
  foreignKey: 'category_id',
  as: 'products',
  onDelete: 'RESTRICT'
});

// Un produit appartient à une catégorie
Product.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

// Un fournisseur a plusieurs produits
Supplier.hasMany(Product, {
  foreignKey: 'supplier_id',
  as: 'products',
  onDelete: 'SET NULL'
});

// Un produit peut avoir un fournisseur
Product.belongsTo(Supplier, {
  foreignKey: 'supplier_id',
  as: 'supplier'
});

// Une catégorie a plusieurs services
Category.hasMany(Service, {
  foreignKey: 'category_id',
  as: 'services',
  onDelete: 'RESTRICT'
});

// Un service appartient à une catégorie
Service.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

// Un produit a plusieurs mouvements de stock
Product.hasMany(StockMovement, {
  foreignKey: 'product_id',
  as: 'stockMovements',
  onDelete: 'CASCADE'
});

// Un mouvement de stock concerne un produit
StockMovement.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

// Un utilisateur peut créer plusieurs mouvements de stock
User.hasMany(StockMovement, {
  foreignKey: 'user_id',
  as: 'stockMovements',
  onDelete: 'RESTRICT'
});

// Un mouvement de stock est créé par un utilisateur
StockMovement.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
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
  // Sprint 1
  Company,
  User,
  // Sprint 2
  Category,
  Supplier,
  Product,
  Service,
  StockMovement,
  // Fonction
  syncModels
};