const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Rate Limiting Middleware
 * Protects API from abuse and DDoS attacks
 */

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer plus tard.',
        retryAfter: '5 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
        res.status(429).json({
            success: false,
            message: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer plus tard.',
            retryAfter: '5 minutes',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 5 minutes per IP
 */
const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 7, // Limit each IP to 7 login requests per windowMs
    skipSuccessfulRequests: false,
    message: {
        success: false,
        message: 'Trop de tentatives de connexion. Veuillez réessayer dans 5 minutes.',
        retryAfter: '5 minutes'
    },
    handler: (req, res) => {
        logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Trop de tentatives de connexion. Veuillez réessayer dans 5 minutes.',
            retryAfter: '5 minutes',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Moderate rate limiter for resource creation
 * 20 requests per 5 minutes per IP
 */
const createLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        message: 'Trop de créations de ressources. Veuillez ralentir.',
        retryAfter: '5 minutes'
    },
    handler: (req, res) => {
        logger.warn(`Create rate limit exceeded for IP: ${req.ip} on ${req.path}`);
        res.status(429).json({
            success: false,
            message: 'Trop de créations de ressources. Veuillez ralentir.',
            retryAfter: '5 minutes',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Lenient rate limiter for read operations
 * 200 requests per 5 minutes per IP
 */
const readLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 200,
    message: {
        success: false,
        message: 'Trop de requêtes de lecture. Veuillez ralentir.',
        retryAfter: '5 minutes'
    }
});

module.exports = {
    apiLimiter,
    authLimiter,
    createLimiter,
    readLimiter
};
