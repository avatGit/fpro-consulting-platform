const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Quote = sequelize.define('Quote', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    quote_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Format Q-YYYY-000001'
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
        type: DataTypes.ENUM('draft', 'sent', 'accepted', 'refused', 'expired'),
        defaultValue: 'draft'
    },
    valid_until: {
        type: DataTypes.DATE,
        allowNull: true
    },
    subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    vat_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 18.00,
        comment: 'Configurable VAT rate (default 18% for Burkina Faso)'
    },
    vat_amount: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00
    },
    total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
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
    tableName: 'quotes',
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['quote_number']
        }
    ]
});

module.exports = Quote;
