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
                { model: User, as: 'technician', attributes: ['id', 'first_name', 'last_name'] }, // [Ajout]
                { model: Intervention, as: 'interventions' }
            ]
        });
    }

    async findByStatus(status) {
        return await this.model.findAll({ where: { status } });
    }

    async findAllByUserId(userId) {
        return await this.model.findAll({
            where: { user_id: userId },
            include: [
                { model: Company, as: 'company', attributes: ['name'] },
                { model: User, as: 'technician', attributes: ['id', 'first_name', 'last_name'] }, // [Ajout] S'assurer que l'ID est bien présent
                { model: Intervention, as: 'interventions' }
            ],
            order: [['created_at', 'DESC']]
        });
    }
}

module.exports = new MaintenanceRequestRepository();
