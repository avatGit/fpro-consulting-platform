const Joi = require('joi');

const createMaintenanceSchema = Joi.object({
    description: Joi.string().required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
    request_type: Joi.string().allow('', null)
});

const assignTechnicianSchema = Joi.object({
    technicianId: Joi.string().uuid().required()
});

const createReportSchema = Joi.object({
    notes: Joi.string().allow('', null),
    photo_links: Joi.array().items(Joi.string().uri()),
    time_spent_minutes: Joi.number().integer().min(0),
    parts_used: Joi.array().items(Joi.object({
        part_name: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required()
    }))
});

const createBookingSchema = Joi.object({
    items: Joi.array().items(Joi.object({
        productId: Joi.string().uuid().required(),
        startDate: Joi.date().iso().required(),
        endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
        quantity: Joi.number().integer().min(1).required()
    })).min(1).required()
});

module.exports = {
    createMaintenanceSchema,
    assignTechnicianSchema,
    createReportSchema,
    createBookingSchema
};
