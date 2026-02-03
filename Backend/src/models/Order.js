const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    order_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Format O-YYYY-000001'
    },
    quote_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'quotes',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'companies',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'validated', 'processing', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending'
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'partial', 'paid', 'refunded'),
        defaultValue: 'pending'
    },
    total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    delivery_address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true
    },
    updated_by: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    tableName: 'orders',
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['order_number']
        }
    ]
});

module.exports = Order;

