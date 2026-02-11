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
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Full name for standalone technicians'
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true
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
