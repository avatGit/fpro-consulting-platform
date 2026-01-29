const logger = require('../utils/logger');

/**
 * SMS Service (Mock Implementation)
 * Twilio-style abstraction - easily replaceable with real Twilio/AWS SNS
 */
class SmsService {
    constructor() {
        this.provider = process.env.SMS_PROVIDER || 'mock';
        this.accountSid = process.env.SMS_ACCOUNT_SID;
        this.authToken = process.env.SMS_AUTH_TOKEN;
        this.fromNumber = process.env.SMS_FROM_NUMBER || '+1234567890';

        if (this.provider === 'mock' || process.env.NODE_ENV === 'development') {
            logger.info('📱 SMS service running in MOCK mode');
        } else {
            logger.info(`📱 SMS service initialized with provider: ${this.provider}`);
        }
    }

    /**
     * Send SMS
     * @param {String} to - Recipient phone number (E.164 format)
     * @param {String} message - SMS message content
     * @returns {Promise<Object>}
     */
    async sendSMS(to, message) {
        try {
            // Validate phone number format (basic)
            if (!to || !to.startsWith('+')) {
                throw new Error('Invalid phone number format. Use E.164 format (e.g., +33612345678)');
            }

            // Validate message length (160 chars for standard SMS)
            if (message.length > 160) {
                logger.warn(`⚠️ SMS message exceeds 160 characters (${message.length} chars)`);
            }

            // Mock implementation
            if (this.provider === 'mock' || process.env.NODE_ENV === 'development') {
                logger.info(`📱 [MOCK] SMS sent to ${to}`);
                logger.debug(`SMS content: ${message}`);

                return {
                    success: true,
                    sid: `MOCK_${Date.now()}`,
                    to,
                    from: this.fromNumber,
                    status: 'sent',
                    provider: 'mock'
                };
            }

            // Real Twilio implementation (placeholder)
            // Uncomment and configure when ready to use real Twilio
            /*
            const twilio = require('twilio');
            const client = twilio(this.accountSid, this.authToken);
            
            const result = await client.messages.create({
              body: message,
              from: this.fromNumber,
              to: to
            });
      
            logger.info(`📱 SMS sent to ${to} (SID: ${result.sid})`);
      
            return {
              success: true,
              sid: result.sid,
              to: result.to,
              from: result.from,
              status: result.status,
              provider: 'twilio'
            };
            */

            // For now, return mock response
            return {
                success: true,
                sid: `MOCK_${Date.now()}`,
                to,
                from: this.fromNumber,
                status: 'sent',
                provider: 'mock'
            };

        } catch (error) {
            logger.error(`❌ SMS sending failed to ${to}:`, error);
            throw error;
        }
    }

    /**
     * Send bulk SMS
     * @param {Array} recipients - Array of { to, message }
     * @returns {Promise<Array>}
     */
    async sendBulkSMS(recipients) {
        const results = [];

        for (const recipient of recipients) {
            try {
                const result = await this.sendSMS(recipient.to, recipient.message);
                results.push(result);
            } catch (error) {
                results.push({
                    success: false,
                    to: recipient.to,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Validate phone number format
     * @param {String} phoneNumber - Phone number to validate
     * @returns {Boolean}
     */
    validatePhoneNumber(phoneNumber) {
        // Basic E.164 validation
        const e164Regex = /^\+[1-9]\d{1,14}$/;
        return e164Regex.test(phoneNumber);
    }

    /**
     * Format phone number to E.164
     * @param {String} phoneNumber - Phone number
     * @param {String} countryCode - Country code (e.g., '33' for France)
     * @returns {String}
     */
    formatToE164(phoneNumber, countryCode = '33') {
        // Remove all non-digit characters
        let cleaned = phoneNumber.replace(/\D/g, '');

        // Remove leading zero if present
        if (cleaned.startsWith('0')) {
            cleaned = cleaned.substring(1);
        }

        // Add country code if not present
        if (!cleaned.startsWith(countryCode)) {
            cleaned = countryCode + cleaned;
        }

        return '+' + cleaned;
    }
}

module.exports = new SmsService();
