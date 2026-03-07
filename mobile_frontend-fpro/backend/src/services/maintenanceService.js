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
            status: 'pending' // [Changement] Initial status is now 'pending'
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

        if (request.status === 'closed') {
            throw new Error('La maintenance est déjà clôturée et ne peut plus être modifiée');
        }

        // [Changement] Ajout de cette ligne car technicianId est l'ID de l'utilisateur et non l'ID du technicien. Chercher par user_id, pas par id
        // const technician = await technicianRepository.findById(technicianId);
        const technician = await technicianRepository.findOne({
            where: { user_id: technicianId }
        });
        if (!technician || !technician.is_available) {
            throw new Error('Technicien non trouvé ou indisponible');
        }

        const transaction = await sequelize.transaction();
        try {
            // Create intervention
            await interventionRepository.create({
                request_id: requestId,
                // [Changement] technician_id est maintenant l'ID du technicien et non l'ID de l'utilisateur.
                technician_id: technician.id,
                scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000), // Default: 2 hours from now
                status: 'scheduled'
            }, { transaction });

            await request.update({
                status: 'assigned',
                technician_id: technician.user_id // [Ajout] Link the user ID of the technician to the maintenance request
            }, { transaction });

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
        // [Changement] technician_id est maintenant l'ID du technicien et non l'ID de l'utilisateur.
        return await this.assignTechnician(requestId, technician.user_id);
    }

    async getUserRequests(userId) {
        return await maintenanceRequestRepository.findAllByUserId(userId);
    }

    // [Changement] Ajout de la méthode getAllRequests pour permettre à l'agent de voir toutes les demandes de maintenance.
    async getAllRequests() {
        return await maintenanceRequestRepository.findAll({
            include: [
                { model: require('../models').Company, as: 'company', attributes: ['name'] },
                { model: require('../models').User, as: 'user', attributes: ['first_name', 'last_name'] }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    // [Changement] Ajout de la confirmation par le client pour clôturer la maintenance
    async confirmMaintenance(requestId) {
        const request = await maintenanceRequestRepository.findById(requestId);
        console.log("STATUS EN BASE:", request.status);
        if (!request) throw new Error('Demande de maintenance non trouvée');

        if (request.status !== 'completed_by_technician') {
            throw new Error('La maintenance ne peut être confirmée que si elle est terminée par le technicien');
        }


        return await request.update({ status: 'closed' });
    }

    // [Changement] Mise à jour manuelle du statut
    async updateStatus(id, status) {
        const request = await maintenanceRequestRepository.findById(id);
        if (!request) throw new Error('Demande de maintenance non trouvée');

        // Validation simple des statuts autorisés pour une mise à jour manuelle
        const allowedStatuses = ['pending', 'assigned', 'in_progress', 'completed_by_technician', 'closed', 'cancelled'];
        if (!allowedStatuses.includes(status)) {
            throw new Error('Statut invalide');
        }

        return await request.update({ status });
    }
}

module.exports = new MaintenanceService();
