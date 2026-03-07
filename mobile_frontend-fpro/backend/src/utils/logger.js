const winston = require('winston');
const path = require('path');

// Définir les niveaux de log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Définir les couleurs pour chaque niveau
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Format des logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Définir les transports (où les logs seront enregistrés)
const transports = [
  // Console
  new winston.transports.Console(),
  
  // Fichier pour toutes les erreurs
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
  }),
  
  // Fichier pour tous les logs
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
  }),
];

// Créer le logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  levels,
  format,
  transports,
});

module.exports = logger;