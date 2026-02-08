const quoteService = require('../services/quoteService');
const ResponseHandler = require('../utils/responseHandler');

class QuoteController {
    async createFromCart(req, res) {
        try {
            const { companyId } = req.body;
            const quote = await quoteService.createFromCart(req.userId, companyId);
            return ResponseHandler.created(res, quote, 'Devis généré avec succès');
        } catch (error) {
            if (error.message === 'Le panier est vide') {
                return ResponseHandler.error(res, error.message, 400);
            }
            return ResponseHandler.serverError(res, error);
        }
    }

    async getQuote(req, res) {
        try {
            const { id } = req.params;
            const quote = await quoteService.getQuoteDetails(id);
            return ResponseHandler.success(res, quote, 'Détails du devis récupérés');
        } catch (error) {
            if (error.message === 'Devis non trouvé') {
                return ResponseHandler.notFound(res, error.message);
            }
            return ResponseHandler.serverError(res, error);
        }
    }

    async listUserQuotes(req, res) {
        try {
            // Basic implementation, could be moved to repository with pagination
            const { Quote } = require('../models');
            const quotes = await Quote.findAll({ where: { user_id: req.userId } });
            return ResponseHandler.success(res, quotes, 'Liste des devis récupérée');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const quote = await quoteService.updateStatus(id, status);
            return ResponseHandler.success(res, quote, 'Statut du devis mis à jour');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    async downloadPdf(req, res) {
        try {
            const { id } = req.params;
            const pdfDoc = await quoteService.generatePdf(id);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=quote-${id}.pdf`);

            pdfDoc.pipe(res);
            pdfDoc.end();
        } catch (error) {
            if (error.message === 'Devis non trouvé') {
                return ResponseHandler.notFound(res, error.message);
            }
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Lister tous les devis (Admin uniquement)
     */
    async listAllQuotes(req, res) {
        try {
            const { Quote, QuoteItem, Product, User, Company } = require('../models');
            const { status, page = 1, limit = 20 } = req.query;

            const where = {};
            if (status) where.status = status;

            const offset = (parseInt(page) - 1) * parseInt(limit);

            const { count, rows } = await Quote.findAndCountAll({
                where,
                include: [
                    { model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] },
                    { model: Company, as: 'company', attributes: ['name'] },
                    { model: QuoteItem, as: 'items', include: [{ model: Product, as: 'product' }] }
                ],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset
            });

            return ResponseHandler.success(res, {
                quotes: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / parseInt(limit))
                }
            }, 'Liste de tous les devis récupérée');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Approuver un devis (Admin uniquement)
     */
    async approveQuote(req, res) {
        try {
            const { id } = req.params;
            const quote = await quoteService.updateStatus(id, 'accepted');
            return ResponseHandler.success(res, quote, 'Devis approuvé avec succès');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Rejeter un devis (Admin uniquement)
     */
    async rejectQuote(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const quote = await quoteService.updateStatus(id, 'refused');
            // TODO: Send notification to user with reason
            return ResponseHandler.success(res, quote, 'Devis rejeté');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }
}

module.exports = new QuoteController();
