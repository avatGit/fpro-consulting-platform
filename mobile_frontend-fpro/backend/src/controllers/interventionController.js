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

    // [Changement] Ajout de cette méthode pour gérer la requête GET /api/interventions/my.
    // Elle utilise le userId extrait du token par le middleware d'authentification pour filtrer les interventions.
    async getMyInterventions(req, res) {
        // FIX TECHNICIEN 500 - sécuriser accès propriété
        if (!req.user) {
            return res.status(401).json({ message: "Authentification requise" });
        }

        // FIX TECHNICIEN 500 - Ajout de logs pour déboguer req.user et userId
        console.log("DEBUG: InterventionController: getMyInterventions called for user:", req.user.id);

        try {
            const interventions = await interventionService.getMyInterventions(req.userId);
            return ResponseHandler.success(res, interventions, 'Interventions récupérées avec succès');
        } catch (error) {
            // FIX TECHNICIEN 500 - Remplacement du crash par une gestion propre (Etape 4)
            console.error("Interventions my error:", error);
            return res.status(500).json({
                message: "Erreur récupération interventions technicien",
                error: error.message
            });
        }
    }
}

module.exports = new InterventionController();
