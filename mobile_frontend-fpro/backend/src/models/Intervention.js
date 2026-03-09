const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Intervention = sequelize.define('Intervention', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    request_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'maintenance_requests',
            key: 'id'
        }
    },
    technician_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'technicians',
            key: 'id'
        }
    },
    scheduled_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    started_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    finished_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'failed'),
        defaultValue: 'scheduled'
    }
}, {
    tableName: 'interventions',
    underscored: true
});

module.exports = Intervention;
