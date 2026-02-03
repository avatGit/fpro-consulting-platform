const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Supplier = sequelize.define('Supplier', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Identifiant unique du fournisseur'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nom du fournisseur'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true
    },
    comment: 'Email de contact'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Téléphone'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Adresse complète'
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Ville'
  },
  country: {
    type: DataTypes.STRING(100),
    defaultValue: 'Burkina Faso',
    comment: 'Pays'
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true
    },
    comment: 'Site web'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Fournisseur actif ou non'
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
  tableName: 'suppliers',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Supplier;