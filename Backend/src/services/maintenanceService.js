const maintenanceRequestRepository = require('../repositories/maintenanceRequestRepository');
const technicianRepository = require('../repositories/technicianRepository');
const interventionRepository = require('../repositories/interventionRepository');
const { sequelize } = require('../models');

class MaintenanceService {
    async createRequest(userId, companyId, data) {
        return await maintenanceRequestRepository.create({
            user_id: userId,
            company_id: companyId,
            ...data,
            status: 'new'
        });
    }

    async getRequestDetails(requestId) {
        const request = await maintenanceRequestRepository.findWithDetails(requestId);
        if (!request) throw new Error('Demande de maintenance non trouvée');
        return request;
    }

    async assignTechnician(requestId, technicianId) {
        const request = await maintenanceRequestRepository.findById(requestId);
        if (!request) throw new Error('Demande de maintenance non trouvée');

        const technician = await technicianRepository.findById(technicianId);
        if (!technician || !technician.is_available) {
            throw new Error('Technicien non trouvé ou indisponible');
        }

        const transaction = await sequelize.transaction();
        try {
            // Create intervention
            await interventionRepository.create({
                request_id: requestId,
                technician_id: technicianId,
                scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000), // Default: 2 hours from now
                status: 'scheduled'
            }, { transaction });

            // Update request status
            await request.update({ status: 'assigned' }, { transaction });

            // Update technician workload
            await technician.increment('workload', { by: 1, transaction });

            await transaction.commit();
            return await maintenanceRequestRepository.findWithDetails(requestId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Auto-assign technician using algorithm:
     * 1. Match skills
     * 2. Lowest workload
     * 3. Availability
     */
    async autoAssign(requestId) {
        const request = await maintenanceRequestRepository.findById(requestId);
        if (!request) throw new Error('Demande de maintenance non trouvée');

        const skillsNeeded = request.request_type ? [request.request_type] : [];
        const technician = await technicianRepository.findLeastLoaded(skillsNeeded);

        if (!technician) {
            throw new Error('Aucun technicien disponible ne correspond aux critères');
        }

        return await this.assignTechnician(requestId, technician.id);
    }
}

module.exports = new MaintenanceService();
