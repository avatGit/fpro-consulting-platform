const BaseRepository = require('./BaseRepository');
const { Notification, User, NotificationLog } = require('../models');

/**
 * Repository for Notification operations
 */
class NotificationRepository extends BaseRepository {
    constructor() {
        super(Notification);
    }

    /**
     * Find notifications by user ID with pagination
     * @param {Number} userId - User ID
     * @param {Object} options - Query options (limit, offset, status)
     * @returns {Promise<Array>}
     */
    async findByUserId(userId, options = {}) {
        const { limit = 20, offset = 0, status } = options;

        const where = { user_id: userId };
        if (status) {
            where.status = status;
        }

        return await this.model.findAll({
            where,
            include: [
                {
                    model: NotificationLog,
                    as: 'logs'
                }
            ],
            order: [['created_at', 'DESC']],
            limit,
            offset
        });
    }

    /**
     * Count unread notifications for a user
     * @param {Number} userId - User ID
     * @returns {Promise<Number>}
     */
    async countUnread(userId) {
        return await this.model.count({
            where: {
                user_id: userId,
                status: 'sent',
                read_at: null
            }
        });
    }

    /**
     * Mark notification as read
     * @param {Number} notificationId - Notification ID
     * @returns {Promise<Object>}
     */
    async markAsRead(notificationId) {
        const notification = await this.findById(notificationId);
        if (!notification) return null;

        return await notification.update({
            status: 'read',
            read_at: new Date()
        });
    }

    /**
     * Mark all user notifications as read
     * @param {Number} userId - User ID
     * @returns {Promise<Number>} - Number of updated records
     */
    async markAllAsRead(userId) {
        const [updatedCount] = await this.model.update(
            {
                status: 'read',
                read_at: new Date()
            },
            {
                where: {
                    user_id: userId,
                    status: 'sent',
                    read_at: null
                }
            }
        );
        return updatedCount;
    }

    /**
     * Find notifications by type
     * @param {String} type - Notification type
     * @param {Object} options - Query options
     * @returns {Promise<Array>}
     */
    async findByType(type, options = {}) {
        return await this.model.findAll({
            where: { type },
            ...options
        });
    }

    /**
     * Get notifications with pagination and count
     * @param {Number} userId - User ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>} - { rows, count }
     */
    async findAndCountByUserId(userId, options = {}) {
        const { limit = 20, offset = 0, status } = options;

        const where = { user_id: userId };
        if (status) {
            where.status = status;
        }

        return await this.model.findAndCountAll({
            where,
            include: [
                {
                    model: NotificationLog,
                    as: 'logs'
                }
            ],
            order: [['created_at', 'DESC']],
            limit,
            offset
        });
    }
}

module.exports = new NotificationRepository();
