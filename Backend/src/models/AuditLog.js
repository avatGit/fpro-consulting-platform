const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: 'Identifiant unique du log'
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'Utilisateur qui a effectué l\'action'
    },
    action: {
        type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'VALIDATE', 'ASSIGN'),
        allowNull: false,
        comment: 'Type d\'action effectuée'
    },
    resource_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Type de ressource affectée (User, Order, Product, etc.)'
    },
    resource_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'ID de la ressource affectée'
    },
    old_value: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Ancienne valeur (pour UPDATE)'
    },
    new_value: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Nouvelle valeur (pour CREATE/UPDATE)'
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'Adresse IP de l\'utilisateur'
    },
    user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'User agent du navigateur'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description détaillée de l\'action'
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'audit_logs',
    timestamps: false,
    underscored: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['resource_type'] },
        { fields: ['resource_id'] },
        { fields: ['action'] },
        { fields: ['created_at'] }
    ]
});

module.exports = AuditLog;
