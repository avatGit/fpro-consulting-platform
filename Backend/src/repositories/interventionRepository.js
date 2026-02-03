const BaseRepository = require('./BaseRepository');
const { Intervention, InterventionReport, Technician, User, MaintenanceRequest } = require('../models');

class InterventionRepository extends BaseRepository {
    constructor() {
        super(Intervention);
    }

    async findWithDetails(interventionId) {
        return await this.model.findByPk(interventionId, {
            include: [
                { model: InterventionReport, as: 'report' },
                { model: Technician, as: 'technician', include: [{ model: User, as: 'user' }] },
                { model: MaintenanceRequest, as: 'request' }
            ]
        });
    }

    async findByTechnician(technicianId) {
        return await this.model.findAll({
            where: { technician_id: technicianId },
            include: [{ model: MaintenanceRequest, as: 'request' }]
        });
    }
}

module.exports = new InterventionRepository();
