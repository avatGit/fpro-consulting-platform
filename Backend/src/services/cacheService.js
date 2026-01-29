const logger = require('../utils/logger');

/**
 * Cache Service (Mock Implementation)
 * Redis-style abstraction for caching
 * Easy to replace with real Redis client
 */
class CacheService {
    constructor() {
        // In-memory cache (mock)
        this.cache = new Map();
        this.ttls = new Map();

        if (process.env.REDIS_URL) {
            logger.info('🔴 Redis URL detected but using MOCK cache (replace with real Redis client)');
        } else {
            logger.info('💾 Cache service running in MOCK mode (in-memory)');
        }

        // Cleanup expired entries every minute
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }

    /**
     * Get value from cache
     * @param {String} key - Cache key
     * @returns {Promise<any>} - Cached value or null
     */
    async get(key) {
        try {
            // Check if key exists and not expired
            if (this.cache.has(key)) {
                const ttl = this.ttls.get(key);
                if (ttl && Date.now() > ttl) {
                    // Expired
                    this.cache.delete(key);
                    this.ttls.delete(key);
                    return null;
                }

                const value = this.cache.get(key);
                logger.debug(`Cache HIT: ${key}`);
                return value;
            }

            logger.debug(`Cache MISS: ${key}`);
            return null;
        } catch (error) {
            logger.error('Cache get error:', error);
            return null;
        }
    }

    /**
     * Set value in cache
     * @param {String} key - Cache key
     * @param {any} value - Value to cache
     * @param {Number} ttl - Time to live in seconds (optional)
     * @returns {Promise<Boolean>}
     */
    async set(key, value, ttl = null) {
        try {
            this.cache.set(key, value);

            if (ttl) {
                const expiresAt = Date.now() + (ttl * 1000);
                this.ttls.set(key, expiresAt);
            }

            logger.debug(`Cache SET: ${key}${ttl ? ` (TTL: ${ttl}s)` : ''}`);
            return true;
        } catch (error) {
            logger.error('Cache set error:', error);
            return false;
        }
    }

    /**
     * Delete key from cache
     * @param {String} key - Cache key
     * @returns {Promise<Boolean>}
     */
    async del(key) {
        try {
            const deleted = this.cache.delete(key);
            this.ttls.delete(key);

            if (deleted) {
                logger.debug(`Cache DEL: ${key}`);
            }

            return deleted;
        } catch (error) {
            logger.error('Cache delete error:', error);
            return false;
        }
    }

    /**
     * Check if key exists
     * @param {String} key - Cache key
     * @returns {Promise<Boolean>}
     */
    async exists(key) {
        try {
            const exists = this.cache.has(key);
            const ttl = this.ttls.get(key);

            if (exists && ttl && Date.now() > ttl) {
                // Expired
                this.cache.delete(key);
                this.ttls.delete(key);
                return false;
            }

            return exists;
        } catch (error) {
            logger.error('Cache exists error:', error);
            return false;
        }
    }

    /**
     * Flush all cache
     * @returns {Promise<Boolean>}
     */
    async flush() {
        try {
            this.cache.clear();
            this.ttls.clear();
            logger.info('Cache flushed');
            return true;
        } catch (error) {
            logger.error('Cache flush error:', error);
            return false;
        }
    }

    /**
     * Get cache statistics
     * @returns {Object}
     */
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
            mode: 'mock'
        };
    }

    /**
     * Cleanup expired entries
     */
    cleanup() {
        let cleaned = 0;
        const now = Date.now();

        for (const [key, expiresAt] of this.ttls.entries()) {
            if (now > expiresAt) {
                this.cache.delete(key);
                this.ttls.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            logger.debug(`Cache cleanup: removed ${cleaned} expired entries`);
        }
    }

    /**
     * Stop cleanup interval
     */
    stop() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            logger.info('Cache service stopped');
        }
    }

    /**
     * Helper: Cache wrapper for async functions
     * @param {String} key - Cache key
     * @param {Function} fn - Async function to execute if cache miss
     * @param {Number} ttl - TTL in seconds
     * @returns {Promise<any>}
     */
    async wrap(key, fn, ttl = 300) {
        // Try to get from cache
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }

        // Execute function
        const result = await fn();

        // Store in cache
        await this.set(key, result, ttl);

        return result;
    }
}

// Export singleton instance
module.exports = new CacheService();

/**
 * INTEGRATION GUIDE FOR REAL REDIS:
 * 
 * 1. Install redis client:
 *    npm install redis
 * 
 * 2. Replace constructor with:
 *    const redis = require('redis');
 *    this.client = redis.createClient({
 *      url: process.env.REDIS_URL || 'redis://localhost:6379'
 *    });
 *    await this.client.connect();
 * 
 * 3. Replace methods with Redis commands:
 *    - get(key) => this.client.get(key)
 *    - set(key, value, ttl) => this.client.setEx(key, ttl, JSON.stringify(value))
 *    - del(key) => this.client.del(key)
 *    - exists(key) => this.client.exists(key)
 *    - flush() => this.client.flushAll()
 */
