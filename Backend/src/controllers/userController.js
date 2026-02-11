const { User, Company } = require('../models');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

class UserController {
    /**
     * Lister tous les utilisateurs (Admin uniquement)
     */
    async listUsers(req, res) {
        try {
            const users = await User.findAll({
                attributes: { exclude: ['password_hash'] },
                include: [{
                    model: Company,
                    as: 'company',
                    attributes: ['id', 'name']
                }],
                order: [['created_at', 'DESC']]
            });
            return ResponseHandler.success(res, users, 'Liste des utilisateurs récupérée');
        } catch (error) {
            logger.error('List users error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Lister les clients (Admin & Agent)
     */
    async listClients(req, res) {
        try {
            const users = await User.findAll({
                where: { role: 'client' },
                attributes: { exclude: ['password_hash'] },
                include: [{
                    model: Company,
                    as: 'company',
                    attributes: ['id', 'name']
                }],
                order: [['created_at', 'DESC']]
            });
            return ResponseHandler.success(res, users, 'Liste des clients récupérée');
        } catch (error) {
            logger.error('List clients error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Mettre à jour un utilisateur (Admin uniquement)
     */
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { first_name, last_name, email, role, is_active } = req.body;

            const user = await User.findByPk(id);
            if (!user) {
                return ResponseHandler.notFound(res, 'Utilisateur non trouvé');
            }

            await user.update({
                first_name: first_name !== undefined ? first_name : user.first_name,
                last_name: last_name !== undefined ? last_name : user.last_name,
                email: email !== undefined ? email : user.email,
                role: role !== undefined ? role : user.role,
                is_active: is_active !== undefined ? is_active : user.is_active
            });

            return ResponseHandler.success(res, user, 'Utilisateur mis à jour avec succès');
        } catch (error) {
            logger.error('Update user error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Activer/Désactiver un compte utilisateur (Admin uniquement)
     */
    async toggleUserStatus(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id);

            if (!user) {
                return ResponseHandler.notFound(res, 'Utilisateur non trouvé');
            }

            // Empêcher l'admin de se désactiver lui-même
            if (user.id === req.userId) {
                return ResponseHandler.error(res, 'Vous ne pouvez pas désactiver votre propre compte', 400);
            }

            await user.update({ is_active: !user.is_active });

            return ResponseHandler.success(res, user, `Compte ${user.is_active ? 'activé' : 'désactivé'} avec succès`);
        } catch (error) {
            logger.error('Toggle user status error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Opérations en masse sur les utilisateurs (Admin uniquement)
     */
    async bulkUpdateUsers(req, res) {
        try {
            const { userIds, action, value } = req.body;

            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                return ResponseHandler.error(res, 'Liste d\'utilisateurs requise', 400);
            }

            const updateData = {};

            switch (action) {
                case 'activate':
                    updateData.is_active = true;
                    break;
                case 'deactivate':
                    updateData.is_active = false;
                    break;
                case 'change_role':
                    if (!value) {
                        return ResponseHandler.error(res, 'Rôle requis pour cette action', 400);
                    }
                    updateData.role = value;
                    break;
                default:
                    return ResponseHandler.error(res, 'Action non reconnue', 400);
            }

            // Empêcher l'admin de se modifier lui-même
            const filteredIds = userIds.filter(id => id !== req.userId);

            const [updatedCount] = await User.update(updateData, {
                where: { id: filteredIds }
            });

            return ResponseHandler.success(res, { updatedCount }, `${updatedCount} utilisateur(s) mis à jour`);
        } catch (error) {
            logger.error('Bulk update users error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Obtenir les statistiques d'un utilisateur (Admin uniquement)
     */
    async getUserStats(req, res) {
        try {
            const { id } = req.params;
            const { Order, MaintenanceRequest, Quote } = require('../models');

            const user = await User.findByPk(id);
            if (!user) {
                return ResponseHandler.notFound(res, 'Utilisateur non trouvé');
            }

            const [ordersCount, maintenanceCount, quotesCount] = await Promise.all([
                Order.count({ where: { user_id: id } }),
                MaintenanceRequest.count({ where: { user_id: id } }),
                Quote.count({ where: { user_id: id } })
            ]);

            return ResponseHandler.success(res, {
                user: user.toJSON(),
                stats: {
                    ordersCount,
                    maintenanceCount,
                    quotesCount
                }
            }, 'Statistiques utilisateur récupérées');
        } catch (error) {
            logger.error('Get user stats error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Supprimer un utilisateur (Admin uniquement)
     */
    async deleteUser(req, res) {
        try {
            const { id } = req.params;

            // Empêcher l'admin de se supprimer lui-même
            if (id === req.userId) {
                return ResponseHandler.error(res, 'Vous ne pouvez pas supprimer votre propre compte', 400);
            }

            const user = await User.findByPk(id);
            if (!user) {
                return ResponseHandler.notFound(res, 'Utilisateur non trouvé');
            }

            // Soft delete: désactiver au lieu de supprimer
            await user.update({ is_active: false });

            return ResponseHandler.success(res, null, 'Utilisateur supprimé avec succès');
        } catch (error) {
            logger.error('Delete user error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }
}

module.exports = new UserController();
