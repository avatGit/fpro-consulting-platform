const cron = require('node-cron');
const logger = require('../utils/logger');
const notificationService = require('./notificationService');
const { MaintenanceRequest, Rental, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Cron Service
 * Manages scheduled jobs for automated notifications and tasks
 */
class CronService {
    constructor() {
        this.jobs = [];
    }

    /**
     * Initialize all cron jobs
     */
    initializeCronJobs() {
        logger.info('🕐 Initializing cron jobs...');

        // Start maintenance reminders (daily at 9 AM)
        this.startMaintenanceReminders();

        // Start rental return reminders (daily at 10 AM)
        this.startRentalReturnReminders();

        logger.info(`✅ ${this.jobs.length} cron job(s) initialized`);
    }

    /**
     * Maintenance reminder job
     * Runs daily at 9:00 AM
     * Sends reminders for upcoming maintenance (next 24-48 hours)
     */
    startMaintenanceReminders() {
        // Cron: Every day at 9:00 AM
        // Format: second minute hour day month weekday
        const schedule = '0 9 * * *';

        const job = cron.schedule(schedule, async () => {
            try {
                logger.info('🔧 Running maintenance reminder job...');

                // Find maintenance requests scheduled in next 24-48 hours
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);

                const dayAfterTomorrow = new Date(tomorrow);
                dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

                const upcomingMaintenance = await MaintenanceRequest.findAll({
                    where: {
                        status: 'scheduled',
                        scheduled_date: {
                            [Op.between]: [tomorrow, dayAfterTomorrow]
                        }
                    },
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'email', 'first_name', 'last_name']
                        }
                    ]
                });

                logger.info(`Found ${upcomingMaintenance.length} upcoming maintenance request(s)`);

                // Send reminders
                for (const maintenance of upcomingMaintenance) {
                    try {
                        await notificationService.sendNotification(
                            maintenance.user_id,
                            'maintenance_reminder',
                            'email',
                            {
                                email: maintenance.user.email,
                                client_name: `${maintenance.user.first_name} ${maintenance.user.last_name}`,
                                request_id: maintenance.id,
                                scheduled_date: maintenance.scheduled_date,
                                message: `Rappel: Votre maintenance #${maintenance.id} est prévue le ${new Date(maintenance.scheduled_date).toLocaleDateString('fr-FR')}`,
                                subject: `Rappel de maintenance #${maintenance.id}`
                            }
                        );

                        logger.info(`✅ Reminder sent for maintenance #${maintenance.id}`);
                    } catch (error) {
                        logger.error(`❌ Failed to send reminder for maintenance #${maintenance.id}:`, error);
                    }
                }

                logger.info('✅ Maintenance reminder job completed');
            } catch (error) {
                logger.error('❌ Maintenance reminder job failed:', error);
            }
        });

        this.jobs.push({ name: 'maintenanceReminders', schedule, job });
        logger.info(`📅 Scheduled: Maintenance reminders (${schedule})`);
    }

    /**
     * Rental return reminder job
     * Runs daily at 10:00 AM
     * Sends reminders for rentals ending in next 24-48 hours
     */
    startRentalReturnReminders() {
        // Cron: Every day at 10:00 AM
        const schedule = '0 10 * * *';

        const job = cron.schedule(schedule, async () => {
            try {
                logger.info('📦 Running rental return reminder job...');

                // Find rentals ending in next 24-48 hours
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);

                const dayAfterTomorrow = new Date(tomorrow);
                dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

                const upcomingReturns = await Rental.findAll({
                    where: {
                        status: 'active',
                        end_date: {
                            [Op.between]: [tomorrow, dayAfterTomorrow]
                        }
                    },
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'email', 'first_name', 'last_name']
                        }
                    ]
                });

                logger.info(`Found ${upcomingReturns.length} upcoming rental return(s)`);

                // Send reminders
                for (const rental of upcomingReturns) {
                    try {
                        await notificationService.sendNotification(
                            rental.user_id,
                            'rental_return_reminder',
                            'email',
                            {
                                email: rental.user.email,
                                client_name: `${rental.user.first_name} ${rental.user.last_name}`,
                                rental_id: rental.id,
                                end_date: rental.end_date,
                                message: `Rappel: Votre location #${rental.id} se termine le ${new Date(rental.end_date).toLocaleDateString('fr-FR')}. Merci de prévoir le retour.`,
                                subject: `Rappel de retour de location #${rental.id}`
                            }
                        );

                        logger.info(`✅ Return reminder sent for rental #${rental.id}`);
                    } catch (error) {
                        logger.error(`❌ Failed to send reminder for rental #${rental.id}:`, error);
                    }
                }

                logger.info('✅ Rental return reminder job completed');
            } catch (error) {
                logger.error('❌ Rental return reminder job failed:', error);
            }
        });

        this.jobs.push({ name: 'rentalReturnReminders', schedule, job });
        logger.info(`📅 Scheduled: Rental return reminders (${schedule})`);
    }

    /**
     * Stop all cron jobs
     */
    stopAllJobs() {
        logger.info('🛑 Stopping all cron jobs...');
        this.jobs.forEach(({ name, job }) => {
            job.stop();
            logger.info(`Stopped: ${name}`);
        });
        this.jobs = [];
    }

    /**
     * Get status of all jobs
     * @returns {Array}
     */
    getJobsStatus() {
        return this.jobs.map(({ name, schedule }) => ({
            name,
            schedule,
            running: true
        }));
    }
}

module.exports = new CronService();
