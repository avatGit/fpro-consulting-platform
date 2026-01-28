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
}

module.exports = new QuoteController();
