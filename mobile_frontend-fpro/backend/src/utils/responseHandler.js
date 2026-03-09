/**
 * Gestionnaire centralisé des réponses API
 * Format standardisé pour toutes les réponses
 */

class ResponseHandler {
  /**
   * Réponse de succès
   * @param {Object} res - Express response object
   * @param {*} data - Données à renvoyer
   * @param {String} message - Message de succès
   * @param {Number} statusCode - Code HTTP (défaut: 200)
   */
  static success(res, data = null, message = 'Opération réussie', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Réponse de succès avec pagination
   * @param {Object} res - Express response object
   * @param {Array} data - Données paginées
   * @param {Object} pagination - Info de pagination
   * @param {String} message - Message de succès
   */
  static successWithPagination(res, data, pagination, message = 'Données récupérées') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalItems
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Réponse de création réussie
   * @param {Object} res - Express response object
   * @param {*} data - Données créées
   * @param {String} message - Message de succès
   */
  static created(res, data, message = 'Ressource créée avec succès') {
    return res.status(201).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Réponse d'erreur
   * @param {Object} res - Express response object
   * @param {String} message - Message d'erreur
   * @param {Number} statusCode - Code HTTP (défaut: 400)
   * @param {*} errors - Détails des erreurs
   */
  static error(res, message = 'Une erreur est survenue', statusCode = 400, errors = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (errors && process.env.NODE_ENV === 'development') {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Erreur de validation
   * @param {Object} res - Express response object
   * @param {Array} errors - Liste des erreurs de validation
   */
  static validationError(res, errors) {
    return res.status(422).json({
      success: false,
      message: 'Erreur de validation des données',
      errors,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Erreur d'authentification
   * @param {Object} res - Express response object
   * @param {String} message - Message d'erreur
   */
  static unauthorized(res, message = 'Non autorisé. Veuillez vous connecter.') {
    return res.status(401).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Erreur de permission
   * @param {Object} res - Express response object
   * @param {String} message - Message d'erreur
   */
  static forbidden(res, message = 'Accès interdit. Permissions insuffisantes.') {
    return res.status(403).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Ressource non trouvée
   * @param {Object} res - Express response object
   * @param {String} message - Message d'erreur
   */
  static notFound(res, message = 'Ressource non trouvée') {
    return res.status(404).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Erreur serveur
   * @param {Object} res - Express response object
   * @param {Error} error - Objet Error
   */
  static serverError(res, error) {
    console.error('Server Error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur interne',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ResponseHandler;