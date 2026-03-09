const BaseRepository = require('./BaseRepository');
const { NotificationTemplate } = require('../models');

/**
 * Repository for NotificationTemplate operations
 */
class NotificationTemplateRepository extends BaseRepository {
    constructor() {
        super(NotificationTemplate);
    }

    /**
     * Find template by code
     * @param {String} code - Template code
     * @returns {Promise<Object>}
     */
    async findByCode(code) {
        return await this.model.findOne({
            where: { code, is_active: true }
        });
    }

    /**
     * Find templates by channel
     * @param {String} channel - Channel (email, sms, in_app)
     * @returns {Promise<Array>}
     */
    async findByChannel(channel) {
        return await this.model.findAll({
            where: { channel, is_active: true }
        });
    }

    /**
     * Get all active templates
     * @returns {Promise<Array>}
     */
    async findAllActive() {
        return await this.model.findAll({
            where: { is_active: true },
            order: [['name', 'ASC']]
        });
    }
}

module.exports = new NotificationTemplateRepository();
