const { User, Company, Technician, sequelize } = require('../models');
const ResponseHandler = require('../utils/responseHandler');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

class AdminUserController {
    /**
     * List all users with pagination and filtering
     * @route GET /api/admin/users
     */
    async listUsers(req, res) {
        try {
            const { page = 1, limit = 20, search, role, company_id } = req.query;
            const offset = (page - 1) * limit;

            const where = {};

            // Filter by search term (name or email)
            if (search) {
                where[Op.or] = [
                    { first_name: { [Op.iLike]: `%${search}%` } },
                    { last_name: { [Op.iLike]: `%${search}%` } },
                    { email: { [Op.iLike]: `%${search}%` } }
                ];
            }

            // Filter by role
            if (role) {
                where.role = role;
            }

            // Filter by company
            if (company_id) {
                where.company_id = company_id;
            }

            const { rows, count } = await User.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: Company,
                        as: 'company',
                        attributes: ['id', 'name']
                    }
                ],
                attributes: { exclude: ['password_hash'] }
            });

            return ResponseHandler.successWithPagination(
                res,
                rows,
                {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalItems: count,
                    totalPages: Math.ceil(count / limit)
                },
                'Liste des utilisateurs récupérée'
            );
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Update user status (activate/deactivate)
     * @route PUT /api/admin/users/:id/status
     */
    async updateUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { is_active } = req.body;

            if (is_active === undefined) {
                return ResponseHandler.error(res, 'Le statut is_active est requis', 400);
            }

            const user = await User.findByPk(id);
            if (!user) {
                return ResponseHandler.notFound(res, 'Utilisateur non trouvé');
            }

            // Prevent self-deactivation
            if (user.id === req.userId) {
                return ResponseHandler.forbidden(res, 'Vous ne pouvez pas désactiver votre propre compte');
            }

            await user.update({ is_active });

            return ResponseHandler.success(
                res,
                { id: user.id, is_active: user.is_active },
                `Compte utilisateur ${is_active ? 'activé' : 'désactivé'}`
            );
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Update user details
     * @route PUT /api/admin/users/:id
     */
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { first_name, last_name, email, phone } = req.body;

            const user = await User.findByPk(id);
            if (!user) {
                return ResponseHandler.notFound(res, 'Utilisateur non trouvé');
            }

            // Check email uniqueness if changed
            if (email && email !== user.email) {
                const existingUser = await User.findOne({ where: { email } });
                if (existingUser) {
                    return ResponseHandler.error(res, 'Cet email est déjà utilisé', 409);
                }
            }

            // [Changement] Mise à jour des informations par l'admin
            await user.update({
                first_name: first_name || user.first_name,
                last_name: last_name || user.last_name,
                email: email || user.email,
                phone: phone !== undefined ? phone : user.phone
            });

            return ResponseHandler.success(res, user.toJSON(), 'Utilisateur mis à jour avec succès');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Update user role
     * @route PUT /api/admin/users/:id/role
     */
    async updateUserRole(req, res) {
        try {
            const { id } = req.params;
            const { role } = req.body;

            const validRoles = ['admin', 'client', 'agent', 'technicien'];
            if (!validRoles.includes(role)) {
                return ResponseHandler.error(res, 'Rôle invalide', 400);
            }

            const user = await User.findByPk(id);
            if (!user) {
                return ResponseHandler.notFound(res, 'Utilisateur non trouvé');
            }

            // Prevent changing own role
            if (user.id === req.userId) {
                return ResponseHandler.forbidden(res, 'Vous ne pouvez pas modifier votre propre rôle');
            }

            await user.update({ role });

            return ResponseHandler.success(
                res,
                { id: user.id, role: user.role },
                `Rôle mis à jour vers : ${role}`
            );
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Create a new Agent
     * @route POST /api/admin/users/agent
     */
    async createAgent(req, res) {
        try {
            const { email, password, first_name, last_name, phone, company_id } = req.body;

            if (!email || !password || !first_name || !last_name) {
                return ResponseHandler.error(res, 'Champs requis manquants', 400);
            }

            // Check if user exists
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return ResponseHandler.error(res, 'Cet email est déjà utilisé', 409);
            }

            // Hash password logic moved to User model hook
            // const password_hash = await bcrypt.hash(password, 10); 

            const newUser = await User.create({
                email,
                password_hash: password, // Pass plain text, hook will hash it
                first_name,
                last_name,
                phone,
                company_id,
                role: 'agent',
                is_active: true
            });

            // Exclude password from response
            const userResponse = newUser.toJSON();
            delete userResponse.password_hash;

            return ResponseHandler.created(res, userResponse, 'Agent créé avec succès');

        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Create a new technicien
     * @route POST /api/admin/users/technicien
     */
    async createTechnician(req, res) {
        const transaction = await sequelize.transaction();
        try {
            const { email, password, first_name, last_name, phone, company_id, skills } = req.body;

            if (!email || !password || !first_name || !last_name) {
                await transaction.rollback();
                return ResponseHandler.error(res, 'Champs requis manquants', 400);
            }

            // Check if user exists
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                await transaction.rollback();
                return ResponseHandler.error(res, 'Cet email est déjà utilisé', 409);
            }

            // const password_hash = await bcrypt.hash(password, 10);

            // Create User
            const newUser = await User.create({
                email,
                password_hash: password, // Pass plain text, hook will hash it
                first_name,
                last_name,
                phone,
                company_id,
                role: 'technicien', // Standardizing on 'technician' as per partial existing code or 'technicien' if updated.
                // Let's use 'technician' if I updated the ENUM to include it, but 'technician' is the legacy one
                is_active: true
            }, { transaction });

            // Create technician Profile
            await Technician.create({
                user_id: newUser.id,
                skills: skills || [],
                is_available: true
            }, { transaction });

            await transaction.commit();

            const userResponse = newUser.toJSON();
            delete userResponse.password_hash;

            return ResponseHandler.created(res, userResponse, 'Technicien créé avec succès');

        } catch (error) {
            await transaction.rollback();
            return ResponseHandler.serverError(res, error);
        }
    }
}

module.exports = new AdminUserController();
