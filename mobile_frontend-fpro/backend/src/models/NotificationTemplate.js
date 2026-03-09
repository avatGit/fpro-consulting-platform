const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * NotificationTemplate Model
 * Centralized templates for notifications with variable injection
 */
const NotificationTemplate = sequelize.define('NotificationTemplate', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Unique template code (e.g., ORDER_CONFIRMATION)'
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Human-readable template name'
    },
    channel: {
        type: DataTypes.ENUM('email', 'sms', 'in_app'),
        allowNull: false,
        comment: 'Target channel for this template'
    },
    subject_template: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Subject template with variables (email only)'
    },
    body_template: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Message body template with variables'
    },
    variables: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'List of available variables (e.g., ["client_name", "order_id"])'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether template is active'
    }
}, {
    tableName: 'notification_templates',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['code'],
            unique: true
        },
        {
            fields: ['channel']
        }
    ]
});

module.exports = NotificationTemplate;
