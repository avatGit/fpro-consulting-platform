const {
    Order,
    Quote,
    MaintenanceRequest,
    sequelize,
    Sequelize
} = require('../models');
const ResponseHandler = require('../utils/responseHandler');

const dashboardController = {
    /**
     * Récupère le résumé du tableau de bord pour l'utilisateur connecté
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    getDashboardSummary: async (req, res) => {
        try {
            const userId = req.user.id;
            const { Op } = Sequelize;

            // 1. Récupérer les statistiques (Counts)
            const [ordersCount, quotesCount, interventionsCount, unpaidOrdersCount] = await Promise.all([
                // Commandes en cours
                Order.count({
                    where: {
                        user_id: userId,
                        status: {
                            [Op.in]: ['pending', 'validated', 'processing', 'shipped']
                        }
                    }
                }),
                // Devis acceptés (qui sont devenus des commandes)
                Quote.count({
                    where: {
                        user_id: userId,
                        status: 'accepted'
                    }
                }),
                // Interventions en cours
                MaintenanceRequest.count({
                    where: {
                        user_id: userId,
                        status: {
                            [Op.in]: ['new', 'assigned', 'in_progress']
                        }
                    }
                }),
                // Factures à payer (Commandes non payées)
                Order.count({
                    where: {
                        user_id: userId,
                        payment_status: {
                            [Op.in]: ['pending', 'partial']
                        },
                        status: {
                            [Op.ne]: 'cancelled'
                        }
                    }
                })
            ]);

            // 2. Récupérer les activités récentes (5 dernières de chaque type)
            const [recentOrders, recentQuotes, recentInterventions] = await Promise.all([
                Order.findAll({
                    where: { user_id: userId },
                    limit: 5,
                    order: [['created_at', 'DESC']],
                    attributes: ['id', 'order_number', 'status', 'created_at']
                }),
                Quote.findAll({
                    where: {
                        user_id: userId,
                        status: 'accepted'
                    },
                    limit: 5,
                    order: [['created_at', 'DESC']],
                    attributes: ['id', 'quote_number', 'status', 'created_at']
                }),
                MaintenanceRequest.findAll({
                    where: { user_id: userId },
                    limit: 5,
                    order: [['created_at', 'DESC']],
                    attributes: ['id', 'request_type', 'status', 'created_at']
                })
            ]);

            // 3. Normaliser et fusionner les activités
            const activities = [
                ...recentOrders.map(o => ({
                    id: o.id,
                    type: 'order',
                    number: o.order_number,
                    status: o.status,
                    date: o.created_at
                })),
                ...recentQuotes.map(q => ({
                    id: q.id,
                    type: 'quote',
                    number: q.quote_number,
                    status: q.status,
                    date: q.created_at
                })),
                ...recentInterventions.map(i => ({
                    id: i.id,
                    type: 'maintenance',
                    number: null, // Pas de numéro visible pour maintenance souvent, ou ID interne
                    status: i.status,
                    date: i.created_at,
                    detail: i.request_type
                }))
            ];

            // Trier par date décroissante et prendre les 10 premières
            const sortedActivities = activities
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 10);

            // 4. Envoyer la réponse
            ResponseHandler.success(res, {
                counts: {
                    ordersInProgress: ordersCount,
                    quotesPending: quotesCount,
                    interventionsActive: interventionsCount,
                    invoicesUnpaid: unpaidOrdersCount
                },
                recentActivities: sortedActivities
            }, 'Résumé du tableau de bord récupéré avec succès');

        } catch (error) {
            console.error('Erreur Dashboard:', error);
            ResponseHandler.serverError(res, error);
        }
    }
};

module.exports = dashboardController;
