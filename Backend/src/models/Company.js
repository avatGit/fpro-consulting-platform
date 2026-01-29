const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Identifiant unique de l\'entreprise'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nom de l\'entreprise'
  },
  siret: {
    type: DataTypes.STRING(14),
    allowNull: true,
    validate: {
      len: [14, 14]
    },
    comment: 'Numéro SIRET (14 chiffres)'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Adresse complète de l\'entreprise'
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Ville'
  },
  postal_code: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Code postal'
  },
  country: {
    type: DataTypes.STRING(100),
    defaultValue: 'Burkina Faso',
    comment: 'Pays'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Numéro de téléphone principal'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true
    },
    comment: 'Email de contact de l\'entreprise'
  },

  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,
    validate: {
      isURL: {
        // Options du validateur
        protocols: ['http', 'https'],
        require_protocol: false,  // Accepte "www.site.com"
        require_host: true,
        allow_underscores: true,

        allow_null: true,
        allow_blank: true
      }
    },
    set(value) {
      // Nettoie la valeur avant sauvegarde
      if (value === '' || value === null || value === undefined) {
        this.setDataValue('website', null);
      } else {
        // Enlève les espaces, ajoute http:// si absent
        let cleaned = value.trim();
        if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
          cleaned = 'https://' + cleaned;
        }
        this.setDataValue('website', cleaned);
      }
    },
    comment: 'Site web de l\'entreprise'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Compte entreprise actif ou non'
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
  tableName: 'companies',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['siret']
    },
    {
      unique: true,
      fields: ['email']
    }
  ]
});

module.exports = Company;