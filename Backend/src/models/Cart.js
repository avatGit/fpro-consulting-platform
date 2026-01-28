const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'converted', 'abandoned'),
        defaultValue: 'active'
    },
    total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00
    }
}, {
    tableName: 'carts',
    underscored: true
});

module.exports = Cart;
