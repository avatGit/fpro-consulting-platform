const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Invoice = sequelize.define('Invoice', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: 'Identifiant unique de la facture'
    },
    invoice_number: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false,
        comment: 'Numéro de facture (format INV-YYYY-000001)'
    },
    order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id'
        },
        comment: 'Commande associée'
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'companies',
            key: 'id'
        },
        comment: 'Entreprise cliente'
    },
    subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Montant HT'
    },
    vat_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 18.00,
        comment: 'Taux de TVA (%)'
    },
    vat_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Montant de la TVA'
    },
    total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Montant TTC'
    },
    status: {
        type: DataTypes.ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled'),
        defaultValue: 'draft',
        comment: 'Statut de la facture'
    },
    issue_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Date d\'émission'
    },
    due_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date d\'échéance'
    },
    paid_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date de paiement'
    },
    payment_method: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Méthode de paiement (virement, espèces, etc.)'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notes additionnelles'
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'invoices',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['order_id'] },
        { fields: ['company_id'] },
        { fields: ['status'] },
        { fields: ['issue_date'] }
    ]
});

module.exports = Invoice;
