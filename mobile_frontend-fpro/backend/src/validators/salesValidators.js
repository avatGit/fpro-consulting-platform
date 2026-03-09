const Joi = require('joi');

const addItemSchema = Joi.object({
    productId: Joi.string().uuid().required(),
    quantity: Joi.number().integer().min(1).required()
});

const updateItemSchema = Joi.object({
    quantity: Joi.number().integer().min(1).required()
});

const generateQuoteSchema = Joi.object({
    companyId: Joi.string().uuid().required()
});

const updateQuoteStatusSchema = Joi.object({
    status: Joi.string().valid('draft', 'sent', 'accepted', 'refused', 'expired').required()
});

const createOrderSchema = Joi.object({
    quoteId: Joi.string().uuid().required()
});

module.exports = {
    addItemSchema,
    updateItemSchema,
    generateQuoteSchema,
    updateQuoteStatusSchema,
    createOrderSchema
};
