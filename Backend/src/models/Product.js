const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Identifiant unique du produit'
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    },
    comment: 'ID de la catégorie'
  },
  supplier_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'suppliers',
      key: 'id'
    },
    comment: 'ID du fournisseur'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nom du produit'
  },
  reference: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: true,
    comment: 'Référence unique du produit'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Description détaillée'
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Prix unitaire HT (en FCFA)'
  },
  tax_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 18.00,
    comment: 'Taux de TVA en % (18% par défaut au Burkina Faso)'
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Quantité en stock'
  },
  stock_alert_threshold: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    comment: 'Seuil d\'alerte de stock bas'
  },
  unit: {
    type: DataTypes.STRING(50),
    defaultValue: 'unité',
    comment: 'Unité de mesure (unité, boîte, rame, etc.)'
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL de l\'image du produit'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Produit actif ou non'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'products',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['category_id']
    },
    {
      fields: ['supplier_id']
    },
    {
      fields: ['is_active']
    }
  ]
});

// Méthode pour calculer le prix TTC
Product.prototype.getPriceTTC = function() {
  const ht = parseFloat(this.unit_price);
  const taxRate = parseFloat(this.tax_rate);
  return ht + (ht * taxRate / 100);
};

// Méthode pour vérifier si le stock est bas
Product.prototype.isLowStock = function() {
  return this.stock_quantity <= this.stock_alert_threshold;
};

module.exports = Product;