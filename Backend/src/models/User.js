const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Identifiant unique de l\'utilisateur'
  },
  company_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'companies',
      key: 'id'
    },
    comment: 'ID de l\'entreprise (null pour admin)'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true
    },
    comment: 'Email de connexion (unique)'
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Mot de passe hashé avec bcrypt'
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Prénom'
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nom de famille'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Numéro de téléphone'
  },
  role: {
    type: DataTypes.ENUM('admin', 'client', 'agent', 'technicien', 'technician'),
    allowNull: false,
    defaultValue: 'client'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Compte actif ou désactivé'
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date et heure de la dernière connexion'
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
  tableName: 'users',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['email']
    }
  ],
  hooks: {
    // Hook avant création : hasher le mot de passe
    beforeCreate: async (user) => {
      if (user.password_hash) {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
      }
    },
    // Hook avant mise à jour : hasher le nouveau mot de passe si changé
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
      }
    }
  }
});

// Méthode d'instance : comparer le mot de passe
User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

// Méthode d'instance : obtenir le profil public (sans le mot de passe)
User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  delete values.password_hash;
  return values;
};

module.exports = User;