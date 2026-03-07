const validator = require('validator');
const logger = require('../utils/logger');

/**
 * Input Sanitization Middleware
 * Prevents XSS, SQL injection, and other malicious inputs
 */

/**
 * Sanitize string input
 * @param {String} input - Input string
 * @returns {String} - Sanitized string
 */
const sanitizeString = (input) => {
    if (typeof input !== 'string') return input;

    // Trim whitespace
    let sanitized = input.trim();

    // Escape HTML to prevent XSS
    sanitized = validator.escape(sanitized);

    return sanitized;
};

/**
 * Sanitize object recursively
 * @param {Object} obj - Object to sanitize
 * @returns {Object} - Sanitized object
 */
const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    if (typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            // Sanitize key
            const sanitizedKey = sanitizeString(key);

            // Recursively sanitize value
            if (typeof value === 'string') {
                sanitized[sanitizedKey] = sanitizeString(value);
            } else if (typeof value === 'object') {
                sanitized[sanitizedKey] = sanitizeObject(value);
            } else {
                sanitized[sanitizedKey] = value;
            }
        }
        return sanitized;
    }

    return obj;
};

/**
 * Middleware to sanitize request body
 */
const sanitizeBody = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    next();
};

/**
 * Middleware to sanitize query parameters
 */
const sanitizeQuery = (req, res, next) => {
    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query);
    }
    next();
};

/**
 * Middleware to sanitize URL parameters
 */
const sanitizeParams = (req, res, next) => {
    if (req.params && typeof req.params === 'object') {
        req.params = sanitizeObject(req.params);
    }
    next();
};

/**
 * Combined sanitization middleware
 * Sanitizes body, query, and params
 */
const sanitizeAll = (req, res, next) => {
    sanitizeBody(req, res, () => {
        sanitizeQuery(req, res, () => {
            sanitizeParams(req, res, next);
        });
    });
};

/**
 * Validate email format
 */
const validateEmail = (email) => {
    return validator.isEmail(email);
};

/**
 * Validate URL format
 */
const validateUrl = (url) => {
    return validator.isURL(url);
};

/**
 * Detect potentially malicious patterns
 * @param {String} input - Input to check
 * @returns {Boolean} - True if suspicious
 */
const detectMaliciousPattern = (input) => {
    if (typeof input !== 'string') return false;

    const maliciousPatterns = [
        /<script[^>]*>.*?<\/script>/gi, // Script tags
        /javascript:/gi, // JavaScript protocol
        /on\w+\s*=/gi, // Event handlers
        /\$\{.*\}/g, // Template literals
        /eval\(/gi, // Eval function
        /expression\(/gi, // CSS expressions
    ];

    return maliciousPatterns.some(pattern => pattern.test(input));
};

/**
 * Middleware to block requests with malicious patterns
 */
const blockMaliciousInput = (req, res, next) => {
    const checkObject = (obj, path = '') => {
        if (typeof obj === 'string') {
            if (detectMaliciousPattern(obj)) {
                logger.warn(`Malicious pattern detected in ${path}: ${obj.substring(0, 100)}`);
                return true;
            }
        } else if (typeof obj === 'object' && obj !== null) {
            for (const [key, value] of Object.entries(obj)) {
                if (checkObject(value, `${path}.${key}`)) {
                    return true;
                }
            }
        }
        return false;
    };

    if (checkObject(req.body, 'body') || checkObject(req.query, 'query')) {
        return res.status(400).json({
            success: false,
            message: 'Contenu suspect détecté dans la requête',
            timestamp: new Date().toISOString()
        });
    }

    next();
};

module.exports = {
    sanitizeBody,
    sanitizeQuery,
    sanitizeParams,
    sanitizeAll,
    sanitizeString,
    sanitizeObject,
    validateEmail,
    validateUrl,
    detectMaliciousPattern,
    blockMaliciousInput
};
