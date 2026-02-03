const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Identifiant unique du service'
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
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nom du service'
  },
  type: {
    type: DataTypes.ENUM('maintenance', 'location', 'development', 'formation', 'audit', 'marketing', 'other'),
    allowNull: false,
    comment: 'Type de service'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Description détaillée du service'
  },
  base_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Prix de base HT (peut être null si sur devis)'
  },
  tax_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 18.00,
    comment: 'Taux de TVA en %'
  },
  duration_hours: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Durée estimée en heures'
  },
  unit: {
    type: DataTypes.STRING(50),
    defaultValue: 'intervention',
    comment: 'Unité de facturation (heure, jour, intervention, forfait)'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Service actif ou non'
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
  tableName: 'services',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['category_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['is_active']
    }
  ]
});

// Méthode pour calculer le prix TTC
Service.prototype.getPriceTTC = function() {
  if (!this.base_price) return null;
  const ht = parseFloat(this.base_price);
  const taxRate = parseFloat(this.tax_rate);
  return ht + (ht * taxRate / 100);
};

module.exports = Service;