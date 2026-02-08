const { Invoice, Order, OrderItem, Product, Company, sequelize } = require('../models');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class InvoiceController {
    /**
     * POST /api/admin/invoices
     * Créer une facture à partir d'une commande
     */
    async createInvoice(req, res) {
        const transaction = await sequelize.transaction();

        try {
            const { orderId } = req.body;

            // Vérifier que la commande existe
            const order = await Order.findByPk(orderId, {
                include: [
                    { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
                    { model: Company, as: 'company' }
                ]
            });

            if (!order) {
                await transaction.rollback();
                return ResponseHandler.notFound(res, 'Commande non trouvée');
            }

            // Vérifier qu'il n'y a pas déjà une facture
            const existingInvoice = await Invoice.findOne({ where: { order_id: orderId } });
            if (existingInvoice) {
                await transaction.rollback();
                return ResponseHandler.error(res, 'Une facture existe déjà pour cette commande', 409);
            }

            // Générer le numéro de facture
            const year = new Date().getFullYear();
            const lastInvoice = await Invoice.findOne({
                where: {
                    invoice_number: { [Op.like]: `INV-${year}-%` }
                },
                order: [['created_at', 'DESC']]
            });

            let invoiceNumber;
            if (lastInvoice) {
                const lastNumber = parseInt(lastInvoice.invoice_number.split('-')[2]);
                invoiceNumber = `INV-${year}-${String(lastNumber + 1).padStart(6, '0')}`;
            } else {
                invoiceNumber = `INV-${year}-000001`;
            }

            // Calculer les montants
            const subtotal = parseFloat(order.total_amount) / 1.18; // Assuming 18% VAT
            const vatRate = 18.00;
            const vatAmount = subtotal * (vatRate / 100);
            const totalAmount = subtotal + vatAmount;

            // Créer la facture
            const invoice = await Invoice.create({
                invoice_number: invoiceNumber,
                order_id: orderId,
                company_id: order.company_id,
                subtotal: subtotal.toFixed(2),
                vat_rate: vatRate,
                vat_amount: vatAmount.toFixed(2),
                total_amount: totalAmount.toFixed(2),
                status: 'sent',
                issue_date: new Date(),
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                created_by: req.userId
            }, { transaction });

            await transaction.commit();

            return ResponseHandler.created(res, invoice, 'Facture créée avec succès');
        } catch (error) {
            await transaction.rollback();
            logger.error('Create invoice error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * GET /api/admin/invoices
     * Lister toutes les factures avec filtrage
     */
    async listInvoices(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                status,
                companyId,
                startDate,
                endDate
            } = req.query;

            const where = {};
            if (status) where.status = status;
            if (companyId) where.company_id = companyId;

            if (startDate || endDate) {
                where.issue_date = {};
                if (startDate) where.issue_date[Op.gte] = new Date(startDate);
                if (endDate) where.issue_date[Op.lte] = new Date(endDate);
            }

            const offset = (parseInt(page) - 1) * parseInt(limit);

            const { count, rows } = await Invoice.findAndCountAll({
                where,
                include: [
                    {
                        model: Order,
                        as: 'order',
                        attributes: ['id', 'order_number', 'status']
                    },
                    {
                        model: Company,
                        as: 'company',
                        attributes: ['id', 'name', 'email']
                    }
                ],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset
            });

            return ResponseHandler.success(res, {
                invoices: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / parseInt(limit))
                }
            }, 'Liste des factures récupérée');
        } catch (error) {
            logger.error('List invoices error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * GET /api/admin/invoices/:id
     * Obtenir les détails d'une facture
     */
    async getInvoice(req, res) {
        try {
            const { id } = req.params;

            const invoice = await Invoice.findByPk(id, {
                include: [
                    {
                        model: Order,
                        as: 'order',
                        include: [
                            { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
                        ]
                    },
                    {
                        model: Company,
                        as: 'company'
                    }
                ]
            });

            if (!invoice) {
                return ResponseHandler.notFound(res, 'Facture non trouvée');
            }

            return ResponseHandler.success(res, invoice, 'Détails de la facture récupérés');
        } catch (error) {
            logger.error('Get invoice error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * PATCH /api/admin/invoices/:id/status
     * Mettre à jour le statut d'une facture
     */
    async updateInvoiceStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, paymentMethod } = req.body;

            const invoice = await Invoice.findByPk(id);
            if (!invoice) {
                return ResponseHandler.notFound(res, 'Facture non trouvée');
            }

            const updateData = { status };

            // Si marquée comme payée, enregistrer la date et méthode
            if (status === 'paid') {
                updateData.paid_at = new Date();
                if (paymentMethod) updateData.payment_method = paymentMethod;
            }

            await invoice.update(updateData);

            return ResponseHandler.success(res, invoice, 'Statut de la facture mis à jour');
        } catch (error) {
            logger.error('Update invoice status error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * GET /api/admin/invoices/stats
     * Obtenir des statistiques sur les factures
     */
    async getInvoiceStats(req, res) {
        try {
            const [totalInvoices, paidInvoices, overdueInvoices, totalRevenue, pendingRevenue] = await Promise.all([
                Invoice.count(),
                Invoice.count({ where: { status: 'paid' } }),
                Invoice.count({
                    where: {
                        status: { [Op.ne]: 'paid' },
                        due_date: { [Op.lt]: new Date() }
                    }
                }),
                Invoice.sum('total_amount', { where: { status: 'paid' } }),
                Invoice.sum('total_amount', { where: { status: { [Op.ne]: 'paid' } } })
            ]);

            return ResponseHandler.success(res, {
                totalInvoices,
                paidInvoices,
                overdueInvoices,
                totalRevenue: parseFloat(totalRevenue || 0),
                pendingRevenue: parseFloat(pendingRevenue || 0)
            }, 'Statistiques des factures récupérées');
        } catch (error) {
            logger.error('Get invoice stats error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }
}

module.exports = new InvoiceController();
