const { User, Order, Company, Product, MaintenanceRequest, Rental, Invoice, sequelize } = require('../models');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class AdminController {
    /**
     * GET /api/admin/dashboard/stats
     * Obtenir les statistiques du dashboard admin
     */
    async getDashboardStats(req, res) {
        try {
            // Statistiques générales
            const [
                totalUsers,
                activeUsers,
                totalOrders,
                pendingOrders,
                totalRevenue,
                monthRevenue,
                activeMaintenance,
                activeRentals,
                lowStockProducts
            ] = await Promise.all([
                User.count(),
                User.count({ where: { is_active: true } }),
                Order.count(),
                Order.count({ where: { status: 'pending' } }),
                Order.sum('total_amount', { where: { status: { [Op.in]: ['delivered'] } } }),
                Order.sum('total_amount', {
                    where: {
                        status: { [Op.in]: ['delivered'] },
                        createdAt: {
                            [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                        }
                    }
                }),
                MaintenanceRequest.count({ where: { status: { [Op.in]: ['new', 'assigned', 'in_progress'] } } }),
                Rental.count({ where: { status: 'active' } }),
                Product.count({ where: { stock_quantity: { [Op.lt]: 5 } } })
            ]);

            // Statistiques par statut de commande
            const ordersByStatus = await Order.findAll({
                attributes: [
                    'status',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                group: ['status']
            });

            // Commandes récentes (dernières 30 jours)
            const recentOrders = await Order.findAll({
                where: {
                    createdAt: {
                        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    }
                },
                attributes: [
                    [sequelize.fn('DATE', sequelize.col('Order.created_at')), 'date'],
                    [sequelize.fn('COUNT', sequelize.col('Order.id')), 'count'],
                    [sequelize.fn('SUM', sequelize.col('Order.total_amount')), 'revenue']
                ],
                group: [sequelize.fn('DATE', sequelize.col('Order.created_at'))],
                order: [[sequelize.fn('DATE', sequelize.col('Order.created_at')), 'ASC']]
            });

            // Nouveaux utilisateurs (derniers 30 jours)
            const newUsersCount = await User.count({
                where: {
                    createdAt: {
                        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    }
                }
            });

            // Commandes récentes pour la liste (non groupées)
            const recentOrdersList = await Order.findAll({
                limit: 5,
                order: [['createdAt', 'DESC']],
                include: [
                    { model: User, as: 'user', attributes: ['first_name', 'last_name'] }
                ]
            });

            return ResponseHandler.success(res, {
                overview: {
                    totalUsers,
                    activeUsers,
                    totalOrders,
                    pendingOrders,
                    totalRevenue: parseFloat(totalRevenue || 0),
                    monthRevenue: parseFloat(monthRevenue || 0),
                    activeMaintenance,
                    activeRentals,
                    lowStockProducts,
                    newUsersThisMonth: newUsersCount
                },
                recentOrders: recentOrdersList,
                ordersByStatus: ordersByStatus.map(o => ({
                    status: o.status,
                    count: parseInt(o.get('count'))
                })),
                recentOrdersTrend: recentOrders.map(o => ({
                    date: o.get('date'),
                    count: parseInt(o.get('count')),
                    revenue: parseFloat(o.get('revenue') || 0)
                }))
            }, 'Statistiques récupérées avec succès');
        } catch (error) {
            logger.error('Get dashboard stats error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * GET /api/admin/activity
     * Obtenir l'activité récente du système
     */
    async getActivityLogs(req, res) {
        try {
            const { limit = 20 } = req.query;

            // Récupérer les dernières commandes
            const recentOrders = await Order.findAll({
                limit: parseInt(limit) / 2,
                order: [['createdAt', 'DESC']],
                include: [
                    { model: User, as: 'user', attributes: ['first_name', 'last_name'] },
                    { model: Company, as: 'company', attributes: ['name'] }
                ]
            });

            // Récupérer les dernières demandes de maintenance
            const recentMaintenance = await MaintenanceRequest.findAll({
                limit: parseInt(limit) / 2,
                order: [['createdAt', 'DESC']],
                include: [
                    { model: User, as: 'user', attributes: ['first_name', 'last_name'] }
                ]
            });

            // Combiner et trier par date
            const activities = [
                ...recentOrders.map(o => ({
                    type: 'order',
                    id: o.id,
                    title: `Commande ${o.order_number}`,
                    user: `${o.user?.first_name} ${o.user?.last_name}`,
                    company: o.company?.name,
                    status: o.status,
                    amount: parseFloat(o.total_amount),
                    created_at: o.created_at
                })),
                ...recentMaintenance.map(m => ({
                    type: 'maintenance',
                    id: m.id,
                    title: 'Demande de maintenance',
                    user: `${m.user?.first_name} ${m.user?.last_name}`,
                    priority: m.priority,
                    status: m.status,
                    created_at: m.created_at
                }))
            ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, parseInt(limit));

            return ResponseHandler.success(res, activities, 'Activités récentes récupérées');
        } catch (error) {
            logger.error('Get activity logs error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * GET /api/admin/system/health
     * Obtenir l'état de santé du système
     */
    async getSystemHealth(req, res) {
        try {
            const dbStatus = await sequelize.authenticate()
                .then(() => 'healthy')
                .catch(() => 'unhealthy');

            const health = {
                status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
                database: dbStatus,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                timestamp: new Date().toISOString()
            };

            return ResponseHandler.success(res, health, 'État du système récupéré');
        } catch (error) {
            logger.error('Get system health error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }
}

module.exports = new AdminController();
