const { SystemSetting } = require('../models');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

class SettingsController {
    /**
     * GET /api/admin/settings
     * Obtenir tous les paramètres ou par catégorie
     */
    async getSettings(req, res) {
        try {
            const { category } = req.query;

            const where = {};
            if (category) where.category = category;

            const settings = await SystemSetting.findAll({
                where,
                order: [['category', 'ASC'], ['key', 'ASC']]
            });

            // Convertir les valeurs selon leur type
            const formattedSettings = settings.map(setting => ({
                ...setting.toJSON(),
                value: setting.getTypedValue()
            }));

            return ResponseHandler.success(res, formattedSettings, 'Paramètres récupérés');
        } catch (error) {
            logger.error('Get settings error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * GET /api/admin/settings/:key
     * Obtenir un paramètre spécifique
     */
    async getSetting(req, res) {
        try {
            const { key } = req.params;

            const setting = await SystemSetting.findOne({ where: { key } });

            if (!setting) {
                return ResponseHandler.notFound(res, 'Paramètre non trouvé');
            }

            return ResponseHandler.success(res, {
                ...setting.toJSON(),
                value: setting.getTypedValue()
            }, 'Paramètre récupéré');
        } catch (error) {
            logger.error('Get setting error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * PUT /api/admin/settings/:key
     * Mettre à jour un paramètre
     */
    async updateSetting(req, res) {
        try {
            const { key } = req.params;
            const { value } = req.body;

            let setting = await SystemSetting.findOne({ where: { key } });

            if (!setting) {
                return ResponseHandler.notFound(res, 'Paramètre non trouvé');
            }

            // Convertir la valeur en string selon le type
            let stringValue = value;
            if (setting.type === 'json') {
                stringValue = JSON.stringify(value);
            } else if (setting.type === 'boolean') {
                stringValue = value ? 'true' : 'false';
            } else {
                stringValue = String(value);
            }

            await setting.update({ value: stringValue });

            return ResponseHandler.success(res, {
                ...setting.toJSON(),
                value: setting.getTypedValue()
            }, 'Paramètre mis à jour');
        } catch (error) {
            logger.error('Update setting error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * POST /api/admin/settings
     * Créer un nouveau paramètre
     */
    async createSetting(req, res) {
        try {
            const { key, value, type = 'string', category, description, is_public = false } = req.body;

            // Vérifier si le paramètre existe déjà
            const existing = await SystemSetting.findOne({ where: { key } });
            if (existing) {
                return ResponseHandler.error(res, 'Ce paramètre existe déjà', 409);
            }

            // Convertir la valeur en string
            let stringValue = value;
            if (type === 'json') {
                stringValue = JSON.stringify(value);
            } else if (type === 'boolean') {
                stringValue = value ? 'true' : 'false';
            } else {
                stringValue = String(value);
            }

            const setting = await SystemSetting.create({
                key,
                value: stringValue,
                type,
                category,
                description,
                is_public
            });

            return ResponseHandler.created(res, {
                ...setting.toJSON(),
                value: setting.getTypedValue()
            }, 'Paramètre créé');
        } catch (error) {
            logger.error('Create setting error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * POST /api/admin/settings/init-defaults
     * Initialiser les paramètres par défaut
     */
    async initDefaultSettings(req, res) {
        try {
            const defaultSettings = [
                { key: 'vat_rate', value: '18.00', type: 'number', category: 'billing', description: 'Taux de TVA par défaut (%)' },
                { key: 'company_name', value: 'F-PRO CONSULTING', type: 'string', category: 'general', description: 'Nom de l\'entreprise' },
                { key: 'company_email', value: 'contact@fpro-consulting.com', type: 'string', category: 'general', description: 'Email de contact' },
                { key: 'company_phone', value: '+226 XX XX XX XX', type: 'string', category: 'general', description: 'Téléphone de contact' },
                { key: 'invoice_due_days', value: '30', type: 'number', category: 'billing', description: 'Délai de paiement des factures (jours)' },
                { key: 'low_stock_threshold', value: '5', type: 'number', category: 'inventory', description: 'Seuil d\'alerte stock bas' },
                { key: 'maintenance_auto_assign', value: 'false', type: 'boolean', category: 'maintenance', description: 'Assignation automatique des techniciens' },
                { key: 'email_notifications', value: 'true', type: 'boolean', category: 'notifications', description: 'Activer les notifications email', is_public: true }
            ];

            const created = [];
            for (const setting of defaultSettings) {
                const existing = await SystemSetting.findOne({ where: { key: setting.key } });
                if (!existing) {
                    const newSetting = await SystemSetting.create(setting);
                    created.push(newSetting);
                }
            }

            return ResponseHandler.success(res, created, `${created.length} paramètres par défaut initialisés`);
        } catch (error) {
            logger.error('Init default settings error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }
}

module.exports = new SettingsController();
