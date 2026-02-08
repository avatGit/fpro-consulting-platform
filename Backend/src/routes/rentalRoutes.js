const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validate } = require('../validators/authValidators');
const { createBookingSchema } = require('../validators/maintenanceValidators');

router.use(authenticate);

/**
 * @swagger
 * /api/rentals:
 *   post:
 *     summary: Créer une réservation de location
 *     tags: [Rentals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, startDate, endDate, quantity]
 *                   properties:
 *                     productId: { type: string, format: uuid }
 *                     startDate: { type: string, format: date }
 *                     endDate: { type: string, format: date }
 *                     quantity: { type: integer, minimum: 1 }
 *     responses:
 *       201:
 *         description: Réservation créée
 */
router.post('/', validate(createBookingSchema), rentalController.createBooking);

/**
 * @swagger
 * /api/rentals/availability:
 *   get:
 *     summary: Vérifier la disponibilité d'un produit
 *     tags: [Rentals]
 *     parameters:
 *       - in: query
 *         name: productId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Disponibilité confirmée
 */
router.get('/availability', rentalController.checkAvailability);

router.post('/:id/confirm', rentalController.confirmBooking);

// Routes Admin & Agent
router.get('/all', authorize('admin', 'agent'), rentalController.listAllRentals);
router.patch('/:id/status', authorize('admin', 'agent'), rentalController.updateRentalStatus);

module.exports = router;
