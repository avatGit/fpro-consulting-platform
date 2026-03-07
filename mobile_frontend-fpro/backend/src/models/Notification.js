const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Notification Model
 * Stores all notifications sent to users (email, SMS, in-app)
 */
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'User receiving the notification'
  },
  type: {
    type: DataTypes.ENUM(
      'order_confirmation',
      'quote_approved',
      'quote_rejected',
      'maintenance_status',
      'maintenance_reminder',
      'rental_started',
      'rental_return_reminder',
      'rental_ended',
      'general'
    ),
    allowNull: false
  },
  channel: {
    type: DataTypes.ENUM('email', 'sms', 'in_app'),
    allowNull: false,
    defaultValue: 'in_app',
    comment: 'Delivery channel'
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Notification subject (for email)'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Notification message content'
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Additional data (order_id, quote_id, etc.)'
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'failed', 'read'),
    allowNull: false,
    defaultValue: 'pending',
    comment: 'Notification status'
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When notification was sent'
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When notification was read (in-app only)'
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error message if delivery failed'
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id', 'status']
    },
    {
      fields: ['user_id', 'read_at']
    },
    {
      fields: ['type']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Notification;
