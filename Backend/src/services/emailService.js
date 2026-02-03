const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Email Service using Nodemailer
 * Configured for mock SMTP in development, easily replaceable with real SMTP
 */
class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    /**
     * Initialize email transporter
     */
    initializeTransporter() {
        const emailConfig = {
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER || 'test@example.com',
                pass: process.env.SMTP_PASS || 'testpassword'
            }
        };

        // In development, use mock SMTP (logs to console)
        if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
            logger.info('📧 Email service running in MOCK mode (development)');
            this.transporter = nodemailer.createTransport({
                streamTransport: true,
                newline: 'unix',
                buffer: true
            });
        } else {
            this.transporter = nodemailer.createTransport(emailConfig);
            logger.info('📧 Email service initialized with SMTP configuration');
        }
    }

    /**
     * Send email
     * @param {String} to - Recipient email
     * @param {String} subject - Email subject
     * @param {String} html - HTML content
     * @param {String} text - Plain text content (optional)
     * @returns {Promise<Object>}
     */
    async sendEmail(to, subject, html, text = null) {
        try {
            const mailOptions = {
                from: process.env.SMTP_FROM || 'F-PRO CONSULTING <noreply@fpro-consulting.com>',
                to,
                subject,
                html,
                text: text || this.stripHtml(html)
            };

            const info = await this.transporter.sendMail(mailOptions);

            if (process.env.NODE_ENV === 'development') {
                logger.info(`📧 [MOCK] Email sent to ${to}: ${subject}`);
                logger.debug(`Email content: ${html.substring(0, 100)}...`);
            } else {
                logger.info(`📧 Email sent to ${to}: ${subject} (ID: ${info.messageId})`);
            }

            return {
                success: true,
                messageId: info.messageId,
                response: info.response
            };
        } catch (error) {
            logger.error(`❌ Email sending failed to ${to}:`, error);
            throw error;
        }
    }

    /**
     * Send bulk emails
     * @param {Array} recipients - Array of { to, subject, html }
     * @returns {Promise<Array>}
     */
    async sendBulkEmails(recipients) {
        const results = [];

        for (const recipient of recipients) {
            try {
                const result = await this.sendEmail(
                    recipient.to,
                    recipient.subject,
                    recipient.html,
                    recipient.text
                );
                results.push({ ...result, to: recipient.to });
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
     * Strip HTML tags for plain text version
     * @param {String} html - HTML content
     * @returns {String}
     */
    stripHtml(html) {
        return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }

    /**
     * Verify SMTP connection
     * @returns {Promise<Boolean>}
     */
    async verifyConnection() {
        try {
            if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
                logger.info('📧 Email service in MOCK mode - skipping verification');
                return true;
            }

            await this.transporter.verify();
            logger.info('✅ SMTP connection verified');
            return true;
        } catch (error) {
            logger.error('❌ SMTP connection failed:', error);
            return false;
        }
    }
}

module.exports = new EmailService();
