const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/authMiddleware');

// [Ajout] Routes pour le système d'avis
// Seuls les clients authentifiés peuvent poster un avis
router.post('/', authenticate, reviewController.createReview);

// Récupérer les avis d'un technicien (public ou authentifié)
router.get('/technician/:id', reviewController.getReviewsByTechnician);

// Récupérer l'avis lié à une maintenance spécifique
router.get('/maintenance/:id', reviewController.getReviewsByMaintenance);

// Récupérer les avis postés par le client connecté
router.get('/client', authenticate, reviewController.getReviewsByClient);

// Récupérer tous les avis (Admin seulement)
router.get('/', authenticate, reviewController.getAllReviews);

module.exports = router;
