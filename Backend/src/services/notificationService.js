const notificationRepository = require('../repositories/notificationRepository');
const notificationTemplateRepository = require('../repositories/notificationTemplateRepository');
const emailService = require('./emailService');
const smsService = require('./smsService');
const logger = require('../utils/logger');
const { Notification, NotificationLog } = require('../models');

/**
 * Notification Service
 * Handles multi-channel notifications (email, SMS, in-app)
 */
class NotificationService {
    /**
     * Send notification to user
     * @param {Number} userId - User ID
     * @param {String} type - Notification type
     * @param {String} channel - Channel (email, sms, in_app)
     * @param {Object} data - Notification data
     * @returns {Promise<Object>}
     */
    async sendNotification(userId, type, channel, data = {}) {
        try {
            // Get template if available
            const templateCode = this.getTemplateCode(type, channel);
            const template = await notificationTemplateRepository.findByCode(templateCode);

            let subject = data.subject || '';
            let message = data.message || '';

            // Render template if found
            if (template) {
                subject = this.renderTemplate(template.subject_template || '', data);
                message = this.renderTemplate(template.body_template, data);
            }

            // Create notification record
            const notification = await notificationRepository.create({
                user_id: userId,
                type,
                channel,
                subject,
                message,
                data,
                status: 'pending'
            });

            // Send via appropriate channel
            let sendResult;
            try {
                if (channel === 'email') {
                    sendResult = await this.sendEmailNotification(notification, data);
                } else if (channel === 'sms') {
                    sendResult = await this.sendSmsNotification(notification, data);
                } else {
                    // In-app notification - just mark as sent
                    sendResult = { success: true };
                }

                // Update notification status
                await notification.update({
                    status: sendResult.success ? 'sent' : 'failed',
                    sent_at: new Date(),
                    error_message: sendResult.error || null
                });

                // Log delivery
                await NotificationLog.create({
                    notification_id: notification.id,
                    status: sendResult.success ? 'sent' : 'failed',
                    error_message: sendResult.error || null,
                    sent_at: new Date(),
                    metadata: sendResult.metadata || {}
                });

                logger.info(`✅ Notification sent: ${type} via ${channel} to user ${userId}`);
                return notification;

            } catch (sendError) {
                // Update notification as failed
                await notification.update({
                    status: 'failed',
                    error_message: sendError.message
                });

                // Log failure
                await NotificationLog.create({
                    notification_id: notification.id,
                    status: 'failed',
                    error_message: sendError.message,
                    sent_at: new Date()
                });

                logger.error(`❌ Notification send failed: ${type} via ${channel}`, sendError);
                throw sendError;
            }

        } catch (error) {
            logger.error('❌ Error creating notification:', error);
            throw error;
        }
    }

