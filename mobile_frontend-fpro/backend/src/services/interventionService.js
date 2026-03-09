const interventionRepository = require('../repositories/interventionRepository');
const technicianRepository = require('../repositories/technicianRepository');
const maintenanceRequestRepository = require('../repositories/maintenanceRequestRepository');
// FIX TECHNICIEN 500 - Utilisation d'imports directs pour éviter les dépendances circulaires
const { sequelize } = require('../config/database');
const InterventionReport = require('../models/InterventionReport');

class InterventionService {
    async startIntervention(id) {
        const intervention = await interventionRepository.findById(id);
        if (!intervention) throw new Error('Intervention non trouvée');

        const request = await maintenanceRequestRepository.findById(intervention.request_id);
        if (request && request.status === 'closed') {
            throw new Error('Impossible de démarrer une intervention sur une maintenance clôturée');
        }

        const updatedIntervention = await intervention.update({
            status: 'in_progress',
            started_at: new Date()
        });

        // [Changement] Mise à jour du statut de la demande de maintenance suite au démarrage par le technicien
        await maintenanceRequestRepository.update(intervention.request_id, { status: 'in_progress' });

        return updatedIntervention;
    }

    async createReport(interventionId, reportData) {
        const transaction = await sequelize.transaction();
        try {
            const intervention = await interventionRepository.findById(interventionId);
            if (!intervention) throw new Error('Intervention non trouvée');

            const request = await maintenanceRequestRepository.findById(intervention.request_id);
            if (request && request.status === 'closed') {
                throw new Error('Impossible de soumettre un rapport sur une maintenance clôturée');
            }

            const report = await InterventionReport.create({
                intervention_id: interventionId,
                ...reportData
            }, { transaction });

            await intervention.update({
                status: 'completed',
                finished_at: new Date()
            }, { transaction });

            // [Changement] Mise à jour du statut de la demande de maintenance suite à la soumission du rapport
            // Le statut passe à 'completed_by_technician' pour attendre la confirmation du client.
            await maintenanceRequestRepository.update(intervention.request_id, { status: 'completed_by_technician' }, { transaction });

            // Decrease technician workload
            const technician = await technicianRepository.findById(intervention.technician_id);
            await technician.decrement('workload', { by: 1, transaction });

            await transaction.commit();
            return report;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async getReport(interventionId) {
        const intervention = await interventionRepository.findWithDetails(interventionId);
        if (!intervention || !intervention.report) {
            throw new Error('Rapport non trouvé');
        }
        return intervention.report;
    }

    // [Changement] Ajout de la méthode getMyInterventions pour permettre à un technicien de récupérer ses missions assignées.
    // Cette méthode identifie d'abord le profil technicien lié à l'ID utilisateur, puis interroge le repository pour les interventions.
    async getMyInterventions(userId) {
        // FIX TECHNICIEN 500 - Debug logs pour identifier la cause exacte
        console.log("DEBUG: InterventionService.getMyInterventions: userId input:", userId);

        const tech = await technicianRepository.findOne({ where: { user_id: userId } });
        console.log("DEBUG: Technician profile search result:", tech ? `Found (ID: ${tech.id})` : "NOT FOUND");

        if (!tech) {
            // FIX TECHNICIEN 500 - Lancer une erreur explicite
            throw new Error('Profil technicien non trouvé pour cet utilisateur');
        }

        console.log("DEBUG: interventionRepository.findByTechnician: calling with tech.id:", tech.id);
        const results = await interventionRepository.findByTechnician(tech.id);

        // FIX TECHNICIEN 500 - S'assurer que results est toujours un tableau
        return results || [];
    }
}

module.exports = new InterventionService();
