const maintenanceService = require('../services/maintenanceService');
const ResponseHandler = require('../utils/responseHandler');
const socketService = require('../services/socketService');

class MaintenanceController {
    async createRequest(req, res) {
        try {
            const request = await maintenanceService.createRequest(req.userId, req.user.company_id || req.body.companyId, req.body);

            // Notify agents and admins
            socketService.emitToRole('agent', 'maintenance:new', request);
            socketService.emitToRole('admin', 'maintenance:new', request);

            return ResponseHandler.created(res, request, 'Demande de maintenance créée');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    async listUserRequests(req, res) {
        try {
            console.log(`Fetching maintenance for company_id: ${req.user.company_id}`);
            const requests = await maintenanceService.getUserRequests(req.userId, req.user.company_id);
            console.log(`Found ${requests.length} maintenance requests for company ${req.user.company_id}`);
            return ResponseHandler.success(res, requests, 'Liste des demandes récupérée');
        } catch (error) {
            console.error('Error listing maintenance requests:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    async getRequest(req, res) {
        try {
            const { id } = req.params;
            const request = await maintenanceService.getRequestDetails(id);
            return ResponseHandler.success(res, request, 'Détails de la demande récupérés');
        } catch (error) {
            if (error.message === 'Demande de maintenance non trouvée') {
                return ResponseHandler.notFound(res, error.message);
            }
            return ResponseHandler.serverError(res, error);
        }
    }

    async assignTechnician(req, res) {
        try {
            const { id } = req.params;
            const { technicianId } = req.body;
            const request = await maintenanceService.assignTechnician(id, technicianId);
            return ResponseHandler.success(res, request, 'Technicien assigné avec succès');
        } catch (error) {
            return ResponseHandler.error(res, error.message, 400);
        }
    }

    async autoAssign(req, res) {
        try {
            const { id } = req.params;
            const request = await maintenanceService.autoAssign(id);
            return ResponseHandler.success(res, request, 'Technicien assigné automatiquement');
        } catch (error) {
            return ResponseHandler.error(res, error.message, 400);
        }
    }

    async listAllRequests(req, res) {
        try {
            const requests = await maintenanceService.getAllRequests();
            return ResponseHandler.success(res, requests, 'Liste de toutes les demandes récupérée');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    async listAvailableTechnicians(req, res) {
        try {
            const technicians = await require('../repositories/technicianRepository').findAvailable();
            return ResponseHandler.success(res, technicians, 'Liste des techniciens disponibles récupérée');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const request = await maintenanceService.updateRequestStatus(id, status);
            return ResponseHandler.success(res, request, 'Statut mis à jour avec succès');
        } catch (error) {
            return ResponseHandler.error(res, error.message, 400);
        }
    }
}

module.exports = new MaintenanceController();
