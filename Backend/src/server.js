const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { testConnection } = require('./config/database');
const { syncModels } = require('./models');
const ResponseHandler = require('./utils/responseHandler');
const logger = require('./utils/logger');
const { swaggerUi, specs } = require('./config/swagger');

// Charger les variables d'environnement
dotenv.config();

// Initialiser l'application Express
const app = express();

// ============================================
// MIDDLEWARES DE SÉCURITÉ
// ============================================

// Helmet - Sécurise les headers HTTP
app.use(helmet());

// CORS - Configure les origines autorisées
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ============================================
// MIDDLEWARES DE PARSING
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// LOGGING
// ============================================

// Morgan - Logs des requêtes HTTP
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================
// ROUTES DE BASE
// ============================================

// Route de santé (Health Check)
app.get('/', (req, res) => {
  ResponseHandler.success(res, {
    service: 'F-PRO CONSULTING API',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV
  }, 'Bienvenue sur l\'API F-PRO CONSULTING');
});

// Route de vérification de santé
app.get('/api/health', async (req, res) => {
  try {
    // Vérifier la connexion à la base de données
    await sequelize.authenticate();

    ResponseHandler.success(res, {
      status: 'healthy',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage()
    }, 'Service opérationnel');
  } catch (error) {
    ResponseHandler.error(res, 'Service dégradé', 503, {
      database: 'disconnected',
      error: error.message
    });
  }
});

// ============================================
// ROUTES API
// ============================================

// Routes d'authentification
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Documentation API
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes Cart, Quote, Order (Sprint 3)
const cartRoutes = require('./routes/cartRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/api/cart', cartRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/orders', orderRoutes);

// Routes Maintenance, Intervention, Rental (Sprint 4)
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const interventionRoutes = require('./routes/interventionRoutes');
const rentalRoutes = require('./routes/rentalRoutes');

app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/rentals', rentalRoutes);
// ============================================

app.use((req, res) => {
  ResponseHandler.notFound(res, `Route ${req.method} ${req.path} non trouvée`);
});

// ============================================
// GESTIONNAIRE D'ERREURS GLOBAL
// ============================================

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  logger.error(err.stack);

  // Erreur de validation Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return ResponseHandler.validationError(res, errors);
  }

  // Erreur de contrainte unique Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    return ResponseHandler.error(res, 'Cette ressource existe déjà', 409);
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return ResponseHandler.unauthorized(res, 'Token invalide');
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseHandler.unauthorized(res, 'Token expiré');
  }

  // Erreur générique
  ResponseHandler.serverError(res, err);
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Tester la connexion à PostgreSQL
    logger.info('🔌 Connexion à la base de données...');
    const isConnected = await testConnection();

    if (!isConnected) {
      logger.error('❌ Impossible de démarrer le serveur sans connexion à la base de données');
      process.exit(1);
    }

    // 2. Synchroniser les modèles (uniquement en développement)
    if (process.env.NODE_ENV === 'development') {
      logger.info('🔄 Synchronisation des modèles...');
      await syncModels({ alter: false }); // Changé de true à false pour éviter les erreurs de syntaxe Postgres
      logger.info('📊 Base de données synchronisée avec succès');
    }

    // 3. Démarrer le serveur Express
    app.listen(PORT, () => {
      logger.info('='.repeat(50));
      logger.info(`🚀 Serveur F-PRO CONSULTING démarré avec succès`);
      logger.info(`📍 URL: http://localhost:${PORT}`);
      logger.info(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📊 Base de données: ${process.env.DB_NAME}`);
      logger.info('='.repeat(50));
    });

  } catch (error) {
    logger.error('❌ Erreur critique lors du démarrage du serveur:');
    logger.error(error);
    process.exit(1);
  }
};

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Arrêter proprement le serveur
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Démarrer le serveur
startServer();

module.exports = app;