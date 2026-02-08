const { sequelize, Sequelize } = require('../config/database');
const Company = require('./Company');
const User = require('./User');
const Product = require('./Product');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Quote = require('./Quote');
const QuoteItem = require('./QuoteItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const MaintenanceRequest = require('./MaintenanceRequest');
const Technician = require('./Technician');
const Intervention = require('./Intervention');
const InterventionReport = require('./InterventionReport');
const Rental = require('./Rental');
const RentalItem = require('./RentalItem');
const AuditLog = require('./AuditLog');
const Invoice = require('./Invoice');
const SystemSetting = require('./SystemSetting');

// ============================================
// DÉFINITION DES RELATIONS
// ============================================

// --- Company & User ---
Company.hasMany(User, { foreignKey: 'company_id', as: 'users', onDelete: 'CASCADE' });
User.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// --- Cart ---
User.hasOne(Cart, { foreignKey: 'user_id', as: 'cart' });
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });

Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cart_items' });
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// --- Quote ---
User.hasMany(Quote, { foreignKey: 'user_id', as: 'quotes' });
Quote.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Company.hasMany(Quote, { foreignKey: 'company_id', as: 'quotes' });
Quote.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

Quote.hasMany(QuoteItem, { foreignKey: 'quote_id', as: 'items', onDelete: 'CASCADE' });
QuoteItem.belongsTo(Quote, { foreignKey: 'quote_id', as: 'quote' });

Product.hasMany(QuoteItem, { foreignKey: 'product_id', as: 'quote_items' });
QuoteItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// --- Order ---
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Company.hasMany(Order, { foreignKey: 'company_id', as: 'orders' });
Order.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

Quote.hasOne(Order, { foreignKey: 'quote_id', as: 'order' });
Order.belongsTo(Quote, { foreignKey: 'quote_id', as: 'quote' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'order_items' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// --- Maintenance & Technician ---
User.hasMany(MaintenanceRequest, { foreignKey: 'user_id', as: 'maintenance_requests' });
MaintenanceRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Company.hasMany(MaintenanceRequest, { foreignKey: 'company_id', as: 'maintenance_requests' });
MaintenanceRequest.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

User.hasOne(Technician, { foreignKey: 'user_id', as: 'technician_profile' });
Technician.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

MaintenanceRequest.hasMany(Intervention, { foreignKey: 'request_id', as: 'interventions' });
Intervention.belongsTo(MaintenanceRequest, { foreignKey: 'request_id', as: 'request' });

Technician.hasMany(Intervention, { foreignKey: 'technician_id', as: 'interventions' });
Intervention.belongsTo(Technician, { foreignKey: 'technician_id', as: 'technician' });

Intervention.hasOne(InterventionReport, { foreignKey: 'intervention_id', as: 'report', onDelete: 'CASCADE' });
InterventionReport.belongsTo(Intervention, { foreignKey: 'intervention_id', as: 'intervention' });

// --- Rental ---
User.hasMany(Rental, { foreignKey: 'user_id', as: 'rentals' });
Rental.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Company.hasMany(Rental, { foreignKey: 'company_id', as: 'rentals' });
Rental.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

Rental.hasMany(RentalItem, { foreignKey: 'rental_id', as: 'items', onDelete: 'CASCADE' });
RentalItem.belongsTo(Rental, { foreignKey: 'rental_id', as: 'rental' });

Product.hasMany(RentalItem, { foreignKey: 'product_id', as: 'rental_items' });
RentalItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// --- AuditLog ---
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'audit_logs' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// --- Invoice ---
Order.hasOne(Invoice, { foreignKey: 'order_id', as: 'invoice' });
Invoice.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Company.hasMany(Invoice, { foreignKey: 'company_id', as: 'invoices' });
Invoice.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

User.hasMany(Invoice, { foreignKey: 'created_by', as: 'created_invoices' });
Invoice.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

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
  Product,
  Cart,
  CartItem,
  Quote,
  QuoteItem,
  Order,
  OrderItem,
  MaintenanceRequest,
  Technician,
  Intervention,
  InterventionReport,
  Rental,
  RentalItem,
  AuditLog,
  Invoice,
  SystemSetting,
  syncModels,
  Sequelize
};