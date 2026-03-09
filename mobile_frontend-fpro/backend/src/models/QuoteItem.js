const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QuoteItem = sequelize.define('QuoteItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    quote_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'quotes',
            key: 'id'
        }
    },
    product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    }
}, {
    tableName: 'quote_items',
    underscored: true
});

module.exports = QuoteItem;
