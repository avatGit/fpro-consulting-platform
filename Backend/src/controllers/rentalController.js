const rentalService = require('../services/rentalService');
const ResponseHandler = require('../utils/responseHandler');

class RentalController {
    async createBooking(req, res) {
        try {
            const rental = await rentalService.createBooking(req.userId, req.user.company_id || req.body.companyId, req.body.items);
            return ResponseHandler.created(res, rental, 'Réservation créée avec succès');
        } catch (error) {
            return ResponseHandler.error(res, error.message, 400);
        }
    }

    async checkAvailability(req, res) {
        try {
            const { productId, startDate, endDate } = req.query;
            const isAvailable = await rentalService.checkAvailability(productId, startDate, endDate);
            return ResponseHandler.success(res, { isAvailable }, 'Disponibilité vérifiée');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    async confirmBooking(req, res) {
        try {
            const { id } = req.params;
            const rental = await rentalService.confirmBooking(id);
            return ResponseHandler.success(res, rental, 'Réservation confirmée');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }
}

module.exports = new RentalController();
