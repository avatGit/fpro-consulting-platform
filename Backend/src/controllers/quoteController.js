const quoteService = require('../services/quoteService');
const orderService = require('../services/orderService');
const ResponseHandler = require('../utils/responseHandler');
const socketService = require('../services/socketService');
const logger = require('../utils/logger');

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

    async createManually(req, res) {
        try {
            const { userId, companyId, items } = req.body;
            // userId here refers to the CLIENT for whom the agent is creating the quote
            const quote = await quoteService.createManually(userId, companyId, items);
            return ResponseHandler.created(res, quote, 'Devis créé manuellement avec succès');
        } catch (error) {
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
            // Only return accepted quotes (those that became orders)
            const { Quote } = require('../models');
            const { Op } = require('sequelize');
            const quotes = await Quote.findAll({
                where: {
                    user_id: req.userId,
                    status: 'accepted'
                },
                order: [['created_at', 'DESC']]
            });
            return ResponseHandler.success(res, quotes, 'Liste des devis acceptés récupérée');
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

    async updateQuote(req, res) {
        try {
            const { id } = req.params;
            const quote = await quoteService.updateQuote(id, req.body);
            return ResponseHandler.success(res, quote, 'Devis mis à jour avec succès');
        } catch (error) {
            if (error.message === 'Devis non trouvé') {
                return ResponseHandler.notFound(res, error.message);
            }
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

            // Create order automatically from accepted quote
            await orderService.createFromQuote(id);

            return ResponseHandler.success(res, quote, 'Devis approuvé et commande générée avec succès');
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

    /**
     * Client accepte son devis et génère une commande
     */
    async clientAcceptAndOrder(req, res) {
        try {
            const { id } = req.params;
            logger.info(`[DEBUG] clientAcceptAndOrder: id=${id}, userId=${req.userId}`);

            const quote = await quoteService.getQuoteDetails(id);
            if (!quote) {
                logger.warn(`[DEBUG] Quote not found: ${id}`);
                return ResponseHandler.notFound(res, 'Devis non trouvé');
            }

            logger.info(`[DEBUG] Quote retrieved: user_id=${quote.user_id}, status=${quote.status}`);

            // Check ownership - Use String conversion to be safe with UUIDs/Strings
            if (String(quote.user_id) !== String(req.userId)) {
                logger.warn(`[DEBUG] Ownership mismatch: ${quote.user_id} !== ${req.userId}`);
                return ResponseHandler.error(res, 'Action non autorisée sur ce devis', 403);
            }

            if (quote.status !== 'pending' && quote.status !== 'sent') {
                logger.warn(`[DEBUG] Invalid status: ${quote.status}`);
                return ResponseHandler.error(res, 'Ce devis ne peut plus être accepté', 400);
            }

            logger.info(`[DEBUG] Updating status to accepted...`);
            const updatedQuote = await quoteService.updateStatus(id, 'accepted');

            logger.info(`[DEBUG] Creating order from quote...`);
            const order = await orderService.createFromQuote(id);

            logger.info(`[DEBUG] Order creation successful: ${order.id}`);

            // Notify agents and admins
            socketService.emitToRole('agent', 'order:new', order);
            socketService.emitToRole('admin', 'order:new', order);

            return ResponseHandler.success(res, { quote: updatedQuote, order }, 'Votre commande a été confirmée avec succès');
        } catch (error) {
            logger.error('[ERROR] clientAcceptAndOrder failed:', error);
            return ResponseHandler.serverError(res, error);
        }
    }
    /**
     * Récupérer tous les devis (Admin & Agent)
     */
    async listAllQuotes(req, res) {
        try {
            const quotes = await quoteService.getAllQuotes();
            return ResponseHandler.success(res, quotes, 'Liste de tous les devis récupérée');
        } catch (error) {
            console.error('Error in listAllQuotes:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Télécharger le PDF du devis
     */
    async downloadPdf(req, res) {
        try {
            const { id } = req.params;
            return ResponseHandler.error(res, 'Fonctionnalité non implémentée', 501);
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }
}

module.exports = new QuoteController();
