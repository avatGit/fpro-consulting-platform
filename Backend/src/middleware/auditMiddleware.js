const { AuditLog } = require('../models');
const logger = require('../utils/logger');

/**
 * Middleware d'audit automatique
 * Enregistre toutes les actions admin (CREATE, UPDATE, DELETE)
 */
const auditLog = (action, resourceType) => {
    return async (req, res, next) => {
        // Stocker les informations pour le post-processing
        req.auditInfo = {
            action,
            resourceType,
            oldValue: null,
            newValue: null
        };

        // Intercepter la réponse pour capturer les données
        const originalJson = res.json;
        res.json = function (data) {
            // Enregistrer l'audit log après la réponse réussie
            if (res.statusCode >= 200 && res.statusCode < 300) {
                createAuditLog(req, data).catch(err => {
                    logger.error('Audit log creation failed:', err);
                });
            }
            return originalJson.call(this, data);
        };

        next();
    };
};

/**
 * Créer un enregistrement d'audit
 */
const createAuditLog = async (req, responseData) => {
    try {
        const { action, resourceType, oldValue } = req.auditInfo;

        // Extraire l'ID de la ressource depuis les paramètres ou la réponse
        let resourceId = req.params.id || req.params.userId;
        if (!resourceId && responseData?.data?.id) {
            resourceId = responseData.data.id;
        }

        // Extraire la nouvelle valeur depuis la réponse
        let newValue = null;
        if (responseData?.data) {
            newValue = responseData.data;
        }

        // Créer le log
        await AuditLog.create({
            user_id: req.userId || null,
            action,
            resource_type: resourceType,
            resource_id: resourceId,
            old_value: oldValue,
            new_value: newValue,
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.headers['user-agent'],
            description: generateDescription(action, resourceType, req)
        });
    } catch (error) {
        logger.error('Failed to create audit log:', error);
    }
};

/**
 * Générer une description lisible de l'action
 */
const generateDescription = (action, resourceType, req) => {
    const user = req.user ? `${req.user.first_name} ${req.user.last_name}` : 'Unknown';

    switch (action) {
        case 'CREATE':
            return `${user} a créé un(e) ${resourceType}`;
        case 'UPDATE':
            return `${user} a modifié un(e) ${resourceType}`;
        case 'DELETE':
            return `${user} a supprimé un(e) ${resourceType}`;
        case 'APPROVE':
            return `${user} a approuvé un(e) ${resourceType}`;
        case 'REJECT':
            return `${user} a rejeté un(e) ${resourceType}`;
        case 'VALIDATE':
            return `${user} a validé un(e) ${resourceType}`;
        case 'ASSIGN':
            return `${user} a assigné un(e) ${resourceType}`;
        case 'LOGIN':
            return `${user} s'est connecté`;
        case 'LOGOUT':
            return `${user} s'est déconnecté`;
        default:
            return `${user} a effectué une action sur ${resourceType}`;
    }
};

/**
 * Middleware pour capturer l'ancienne valeur avant UPDATE
 */
const captureOldValue = (Model) => {
    return async (req, res, next) => {
        try {
            const { id } = req.params;
            if (id && req.auditInfo) {
                const record = await Model.findByPk(id);
                if (record) {
                    req.auditInfo.oldValue = record.toJSON();
                }
            }
        } catch (error) {
            logger.error('Failed to capture old value:', error);
        }
        next();
    };
};

module.exports = {
    auditLog,
    captureOldValue,
    createAuditLog
};
