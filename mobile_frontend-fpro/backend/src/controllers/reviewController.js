const { Review, MaintenanceRequest, User, Technician } = require('../models');
const { sequelize } = require('../config/database');

// [Ajout] Contrôleur pour gérer les avis clients
const createReview = async (req, res) => {
    const { maintenance_id, rating, comment } = req.body;
    const client_id = req.user.id;

    try {
        // 1. Vérifier si la maintenance existe
        const maintenance = await MaintenanceRequest.findByPk(maintenance_id);
        if (!maintenance) {
            return res.status(404).json({ message: 'Maintenance non trouvée' });
        }

        // 2. Vérifier si le statut est "closed"
        if (maintenance.status !== 'closed') {
            return res.status(400).json({ message: 'La maintenance doit être clôturée pour laisser un avis' });
        }

        // 3. Vérifier si le client est le propriétaire de la maintenance
        if (maintenance.user_id !== client_id) {
            return res.status(403).json({ message: 'Seul le client propriétaire peut laisser un avis' });
        }

        // 4. Vérifier si un avis existe déjà
        const existingReview = await Review.findOne({ where: { maintenance_id } });
        if (existingReview) {
            return res.status(400).json({ message: 'Un avis a déjà été laissé pour cette maintenance' });
        }

        // 5. Récupérer le technician_id s'il est null (cas des anciennes demandes)
        let technicianId = maintenance.technician_id || req.body.technician_id;

        if (!technicianId) {
            // [Ajout] Fallback : chercher via les interventions
            const { Intervention, Technician } = require('../models');
            const latestIntervention = await Intervention.findOne({
                where: { request_id: maintenance_id },
                include: [{ model: Technician, as: 'technician' }],
                order: [['created_at', 'DESC']]
            });

            if (latestIntervention && latestIntervention.technician) {
                technicianId = latestIntervention.technician.user_id;
            }
        }

        if (!technicianId) {
            return res.status(400).json({ message: 'Impossible de trouver le technicien associé à cette maintenance' });
        }

        // 6. Créer l'avis
        const review = await Review.create({
            maintenance_id,
            client_id,
            technician_id: technicianId,
            rating,
            comment
        });

        res.status(201).json(review);
    } catch (error) {
        console.error('Erreur lors de la création de l\'avis:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la création de l\'avis' });
    }
};

const getReviewsByTechnician = async (req, res) => {
    const { id } = req.params;

    try {
        const reviews = await Review.findAll({
            where: { technician_id: id },
            include: [
                { model: User, as: 'client', attributes: ['first_name', 'last_name'] }
            ],
            order: [['created_at', 'DESC']]
        });

        // Calculer la moyenne
        const stats = await Review.findOne({
            where: { technician_id: id },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'reviewCount']
            ],
            raw: true
        });

        res.json({
            reviews,
            averageRating: parseFloat(stats.averageRating || 0).toFixed(1),
            reviewCount: parseInt(stats.reviewCount || 0)
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des avis du technicien:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const getReviewsByMaintenance = async (req, res) => {
    const { id } = req.params;

    try {
        const review = await Review.findOne({
            where: { maintenance_id: id },
            include: [
                { model: User, as: 'client', attributes: ['first_name', 'last_name'] },
                { model: User, as: 'technician', attributes: ['first_name', 'last_name'] }
            ]
        });

        if (!review) {
            return res.status(404).json({ message: 'Aucun avis trouvé pour cette maintenance' });
        }

        res.json(review);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'avis de maintenance:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [
                { model: User, as: 'client', attributes: ['first_name', 'last_name'] },
                { model: User, as: 'technician', attributes: ['first_name', 'last_name'] },
                { model: MaintenanceRequest, as: 'maintenance', attributes: ['description', 'created_at'] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json(reviews);
    } catch (error) {
        console.error('Erreur lors de la récupération de tous les avis:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const getReviewsByClient = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { client_id: req.user.id },
            include: [
                { model: User, as: 'technician', attributes: ['first_name', 'last_name'] },
                { model: MaintenanceRequest, as: 'maintenance', attributes: ['description', 'created_at'] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json(reviews);
    } catch (error) {
        console.error('Erreur lors de la récupération des avis du client:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = {
    createReview,
    getReviewsByTechnician,
    getReviewsByMaintenance,
    getAllReviews,
    getReviewsByClient
};
