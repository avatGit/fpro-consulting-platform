const BaseRepository = require('./BaseRepository');
const { MaintenanceRequest, User, Company, Intervention } = require('../models');

class MaintenanceRequestRepository extends BaseRepository {
    constructor() {
        super(MaintenanceRequest);
    }

    async findWithDetails(requestId) {
        return await this.model.findByPk(requestId, {
            include: [
                { model: User, as: 'user' },
                { model: Company, as: 'company' },
                { model: Intervention, as: 'interventions' }
            ]
        });
    }

    async findByStatus(status) {
        return await this.model.findAll({ where: { status } });
    }
}

module.exports = new MaintenanceRequestRepository();
