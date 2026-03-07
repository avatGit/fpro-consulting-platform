const BaseRepository = require('./BaseRepository');
// FIX TECHNICIEN 500 - Utilisation d'imports directs pour éviter les dépendances circulaires
const Intervention = require('../models/Intervention');
const InterventionReport = require('../models/InterventionReport');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Technician = require('../models/Technician');
const User = require('../models/User');

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
