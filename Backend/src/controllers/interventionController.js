const interventionService = require('../services/interventionService');
const ResponseHandler = require('../utils/responseHandler');

class InterventionController {
    async startIntervention(req, res) {
        try {
            const { id } = req.params;
            const intervention = await interventionService.startIntervention(id);
            return ResponseHandler.success(res, intervention, 'Intervention démarrée');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    async createReport(req, res) {
        try {
            const { id } = req.params;
            const report = await interventionService.createReport(id, req.body);
            return ResponseHandler.created(res, report, 'Rapport d\'intervention créé');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }

    async getReport(req, res) {
        try {
            const { id } = req.params;
            const report = await interventionService.getReport(id);
            return ResponseHandler.success(res, report, 'Rapport d\'intervention récupéré');
        } catch (error) {
            if (error.message === 'Rapport non trouvé') {
                return ResponseHandler.notFound(res, error.message);
            }
            return ResponseHandler.serverError(res, error);
        }
    }

    async listMyInterventions(req, res) {
        try {
            const interventions = await interventionService.getTechnicianInterventions(req.userId);
            return ResponseHandler.success(res, interventions, 'Liste de vos interventions récupérée');
        } catch (error) {
            return ResponseHandler.serverError(res, error);
        }
    }
}

module.exports = new InterventionController();
