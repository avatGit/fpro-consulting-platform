const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * NotificationLog Model
 * Detailed logging for notification delivery tracking
 */
const NotificationLog = sequelize.define('NotificationLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    notification_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'notifications',
            key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'Related notification'
    },
    status: {
        type: DataTypes.ENUM('queued', 'sending', 'sent', 'failed', 'bounced'),
        allowNull: false,
        defaultValue: 'queued',
        comment: 'Delivery status'
    },
    error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Error details if failed'
    },
    sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Timestamp when sent'
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Additional metadata (provider response, etc.)'
    }
}, {
    tableName: 'notification_logs',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['notification_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['created_at']
        }
    ]
});

module.exports = NotificationLog;
