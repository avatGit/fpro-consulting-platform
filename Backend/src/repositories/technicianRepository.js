const BaseRepository = require('./BaseRepository');
const { Technician, User } = require('../models');
const { Op } = require('sequelize');

class TechnicianRepository extends BaseRepository {
    constructor() {
        super(Technician);
    }

    async findAvailable() {
        return await this.model.findAll({
            where: { is_available: true },
            include: [{ model: User, as: 'user' }]
        });
    }

    async findWithSkills(skills) {
        return await this.model.findAll({
            where: {
                skills: { [Op.overlap]: skills }
            },
            include: [{ model: User, as: 'user' }]
        });
    }

    async findLeastLoaded(skills = []) {
        const where = { is_available: true };
        if (skills.length > 0) {
            where.skills = { [Op.overlap]: skills };
        }
        return await this.model.findOne({
            where,
            order: [['workload', 'ASC']],
            include: [{ model: User, as: 'user' }]
        });
    }
}

module.exports = new TechnicianRepository();
