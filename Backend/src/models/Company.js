const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Identifiant unique de l\'entreprise'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nom de l\'entreprise'
  },
  siret: {
    type: DataTypes.STRING(14),
    unique: true,
    allowNull: true,
    validate: {
      len: [14, 14]
    },
    comment: 'Numéro SIRET (14 chiffres)'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Adresse complète de l\'entreprise'
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Ville'
  },
  postal_code: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Code postal'
  },
  country: {
    type: DataTypes.STRING(100),
    defaultValue: 'Burkina Faso',
    comment: 'Pays'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Numéro de téléphone principal'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    },
    comment: 'Email de contact de l\'entreprise'
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true
    },
    comment: 'Site web de l\'entreprise'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Compte entreprise actif ou non'
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
  tableName: 'companies',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Company;