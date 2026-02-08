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

    async findAllWithDetails() {
        // Need to require models inside method to avoid circular dependency issues sometimes, 
        // but cleaner to use the ones from constructor/module scope if reliable.
        // The module scope ones are: MaintenanceRequest, User, Company, Intervention
        // Only MaintenanceRequest is the model, others are for include.
        const { User, Company, Intervention } = require('../models');

        return await this.model.findAll({
            include: [
                { model: User, as: 'user' },
                { model: Company, as: 'company' },
                { model: Intervention, as: 'interventions' }
            ],
            order: [['created_at', 'DESC']]
        });
    }
}

module.exports = new MaintenanceRequestRepository();
