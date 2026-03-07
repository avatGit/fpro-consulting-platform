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
            const suggestions = await aiService.suggestTechnicians(id);
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

    async getUserRequests(req, res) {
        try {
            // [Changement] Les Agents et Admins peuvent désormais voir l'historique de toutes les demandes de maintenance
            const requests = (req.userRole === 'admin' || req.userRole === 'agent')
                ? await maintenanceService.getAllRequests()
                : await maintenanceService.getUserRequests(req.userId);
            return ResponseHandler.success(res, requests, 'Historique des demandes récupéré');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    // [Changement] Confirmation client pour clôturer la maintenance
    async confirmMaintenance(req, res) {
        try {
            const { id } = req.params;

            // [Changement] Restriction confirmation maintenance au client uniquement
            if (req.user.role !== 'client') {
                return ResponseHandler.error(res, 'Seul le client peut confirmer la fin de la maintenance', 403);
            }

            const request = await maintenanceService.confirmMaintenance(id);
            return ResponseHandler.success(res, request, 'Maintenance confirmée et clôturée avec succès');
        } catch (error) {
            return ResponseHandler.error(res, error.message, 400);
        }
    }

    // [Changement] Mise à jour manuelle du statut par l'Agent/Admin
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (req.userRole !== 'admin' && req.userRole !== 'agent') {
                return ResponseHandler.error(res, 'Accès non autorisé', 403);
            }

            const request = await maintenanceService.updateStatus(id, status);
            return ResponseHandler.success(res, request, 'Statut de la maintenance mis à jour');
        } catch (error) {
            return ResponseHandler.error(res, error.message, 400);
        }
    }
}

module.exports = new MaintenanceController();
