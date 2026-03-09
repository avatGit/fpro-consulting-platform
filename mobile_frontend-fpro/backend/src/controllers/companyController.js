const { Company } = require('../models');
const ResponseHandler = require('../utils/responseHandler');
const { Op } = require('sequelize');

class CompanyController {
    /**
     * List all companies with pagination and filtering
     * @route GET /api/companies
     */
    async listCompanies(req, res) {
        try {
            const { page = 1, limit = 20, search, city, is_active } = req.query;
            const offset = (page - 1) * limit;

            const where = {};

            // Filter by search term (name or email or siret)
            if (search) {
                where[Op.or] = [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { email: { [Op.iLike]: `%${search}%` } },
                    { siret: { [Op.iLike]: `%${search}%` } }
                ];
            }

            // Filter by city
            if (city) {
                where.city = { [Op.iLike]: `%${city}%` };
            }

            // Filter by active status
            if (is_active !== undefined) {
                where.is_active = is_active === 'true';
            }

            const { rows, count } = await Company.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['created_at', 'DESC']]
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
                'Liste des entreprises récupérée'
            );
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Get company details
     * @route GET /api/companies/:id
     */
    async getCompany(req, res) {
        try {
            const { id } = req.params;
            const company = await Company.findByPk(id);

            if (!company) {
                return ResponseHandler.notFound(res, 'Entreprise non trouvée');
            }

            return ResponseHandler.success(res, company, 'Détails de l\'entreprise récupérés');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Activate/Deactivate company
     * @route PUT /api/companies/:id/status
     */
    async updateCompanyStatus(req, res) {
        try {
            const { id } = req.params;
            const { is_active } = req.body;

            if (is_active === undefined) {
                return ResponseHandler.error(res, 'Le statut is_active est requis', 400);
            }

            const company = await Company.findByPk(id);
            if (!company) {
                return ResponseHandler.notFound(res, 'Entreprise non trouvée');
            }

            await company.update({ is_active });

            return ResponseHandler.success(
                res,
                { id: company.id, is_active: company.is_active },
                `Entreprise ${is_active ? 'activée' : 'désactivée'}`
            );
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }
}

module.exports = new CompanyController();
