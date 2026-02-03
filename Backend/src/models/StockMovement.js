const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StockMovement = sequelize.define('StockMovement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Identifiant unique du mouvement'
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    },
    comment: 'ID du produit concerné'
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID de l\'utilisateur ayant effectué le mouvement'
  },
  movement_type: {
    type: DataTypes.ENUM('entry', 'exit', 'adjustment'),
    allowNull: false,
    comment: 'Type de mouvement : entry (entrée), exit (sortie), adjustment (ajustement)'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Quantité (positive ou négative)'
  },
  previous_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Stock avant le mouvement'
  },
  new_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Stock après le mouvement'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Raison du mouvement'
  },
  reference: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Référence externe (bon de livraison, commande, etc.)'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'stock_movements',
  timestamps: false,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['product_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['movement_type']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = StockMovement;