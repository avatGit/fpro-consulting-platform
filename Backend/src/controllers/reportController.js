const { Parser } = require('json2csv');
const { Order, User, MaintenanceRequest, Payment } = require('../models');
const ResponseHandler = require('../utils/responseHandler');

class ReportController {
    // Export Orders to CSV
    async exportOrders(req, res) {
        try {
            const orders = await Order.findAll({
                include: [
                    { model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] }
                ],
                order: [['created_at', 'DESC']]
            });

            if (!orders || orders.length === 0) {
                return ResponseHandler.error(res, "Aucune commande trouvée pour l'export", 404);
            }

            const fields = [
                { label: 'Référence', value: 'order_number' },
                { label: 'Client', value: row => `${row.user?.first_name || ''} ${row.user?.last_name || ''}` },
                { label: 'Email', value: 'user.email' },
                { label: 'Montant Total', value: 'total_amount' },
                { label: 'Statut', value: 'status' },
                { label: 'Date', value: row => new Date(row.created_at).toLocaleDateString() }
            ];

            const json2csvParser = new Parser({ fields, delimiter: ';' }); // Excel friendly delimiter
            const csv = json2csvParser.parse(orders);

            res.header('Content-Type', 'text/csv');
            res.header('Content-Disposition', 'attachment; filename="commandes_export.csv"');
            return res.send(csv);

        } catch (error) {
            console.error('Export Orders Error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    // Export Maintenance Requests to CSV
    async exportMaintenance(req, res) {
        try {
            const requests = await MaintenanceRequest.findAll({
                include: [
                    { model: User, as: 'user', attributes: ['first_name', 'last_name'] }
                ],
                order: [['created_at', 'DESC']]
            });

            if (!requests || requests.length === 0) {
                return ResponseHandler.error(res, "Aucune demande trouvée pour l'export", 404);
            }

            const fields = [
                { label: 'ID', value: 'id' },
                { label: 'Client', value: row => `${row.user?.first_name || ''} ${row.user?.last_name || ''}` },
                { label: 'Type', value: 'type' },
                { label: 'Priorité', value: 'priority' },
                { label: 'Statut', value: 'status' },
                { label: 'Description', value: 'description' },
                { label: 'Date', value: row => new Date(row.created_at).toLocaleDateString() }
            ];

            const json2csvParser = new Parser({ fields, delimiter: ';' });
            const csv = json2csvParser.parse(requests);

            res.header('Content-Type', 'text/csv');
            res.header('Content-Disposition', 'attachment; filename="maintenance_export.csv"');
            return res.send(csv);

        } catch (error) {
            console.error('Export Maintenance Error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }
}

module.exports = new ReportController();
