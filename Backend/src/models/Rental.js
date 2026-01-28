const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Rental = sequelize.define('Rental', {
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
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'companies',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'active', 'returned', 'cancelled'),
        defaultValue: 'pending'
    },
    total_price: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    tableName: 'rentals',
    underscored: true
});

module.exports = Rental;
