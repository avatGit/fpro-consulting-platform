const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SystemSetting = sequelize.define('SystemSetting', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: 'Identifiant unique du paramètre'
    },
    key: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
        comment: 'Clé unique du paramètre (ex: vat_rate, company_name)'
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Valeur du paramètre (stockée en texte, convertie selon le type)'
    },
    type: {
        type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
        defaultValue: 'string',
        comment: 'Type de la valeur'
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Catégorie du paramètre (general, billing, email, etc.)'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description du paramètre'
    },
    is_public: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Accessible aux utilisateurs non-admin'
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
    tableName: 'system_settings',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['key'], unique: true },
        { fields: ['category'] }
    ]
});

// Helper method to get typed value
SystemSetting.prototype.getTypedValue = function () {
    if (!this.value) return null;

    switch (this.type) {
        case 'number':
            return parseFloat(this.value);
        case 'boolean':
            return this.value === 'true' || this.value === '1';
        case 'json':
            try {
                return JSON.parse(this.value);
            } catch (e) {
                return null;
            }
        default:
            return this.value;
    }
};

module.exports = SystemSetting;
