const { AuditLog, User } = require('../models');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class AuditController {
    /**
     * GET /api/admin/audit-logs
     * Lister tous les logs d'audit avec filtrage
     */
    async listAuditLogs(req, res) {
        try {
            const {
                page = 1,
                limit = 50,
                action,
                resourceType,
                userId,
                startDate,
                endDate,
                search
            } = req.query;

            const where = {};

            // Filtres
            if (action) where.action = action;
            if (resourceType) where.resource_type = resourceType;
            if (userId) where.user_id = userId;

            if (startDate || endDate) {
                where.created_at = {};
                if (startDate) where.created_at[Op.gte] = new Date(startDate);
                if (endDate) where.created_at[Op.lte] = new Date(endDate);
            }

            if (search) {
                where.description = { [Op.iLike]: `%${search}%` };
            }

            const offset = (parseInt(page) - 1) * parseInt(limit);

            const { count, rows } = await AuditLog.findAndCountAll({
                where,
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'first_name', 'last_name', 'email', 'role']
                    }
                ],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset
            });

            return ResponseHandler.success(res, {
                logs: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / parseInt(limit))
                }
            }, 'Logs d\'audit récupérés');
        } catch (error) {
            logger.error('List audit logs error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * GET /api/admin/audit-logs/:id
     * Obtenir les détails d'un log d'audit
     */
    async getAuditLog(req, res) {
        try {
            const { id } = req.params;

            const log = await AuditLog.findByPk(id, {
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'first_name', 'last_name', 'email', 'role']
                    }
                ]
            });

            if (!log) {
                return ResponseHandler.notFound(res, 'Log d\'audit non trouvé');
            }

            return ResponseHandler.success(res, log, 'Détails du log récupérés');
        } catch (error) {
            logger.error('Get audit log error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * GET /api/admin/audit-logs/stats
     * Obtenir des statistiques sur les logs d'audit
     */
    async getAuditStats(req, res) {
        try {
            const { startDate, endDate } = req.query;

            const where = {};
            if (startDate || endDate) {
                where.created_at = {};
                if (startDate) where.created_at[Op.gte] = new Date(startDate);
                if (endDate) where.created_at[Op.lte] = new Date(endDate);
            }

            const [actionStats, resourceStats, userStats] = await Promise.all([
                // Stats par action
                AuditLog.findAll({
                    where,
                    attributes: [
                        'action',
                        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                    ],
                    group: ['action']
                }),
                // Stats par type de ressource
                AuditLog.findAll({
                    where,
                    attributes: [
                        'resource_type',
                        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                    ],
                    group: ['resource_type']
                }),
                // Stats par utilisateur
                AuditLog.findAll({
                    where,
                    attributes: [
                        'user_id',
                        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                    ],
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['first_name', 'last_name', 'email']
                        }
                    ],
                    group: ['user_id', 'user.id', 'user.first_name', 'user.last_name', 'user.email'],
                    limit: 10,
                    order: [[sequelize.fn('COUNT', sequelize.col('AuditLog.id')), 'DESC']]
                })
            ]);

            return ResponseHandler.success(res, {
                byAction: actionStats,
                byResourceType: resourceStats,
                topUsers: userStats
            }, 'Statistiques d\'audit récupérées');
        } catch (error) {
            logger.error('Get audit stats error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }
}

module.exports = new AuditController();
