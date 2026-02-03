const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Identifiant unique de la catégorie'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nom de la catégorie'
  },
  type: {
    type: DataTypes.ENUM('product', 'service'),
    allowNull: false,
    comment: 'Type : product (consommable) ou service (prestation)'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Description de la catégorie'
  },
  parent_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    },
    comment: 'ID de la catégorie parente (pour sous-catégories)'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Catégorie active ou non'
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
  tableName: 'categories',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Category;