    /**
     * Send email notification
     * @param {Object} notification - Notification record
     * @param {Object} data - Additional data (recipient email)
     * @returns {Promise<Object>}
     */
    async sendEmailNotification(notification, data) {
        try {
            const recipientEmail = data.email || data.recipient_email;
            if (!recipientEmail) {
                throw new Error('Recipient email not provided');
            }

            await emailService.sendEmail(
                recipientEmail,
                notification.subject,
                notification.message
            );

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Send SMS notification
     * @param {Object} notification - Notification record
     * @param {Object} data - Additional data (recipient phone)
     * @returns {Promise<Object>}
     */
    async sendSmsNotification(notification, data) {
        try {
            const recipientPhone = data.phone || data.recipient_phone;
            if (!recipientPhone) {
                throw new Error('Recipient phone number not provided');
            }

            await smsService.sendSMS(recipientPhone, notification.message);

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Send bulk notifications
     * @param {Array} userIds - Array of user IDs
     * @param {String} type - Notification type
     * @param {String} channel - Channel
     * @param {Object} data - Notification data
     * @returns {Promise<Array>}
     */
    async sendBulkNotifications(userIds, type, channel, data = {}) {
        const results = [];

        for (const userId of userIds) {
            try {
                const notification = await this.sendNotification(userId, type, channel, data);
                results.push({ userId, success: true, notificationId: notification.id });
            } catch (error) {
                results.push({ userId, success: false, error: error.message });
            }
        }

        return results;
    }

    /**
     * Render template with variables
     * @param {String} template - Template string
     * @param {Object} variables - Variables to inject
     * @returns {String}
     */
    renderTemplate(template, variables) {
        if (!template) return '';

        let rendered = template;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            rendered = rendered.replace(regex, value);
        }
        return rendered;
    }

    /**
     * Get template code based on type and channel
     * @param {String} type - Notification type
     * @param {String} channel - Channel
     * @returns {String}
     */
    getTemplateCode(type, channel) {
        return `${type.toUpperCase()}_${channel.toUpperCase()}`;
    }

    /**
     * Get user notifications with pagination
     * @param {Number} userId - User ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>}
     */
    async getUserNotifications(userId, options = {}) {
        const { page = 1, limit = 20, status } = options;
        const offset = (page - 1) * limit;

        const result = await notificationRepository.findAndCountByUserId(userId, {
            limit,
            offset,
            status
        });

        return {
            notifications: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalItems: result.count,
                totalPages: Math.ceil(result.count / limit)
            }
        };
    }

    /**
     * Mark notification as read
     * @param {Number} notificationId - Notification ID
     * @returns {Promise<Object>}
     */
    async markAsRead(notificationId) {
        return await notificationRepository.markAsRead(notificationId);
    }

    /**
     * Mark all user notifications as read
     * @param {Number} userId - User ID
     * @returns {Promise<Number>}
     */
    async markAllAsRead(userId) {
        return await notificationRepository.markAllAsRead(userId);
    }

    /**
     * Get unread count for user
     * @param {Number} userId - User ID
     * @returns {Promise<Number>}
     */
    async getUnreadCount(userId) {
        return await notificationRepository.countUnread(userId);
    }

    /**
     * Helper: Send order confirmation notification
     * @param {Number} userId - User ID
     * @param {Object} orderData - Order data
     * @returns {Promise<Object>}
     */
    async sendOrderConfirmation(userId, orderData) {
        const data = {
            email: orderData.email,
            client_name: orderData.client_name,
            order_number: orderData.order_number,
            order_id: orderData.order_id,
            total_amount: orderData.total_amount,
            message: `Votre commande #${orderData.order_number} a été confirmée avec succès.`,
            subject: `Confirmation de commande #${orderData.order_number}`
        };

        return await this.sendNotification(userId, 'order_confirmation', 'email', data);
    }

    /**
     * Helper: Send quote approval notification
     * @param {Number} userId - User ID
     * @param {Object} quoteData - Quote data
     * @returns {Promise<Object>}
     */
    async sendQuoteApproval(userId, quoteData) {
        const data = {
            email: quoteData.email,
            client_name: quoteData.client_name,
            quote_number: quoteData.quote_number,
            quote_id: quoteData.quote_id,
            message: `Votre devis #${quoteData.quote_number} a été approuvé.`,
            subject: `Devis approuvé #${quoteData.quote_number}`
        };

        return await this.sendNotification(userId, 'quote_approved', 'email', data);
    }

    /**
     * Helper: Send maintenance status update
     * @param {Number} userId - User ID
     * @param {Object} maintenanceData - Maintenance data
     * @returns {Promise<Object>}
     */
    async sendMaintenanceStatusUpdate(userId, maintenanceData) {
        const data = {
            email: maintenanceData.email,
            client_name: maintenanceData.client_name,
            request_id: maintenanceData.request_id,
            status: maintenanceData.status,
            message: `Votre demande de maintenance #${maintenanceData.request_id} est maintenant: ${maintenanceData.status}`,
            subject: `Mise à jour maintenance #${maintenanceData.request_id}`
        };

        return await this.sendNotification(userId, 'maintenance_status', 'email', data);
    }

    /**
     * Helper: Send rental started notification
     * @param {Number} userId - User ID
     * @param {Object} rentalData - Rental data
     * @returns {Promise<Object>}
     */
    async sendRentalStarted(userId, rentalData) {
        const data = {
            email: rentalData.email,
            client_name: rentalData.client_name,
            rental_id: rentalData.rental_id,
            start_date: rentalData.start_date,
            end_date: rentalData.end_date,
            message: `Votre location #${rentalData.rental_id} a démarré. Retour prévu le ${rentalData.end_date}`,
            subject: `Location démarrée #${rentalData.rental_id}`
        };

        return await this.sendNotification(userId, 'rental_started', 'email', data);
    }
}

module.exports = new NotificationService();
