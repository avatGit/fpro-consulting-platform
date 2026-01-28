const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InterventionReport = sequelize.define('InterventionReport', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    intervention_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
            model: 'interventions',
            key: 'id'
        }
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    photo_links: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    time_spent_minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    parts_used: {
        type: DataTypes.JSONB,
        defaultValue: [],
        comment: 'List of parts used with quantities'
    }
}, {
    tableName: 'intervention_reports',
    underscored: true
});

module.exports = InterventionReport;
