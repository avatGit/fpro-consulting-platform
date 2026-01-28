class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    async findAll(options = {}) {
        return await this.model.findAll(options);
    }

    async findById(id, options = {}) {
        return await this.model.findByPk(id, options);
    }

    async findOne(options = {}) {
        return await this.model.findOne(options);
    }

    async create(data, options = {}) {
        return await this.model.create(data, options);
    }

    async update(id, data, options = {}) {
        const record = await this.model.findByPk(id);
        if (!record) return null;
        return await record.update(data, options);
    }

    async delete(id, options = {}) {
        const record = await this.model.findByPk(id);
        if (!record) return null;
        return await record.destroy(options);
    }

    async count(options = {}) {
        return await this.model.count(options);
    }
}

module.exports = BaseRepository;
