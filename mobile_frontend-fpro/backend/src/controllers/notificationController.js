const notificationService = require('../services/notificationService');
const ResponseHandler = require('../utils/responseHandler');

/**
 * Notification Controller
 * Handles notification-related HTTP requests
 */
class NotificationController {
    /**
     * Get user notifications (paginated)
     * @route GET /api/notifications
     */
    async getUserNotifications(req, res) {
        try {
            const userId = req.userId; // From auth middleware
            const { page = 1, limit = 20, status } = req.query;

            const result = await notificationService.getUserNotifications(userId, {
                page: parseInt(page),
                limit: parseInt(limit),
                status
            });

            return ResponseHandler.successWithPagination(
                res,
                result.notifications,
                result.pagination,
                'Notifications récupérées avec succès'
            );
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Get unread notification count
     * @route GET /api/notifications/unread-count
     */
    async getUnreadCount(req, res) {
        try {
            const userId = req.userId;
            const count = await notificationService.getUnreadCount(userId);

            return ResponseHandler.success(res, { count }, 'Nombre de notifications non lues');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Mark notification as read
     * @route PATCH /api/notifications/:id/read
     */
    async markAsRead(req, res) {
        try {
            const { id } = req.params;
            const notification = await notificationService.markAsRead(id);

            if (!notification) {
                return ResponseHandler.notFound(res, 'Notification non trouvée');
            }

            return ResponseHandler.success(res, notification, 'Notification marquée comme lue');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Mark all notifications as read
     * @route PATCH /api/notifications/read-all
     */
    async markAllAsRead(req, res) {
        try {
            const userId = req.userId;
            const count = await notificationService.markAllAsRead(userId);

            return ResponseHandler.success(
                res,
                { updatedCount: count },
                `${count} notification(s) marquée(s) comme lue(s)`
            );
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Send test notification (admin only)
     * @route POST /api/notifications/test
     */
    async sendTestNotification(req, res) {
        try {
            const { type, channel, data } = req.body;
            const userId = req.userId;

            const notification = await notificationService.sendNotification(
                userId,
                type || 'general',
                channel || 'in_app',
                data || { message: 'Test notification', subject: 'Test' }
            );

            return ResponseHandler.created(res, notification, 'Notification de test envoyée');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }
}

module.exports = new NotificationController();
