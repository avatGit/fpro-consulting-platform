class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic data;

  ApiException({required this.message, this.statusCode, this.data});

  @override
  String toString() => 'ApiException: $message (Status: $statusCode)';
}

class UnauthorizedException extends ApiException {
  UnauthorizedException({String message = 'Non autorisé'})
    : super(message: message, statusCode: 401);
}

class ForbiddenException extends ApiException {
  ForbiddenException({String message = 'Accès interdit'})
    : super(message: message, statusCode: 403);
}

class NotFoundException extends ApiException {
  NotFoundException({String message = 'Ressource non trouvée'})
    : super(message: message, statusCode: 404);
}

class ServerException extends ApiException {
  ServerException({String message = 'Erreur serveur'})
    : super(message: message, statusCode: 500);
}

class NetworkException extends ApiException {
  NetworkException({String message = 'Erreur de connexion au serveur'})
    : super(message: message);
}
