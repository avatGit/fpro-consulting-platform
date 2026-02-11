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
    async updateRentalStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const rental = await rentalService.updateStatus(id, status);
            return ResponseHandler.success(res, rental, 'Statut de la réservation mis à jour');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    async listAllRentals(req, res) {
        try {
            const rentals = await rentalService.listAllRentals();
            return ResponseHandler.success(res, rentals, 'Liste de toutes les réservations récupérée');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    async listUserRentals(req, res) {
        try {
            const rentals = await rentalService.listUserRentals(req.userId);
            return ResponseHandler.success(res, rentals, 'Vos locations récupérées');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }
}

module.exports = new RentalController();
