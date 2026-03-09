const logger = require('../utils/logger');
const { MaintenanceRequest, Technician, Intervention, User, Company } = require('../models');
const { Op } = require('sequelize');

/**
 * AI Service
 * Provides intelligent suggestions for technician assignment and priority scoring
 * NOTE: This is a rule-based "AI" system, not machine learning
 * Suggestions are advisory only - final decision remains with human agents
 */
class AiService {
    /**
     * Suggest best technician for a maintenance request
     * @param {Number} maintenanceRequestId - Maintenance request ID
     * @returns {Promise<Array>} - Ranked list of technicians with scores
     */
    async suggestTechnicians(maintenanceRequestId) {
        try {
            // Get maintenance request details
            const maintenanceRequest = await MaintenanceRequest.findByPk(maintenanceRequestId, {
                include: [
                    {
                        model: User,
                        as: 'user'
                    },
                    {
                        model: Company,
                        as: 'company'
                    }
                ]
            });

            if (!maintenanceRequest) {
                throw new Error('Maintenance request not found');
            }

            // Get all available technicians
            const technicians = await Technician.findAll({
                where: {
                    is_available: true
                },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'first_name', 'last_name', 'email']
                    },
                    {
                        model: Intervention,
                        as: 'interventions',
                        required: false,
                        where: {
                            status: {
                                [Op.in]: ['scheduled', 'in_progress']
                            }
                        }
                    }
                ]
            });

            if (technicians.length === 0) {
                logger.warn('No available technicians found');
                return [];
            }

            // Score each technician
            const scoredTechnicians = await Promise.all(
                technicians.map(async (technician) => {
                    const score = await this.calculateTechnicianScore(
                        technician,
                        maintenanceRequest
                    );
                    return {
                        technician_id: technician.id,
                        user_id: technician.user_id,
                        name: `${technician.user.first_name} ${technician.user.last_name}`,
                        email: technician.user.email,
                        specialization: technician.specialization,
                        score: score.total,
                        breakdown: score.breakdown,
                        recommendation: this.getRecommendationLevel(score.total)
                    };
                })
            );

            // Sort by score (highest first)
            scoredTechnicians.sort((a, b) => b.score - a.score);

            logger.info(`✅ Generated ${scoredTechnicians.length} technician suggestions for maintenance #${maintenanceRequestId}`);

            return scoredTechnicians;
        } catch (error) {
            logger.error('❌ Error generating technician suggestions:', error);
            throw error;
        }
    }

    /**
     * Calculate technician score for a maintenance request
     * @param {Object} technician - technician record
     * @param {Object} maintenanceRequest - Maintenance request
     * @returns {Promise<Object>} - Score with breakdown
     */
    async calculateTechnicianScore(technician, maintenanceRequest) {
        const breakdown = {};
        let total = 0;

        // 1. Skill Match (0-40 points)
        const skillScore = this.calculateSkillMatch(
            technician.specialization,
            maintenanceRequest.type
        );
        breakdown.skill_match = skillScore;
        total += skillScore;

        // 2. Workload (0-30 points) - fewer active interventions = higher score
        const workloadScore = this.calculateWorkloadScore(technician.interventions || []);
        breakdown.workload = workloadScore;
        total += workloadScore;

        // 3. Availability (0-20 points)
        const availabilityScore = technician.is_available ? 20 : 0;
        breakdown.availability = availabilityScore;
        total += availabilityScore;

        // 4. Experience (0-10 points) - based on years of experience
        const experienceScore = Math.min(technician.years_of_experience || 0, 10);
        breakdown.experience = experienceScore;
        total += experienceScore;

        return { total, breakdown };
    }

    /**
     * Calculate skill match score
     * @param {String} technicianSpecialization - technician specialization
     * @param {String} maintenanceType - Maintenance type
     * @returns {Number} - Score (0-40)
     */
    calculateSkillMatch(technicianSpecialization, maintenanceType) {
        if (!technicianSpecialization || !maintenanceType) return 0;

        const spec = technicianSpecialization.toLowerCase();
        const type = maintenanceType.toLowerCase();

        // Perfect match
        if (spec === type) return 40;

        // Partial matches
        const partialMatches = {
            'hardware': ['equipment', 'installation', 'repair'],
            'software': ['configuration', 'update', 'troubleshooting'],
            'network': ['connectivity', 'infrastructure'],
            'general': ['maintenance', 'inspection']
        };

        for (const [key, keywords] of Object.entries(partialMatches)) {
            if (spec.includes(key) && keywords.some(kw => type.includes(kw))) {
                return 25;
            }
        }

        // Generic match
        return 10;
    }

    /**
     * Calculate workload score
     * @param {Array} activeInterventions - Active interventions
     * @returns {Number} - Score (0-30)
     */
    calculateWorkloadScore(activeInterventions) {
        const count = activeInterventions.length;

        // Fewer interventions = higher score
        if (count === 0) return 30;
        if (count === 1) return 20;
        if (count === 2) return 10;
        if (count === 3) return 5;
        return 0; // 4+ interventions
    }

    /**
     * Get recommendation level based on score
     * @param {Number} score - Total score
     * @returns {String} - Recommendation level
     */
    getRecommendationLevel(score) {
        if (score >= 70) return 'highly_recommended';
        if (score >= 50) return 'recommended';
        if (score >= 30) return 'suitable';
        return 'not_recommended';
    }

    /**
     * Calculate priority score for a maintenance request
     * @param {Object} maintenanceRequest - Maintenance request
     * @returns {Promise<Object>} - Priority score with breakdown
     */
    async calculatePriority(maintenanceRequest) {
        const breakdown = {};
        let total = 0;

        // 1. Urgency level (0-40 points)
        const urgencyScores = {
            'haute': 40,
            'moyenne': 30,
            'faible': 10
        };
        const urgencyScore = urgencyScores[maintenanceRequest.priority] || 15;
        breakdown.urgency = urgencyScore;
        total += urgencyScore;

        // 2. VIP Client (0-25 points)
        const company = await Company.findByPk(maintenanceRequest.company_id);
        const vipScore = company?.is_vip ? 25 : 0;
        breakdown.vip_client = vipScore;
        total += vipScore;

        // 3. Request Age (0-20 points) - older requests get higher priority
        const ageInDays = this.getRequestAgeInDays(maintenanceRequest.created_at);
        const ageScore = Math.min(ageInDays * 2, 20);
        breakdown.request_age = ageScore;
        total += ageScore;

        // 4. Type criticality (0-15 points)
        const criticalTypes = ['urgence', 'critique', 'securite'];
        const typeScore = criticalTypes.some(t =>
            maintenanceRequest.type?.toLowerCase().includes(t)
        ) ? 15 : 5;
        breakdown.type_criticality = typeScore;
        total += typeScore;

        return {
            total,
            breakdown,
            level: this.getPriorityLevel(total)
        };
    }

    /**
     * Get request age in days
     * @param {Date} createdAt - Creation date
     * @returns {Number} - Age in days
     */
    getRequestAgeInDays(createdAt) {
        const now = new Date();
        const created = new Date(createdAt);
        const diffTime = Math.abs(now - created);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    /**
     * Get priority level based on score
     * @param {Number} score - Total priority score
     * @returns {String} - Priority level
     */
    getPriorityLevel(score) {
        if (score >= 70) return 'haute';
        if (score >= 50) return 'moyenne';
        return 'faible';
    }

    /**
     * Get workload distribution across all technicians
     * @returns {Promise<Array>} - technician workload stats
     */
    async getWorkloadDistribution() {
        try {
            const technicians = await Technician.findAll({
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'first_name', 'last_name']
                    },
                    {
                        model: Intervention,
                        as: 'interventions',
                        required: false,
                        where: {
                            status: {
                                [Op.in]: ['pending', 'in_progress']
                            }
                        }
                    }
                ]
            });

            const distribution = technicians.map(tech => ({
                technician_id: tech.id,
                name: `${tech.user.first_name} ${tech.user.last_name}`,
                is_available: tech.is_available,
                active_interventions: tech.interventions?.length || 0,
                specialization: tech.specialization,
                workload_level: this.getWorkloadLevel(tech.interventions?.length || 0)
            }));

            return distribution;
        } catch (error) {
            logger.error('❌ Error getting workload distribution:', error);
            throw error;
        }
    }

    /**
     * Get workload level
     * @param {Number} count - Number of active interventions
     * @returns {String} - Workload level
     */
    getWorkloadLevel(count) {
        if (count === 0) return 'available';
        if (count <= 2) return 'light';
        if (count <= 4) return 'moderate';
        return 'heavy';
    }
}

module.exports = new AiService();
