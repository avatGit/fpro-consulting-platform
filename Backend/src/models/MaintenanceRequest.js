const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MaintenanceRequest = sequelize.define('MaintenanceRequest', {
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
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium'
    },
    status: {
        type: DataTypes.ENUM('new', 'assigned', 'in_progress', 'done', 'cancelled'),
        defaultValue: 'new'
    },
    request_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Type of maintenance requested (e.g., Software, Hardware, Network)'
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
    tableName: 'maintenance_requests',
    underscored: true
});

module.exports = MaintenanceRequest;
