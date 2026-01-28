const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Technician = sequelize.define('Technician', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        unique: true,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    skills: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        comment: 'List of skills/specialties'
    },
    workload: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Current number of active assignments'
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'technicians',
    underscored: true
});

module.exports = Technician;
