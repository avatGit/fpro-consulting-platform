const logger = require('../utils/logger');

/**
 * Audit Log Middleware
 * Logs sensitive operations for security and compliance
 */

/**
 * Audit log entry structure:
 * - timestamp
 * - user_id
 * - action (CREATE, UPDATE, DELETE, READ)
 * - resource (model/table name)
 * - resource_id
 * - ip_address
 * - user_agent
 * - changes (for UPDATE operations)
 */

/**
 * Log audit event
 * @param {Object} auditData - Audit data
 */
const logAudit = (auditData) => {
    const {
        userId,
        action,
        resource,
        resourceId,
        ipAddress,
        userAgent,
        changes = null,
        status = 'success'
    } = auditData;

    const auditEntry = {
        timestamp: new Date().toISOString(),
        user_id: userId,
        action,
        resource,
        resource_id: resourceId,
        ip_address: ipAddress,
        user_agent: userAgent,
        changes,
        status
    };

    // Log to Winston (could also save to database)
    logger.info(`[AUDIT] ${action} ${resource}${resourceId ? ` #${resourceId}` : ''} by user ${userId}`, auditEntry);

    // TODO: Optionally save to AuditLog model in database
    // await AuditLog.create(auditEntry);
};

/**
 * Middleware to audit CREATE operations
 */
const auditCreate = (resourceName) => {
    return (req, res, next) => {
        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to capture response
        res.json = function (data) {
            // Only log successful creations (status 201)
            if (res.statusCode === 201 && data.success) {
                logAudit({
                    userId: req.userId || 'anonymous',
                    action: 'CREATE',
                    resource: resourceName,
                    resourceId: data.data?.id || null,
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('user-agent'),
                    status: 'success'
                });
            }

            // Call original json method
            return originalJson(data);
        };

        next();
    };
};

/**
 * Middleware to audit UPDATE operations
 */
const auditUpdate = (resourceName) => {
    return (req, res, next) => {
        const originalJson = res.json.bind(res);

        res.json = function (data) {
            if (res.statusCode === 200 && data.success) {
                logAudit({
                    userId: req.userId || 'anonymous',
                    action: 'UPDATE',
                    resource: resourceName,
                    resourceId: req.params.id || data.data?.id,
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('user-agent'),
                    changes: req.body, // Log what was changed
                    status: 'success'
                });
            }

            return originalJson(data);
        };

        next();
    };
};

/**
 * Middleware to audit DELETE operations
 */
const auditDelete = (resourceName) => {
    return (req, res, next) => {
        const originalJson = res.json.bind(res);

        res.json = function (data) {
            if (res.statusCode === 200 && data.success) {
                logAudit({
                    userId: req.userId || 'anonymous',
                    action: 'DELETE',
                    resource: resourceName,
                    resourceId: req.params.id,
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('user-agent'),
                    status: 'success'
                });
            }

            return originalJson(data);
        };

        next();
    };
};

/**
 * Middleware to audit sensitive READ operations
 * (e.g., accessing user data, financial records)
 */
const auditRead = (resourceName) => {
    return (req, res, next) => {
        const originalJson = res.json.bind(res);

        res.json = function (data) {
            if (res.statusCode === 200 && data.success) {
                logAudit({
                    userId: req.userId || 'anonymous',
                    action: 'READ',
                    resource: resourceName,
                    resourceId: req.params.id || null,
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('user-agent'),
                    status: 'success'
                });
            }

            return originalJson(data);
        };

        next();
    };
};

/**
 * Generic audit middleware
 * Automatically detects operation type based on HTTP method
 */
const audit = (resourceName) => {
    return (req, res, next) => {
        const method = req.method.toUpperCase();

        let auditMiddleware;
        switch (method) {
            case 'POST':
                auditMiddleware = auditCreate(resourceName);
                break;
            case 'PUT':
            case 'PATCH':
                auditMiddleware = auditUpdate(resourceName);
                break;
            case 'DELETE':
                auditMiddleware = auditDelete(resourceName);
                break;
            case 'GET':
                // Only audit sensitive GET operations
                if (req.params.id) {
                    auditMiddleware = auditRead(resourceName);
                } else {
                    return next(); // Skip audit for list operations
                }
                break;
            default:
                return next();
        }

        return auditMiddleware(req, res, next);
    };
};

module.exports = {
    audit,
    auditCreate,
    auditUpdate,
    auditDelete,
    auditRead,
    logAudit
};
