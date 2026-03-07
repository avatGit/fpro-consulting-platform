const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// [Ajout] Modèle Review pour stocker les avis clients après maintenance
const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    maintenance_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true, // Un seul avis par maintenance
        references: {
            model: 'maintenance_requests',
            key: 'id'
        }
    },
    client_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    technician_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users', // On lie à l'id utilisateur du technicien
            key: 'id'
        }
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'reviews',
    underscored: true,
    timestamps: false // On gère created_at manuellement via defaultValue
});

module.exports = Review;
