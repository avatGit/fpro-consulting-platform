const interventionRepository = require('../repositories/interventionRepository');
const technicianRepository = require('../repositories/technicianRepository');
const maintenanceRequestRepository = require('../repositories/maintenanceRequestRepository');
const { sequelize, InterventionReport } = require('../models');

class InterventionService {
    async startIntervention(interventionId) {
        const intervention = await interventionRepository.findById(interventionId);
        if (!intervention) throw new Error('Intervention non trouvée');

        return await intervention.update({
            status: 'in_progress',
            started_at: new Date()
        });
    }

    async createReport(interventionId, reportData) {
        const intervention = await interventionRepository.findById(interventionId);
        if (!intervention) throw new Error('Intervention non trouvée');

        const transaction = await sequelize.transaction();
        try {
            const report = await InterventionReport.create({
                intervention_id: interventionId,
                ...reportData
            }, { transaction });

            await intervention.update({
                status: 'completed',
                finished_at: new Date()
            }, { transaction });

            // Update request status to done
            await maintenanceRequestRepository.update(intervention.request_id, { status: 'done' }, { transaction });

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

    async getTechnicianInterventions(userId) {
        const technician = await technicianRepository.findByUserId(userId);
        if (!technician) throw new Error('Technicien non trouvé');

        return await interventionRepository.findByTechnician(technician.id);
    }
}

module.exports = new InterventionService();
