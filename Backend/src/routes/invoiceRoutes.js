const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { auditLog } = require('../middleware/auditMiddleware');

// Toutes les routes nécessitent d'être admin
router.use(authenticate);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/admin/invoices:
 *   post:
 *     summary: Créer une facture à partir d'une commande
 *     tags: [Invoices]
 */
router.post('/', auditLog('CREATE', 'Invoice'), invoiceController.createInvoice);

/**
 * @swagger
 * /api/admin/invoices:
 *   get:
 *     summary: Lister toutes les factures avec filtrage
 *     tags: [Invoices]
 */
router.get('/', invoiceController.listInvoices);

/**
 * @swagger
 * /api/admin/invoices/stats:
 *   get:
 *     summary: Obtenir des statistiques sur les factures
 *     tags: [Invoices]
 */
router.get('/stats', invoiceController.getInvoiceStats);

/**
 * @swagger
 * /api/admin/invoices/{id}:
 *   get:
 *     summary: Obtenir les détails d'une facture
 *     tags: [Invoices]
 */
router.get('/:id', invoiceController.getInvoice);

/**
 * @swagger
 * /api/admin/invoices/{id}/status:
 *   patch:
 *     summary: Mettre à jour le statut d'une facture
 *     tags: [Invoices]
 */
router.patch('/:id/status', auditLog('UPDATE', 'Invoice'), invoiceController.updateInvoiceStatus);

module.exports = router;
