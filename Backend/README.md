# F-PRO CONSULTING - Backend API

Backend API pour la plateforme B2B F-PRO CONSULTING. Architecture robuste avec Node.js, Express, PostgreSQL et Sequelize.

## 📋 Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Structure du projet](#structure-du-projet)
- [API Documentation](#api-documentation)
- [Tests](#tests)
- [Production](#production)

## ✨ Fonctionnalités

### Sprint 1-2: Authentification & RBAC
- ✅ Authentification JWT
- ✅ Gestion des rôles (Admin, Agent, Client)
- ✅ Middleware d'autorisation
- ✅ Gestion des entreprises et utilisateurs

### Sprint 3: Ventes
- ✅ Panier d'achat
- ✅ Devis
- ✅ Commandes
- ✅ Génération PDF

### Sprint 4: Maintenance & Location
- ✅ Demandes de maintenance
- ✅ Assignation de techniciens
- ✅ Interventions et rapports
- ✅ Location d'équipements

### Sprint 5: Notifications & Automation
- ✅ Système de notifications multi-canal (Email, SMS, In-App)
- ✅ Templates de notifications avec variables
- ✅ Tâches planifiées (Cron jobs)
  - Rappels de maintenance
  - Rappels de retour de location
- ✅ Service d'assistance intelligente (AI)
  - Suggestions de techniciens
  - Scoring de priorité

### Sprint 6: Production & Hardening
- ✅ Rate limiting
- ✅ Sanitization des entrées
- ✅ Audit logs
- ✅ Cache service (abstraction Redis)
- ✅ Documentation Swagger complète

## 🏗️ Architecture

```
Controller → Service → Repository → Model
```

### Principes
- **Séparation des responsabilités**: Chaque couche a un rôle distinct
- **Controllers**: Gestion des requêtes HTTP
- **Services**: Logique métier
- **Repositories**: Accès aux données
- **Models**: Définition des schémas Sequelize

## 📦 Prérequis

- **Node.js**: v16+ 
- **PostgreSQL**: v12+
- **npm**: v8+

## 🚀 Installation

### 1. Cloner le projet

```bash
cd backend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env` à la racine du projet:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fpro_consulting
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=*

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=F-PRO CONSULTING <noreply@fpro-consulting.com>

# SMS (Mock by default)
SMS_PROVIDER=mock
SMS_ACCOUNT_SID=
SMS_AUTH_TOKEN=
SMS_FROM_NUMBER=+1234567890

# Redis (Optional - uses mock if not provided)
REDIS_URL=

# Logging
LOG_LEVEL=debug
```

## ⚙️ Configuration

### Base de données

1. Créer la base de données PostgreSQL:

```sql
CREATE DATABASE fpro_consulting;
```

2. Synchroniser les modèles:

```bash
# Synchronisation complète (⚠️ Supprime les données)
npm run db:sync

# Synchronisation avec alter (Recommandé en développement)
npm run db:sync:alter
```

3. Seed data (optionnel):

```bash
npm run db:seed
```

## 🎯 Démarrage

### Mode développement

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:5000`

### Mode production

```bash
npm start
```

## 📁 Structure du projet

```
backend/
├── src/
│   ├── config/           # Configuration (DB, Swagger)
│   ├── controllers/      # Contrôleurs HTTP
│   ├── middleware/       # Middleware (auth, rate limit, sanitizer, audit)
│   ├── models/           # Modèles Sequelize
│   ├── repositories/     # Couche d'accès aux données
│   ├── routes/           # Définition des routes
│   ├── services/         # Logique métier
│   │   ├── aiService.js          # Suggestions intelligentes
│   │   ├── cacheService.js       # Cache (mock Redis)
│   │   ├── cronService.js        # Tâches planifiées
│   │   ├── emailService.js       # Envoi d'emails
│   │   ├── notificationService.js # Notifications
│   │   ├── pdfService.js         # Génération PDF
│   │   └── smsService.js         # Envoi SMS (mock)
│   ├── utils/            # Utilitaires (logger, responseHandler)
│   ├── validators/       # Validateurs de données
│   ├── seedData.js       # Données de test
│   └── server.js         # Point d'entrée
├── logs/                 # Fichiers de logs
├── .env                  # Variables d'environnement
├── .env.example          # Exemple de configuration
├── package.json
└── README.md
```

## 📚 API Documentation

### Swagger UI

Accéder à la documentation interactive:

```
http://localhost:5000/api/docs
```

### Endpoints principaux

#### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

#### Ventes
- `GET /api/cart` - Panier
- `POST /api/cart/items` - Ajouter au panier
- `POST /api/quotes` - Créer un devis
- `POST /api/orders` - Créer une commande

#### Maintenance
- `POST /api/maintenance` - Créer une demande
- `GET /api/maintenance/:id/suggest-technician` - Suggestions AI
- `POST /api/maintenance/:id/assign` - Assigner un technicien

#### Notifications
- `GET /api/notifications` - Liste des notifications
- `GET /api/notifications/unread-count` - Nombre non lues
- `PATCH /api/notifications/:id/read` - Marquer comme lue

## 🧪 Tests

```bash
npm test
```

## 🔒 Sécurité

### Rate Limiting
- **API générale**: 100 requêtes / 15 min
- **Authentification**: 5 requêtes / 15 min
- **Création**: 20 requêtes / 15 min

### Sanitization
- Échappement HTML automatique
- Détection de patterns malveillants
- Validation des entrées

### Audit Logs
- Logging des opérations sensibles
- Traçabilité des actions utilisateurs

## 🚀 Production

### Checklist

1. **Variables d'environnement**
   - ✅ `NODE_ENV=production`
   - ✅ JWT_SECRET sécurisé
   - ✅ Configuration SMTP réelle
   - ✅ Redis URL (optionnel)

2. **Base de données**
   - ✅ Migrations en production (ne pas utiliser `sync`)
   - ✅ Indexes optimisés
   - ✅ Backups réguliers

3. **Monitoring**
   - ✅ Logs centralisés
   - ✅ Métriques de performance
   - ✅ Alertes d'erreurs

4. **Sécurité**
   - ✅ HTTPS activé
   - ✅ CORS configuré correctement
   - ✅ Rate limiting activé
   - ✅ Secrets sécurisés

### Déploiement

```bash
# Build (si nécessaire)
npm run build

# Démarrer en production
NODE_ENV=production npm start
```

## 🤖 Services Intelligents

### AI Service

Le service AI fournit des suggestions basées sur des règles:

- **Suggestion de techniciens**: Score basé sur compétences, disponibilité, charge de travail
- **Priorité des demandes**: Score basé sur urgence, client VIP, ancienneté

**Important**: Les suggestions sont **advisory only** - la décision finale reste humaine.

### Cron Jobs

- **Rappels de maintenance**: Tous les jours à 9h
- **Rappels de retour de location**: Tous les jours à 10h

## 📧 Notifications

### Canaux supportés
- **Email**: Nodemailer (SMTP)
- **SMS**: Mock (Twilio-ready)
- **In-App**: Stockées en base

### Templates

Templates avec injection de variables:

```javascript
"Bonjour {{client_name}}, votre commande #{{order_number}} est confirmée."
```

## 🔧 Développement

### Ajouter un nouveau module

1. Créer le modèle dans `src/models/`
2. Créer le repository dans `src/repositories/`
3. Créer le service dans `src/services/`
4. Créer le controller dans `src/controllers/`
5. Créer les routes dans `src/routes/`
6. Ajouter les routes dans `server.js`

### Conventions

- **Nommage**: camelCase pour JS, snake_case pour DB
- **Async/Await**: Toujours utiliser async/await
- **Error Handling**: Try/catch dans tous les controllers
- **Logging**: Utiliser le logger Winston

## 📝 License

ISC

## 👥 Auteurs

F-PRO CONSULTING Team

---

**Note académique**: Ce projet démontre une architecture backend complète et production-ready pour une plateforme B2B, avec séparation des responsabilités, sécurité renforcée, et fonctionnalités avancées (notifications, AI, automation).
