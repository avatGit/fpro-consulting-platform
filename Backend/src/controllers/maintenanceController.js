const maintenanceService = require('../services/maintenanceService');
const aiService = require('../services/aiService');
const ResponseHandler = require('../utils/responseHandler');

class MaintenanceController {
    async createRequest(req, res) {
        try {
            const request = await maintenanceService.createRequest(req.userId, req.user.company_id || req.body.companyId, req.body);
            return ResponseHandler.created(res, request, 'Demande de maintenance créée');
        } catch (error) {
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

    /**
     * Get AI technician suggestions for a maintenance request
     * @route GET /api/maintenance/:id/suggest-technician
     */
    async getSuggestedTechnicians(req, res) {
        try {
            const { id } = req.params;
            const suggestions = await aiService.suggestTechnician(id);
            return ResponseHandler.success(
                res,
                suggestions,
                'Suggestions de techniciens générées (décision finale revient à l\'agent)'
            );
        } catch (error) {
            if (error.message === 'Maintenance request not found') {
                return ResponseHandler.notFound(res, 'Demande de maintenance non trouvée');
            }
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Get priority score for a maintenance request
     * @route GET /api/maintenance/:id/priority
     */
    async getPriorityScore(req, res) {
        try {
            const { id } = req.params;
            const maintenanceRequest = await maintenanceService.getRequestDetails(id);
            const priorityScore = await aiService.calculatePriority(maintenanceRequest);
            return ResponseHandler.success(res, priorityScore, 'Score de priorité calculé');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Get technician workload distribution
     * @route GET /api/maintenance/workload/distribution
     */
    async getWorkloadDistribution(req, res) {
        try {
            const distribution = await aiService.getWorkloadDistribution();
            return ResponseHandler.success(res, distribution, 'Distribution de charge récupérée');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }
}

module.exports = new MaintenanceController();
