import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/storage/secure_storage_service.dart';
import '../../../core/constants/api_constants.dart';
import '../models/login_request.dart';
import '../models/login_response.dart';
import '../models/register_request.dart';
import '../models/user_model.dart';
import 'dart:convert';

class AuthService {
  final _apiClient = ApiClient();
  final _storage = SecureStorageService();

  /// Register
  Future<LoginResponse> register(RegisterRequest request) async {
    try {
      final response = await _apiClient.post(
        ApiConstants.registerEndpoint,
        data: jsonEncode(request.toJson()),
      );

      final apiResponse = ApiResponse<LoginResponse>.fromJson(
        response.data,
        (data) => LoginResponse.fromJson(data),
      );

      if (apiResponse.success && apiResponse.data != null) {
        // Save tokens and user info (same as login)
        await _storage.saveAccessToken(apiResponse.data!.token);
        await _storage.saveRefreshToken(apiResponse.data!.refreshToken);
        await _storage.saveUserRole(apiResponse.data!.user.role);
        await _storage.saveUserId(apiResponse.data!.user.id);
        await _storage.saveUserEmail(apiResponse.data!.user.email);

        return apiResponse.data!;
      } else {
        throw ApiException(message: apiResponse.message);
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Login
  Future<LoginResponse> login(String email, String password) async {
    try {
      final request = LoginRequest(email: email, password: password);
      final response = await _apiClient.post(
        ApiConstants.loginEndpoint,
        data: request.toJson(),
      );

      final apiResponse = ApiResponse<LoginResponse>.fromJson(
        response.data,
        (data) => LoginResponse.fromJson(data),
      );

      if (apiResponse.success && apiResponse.data != null) {
        // Save tokens and user info
        await _storage.saveAccessToken(apiResponse.data!.token);
        await _storage.saveRefreshToken(apiResponse.data!.refreshToken);
        await _storage.saveUserRole(apiResponse.data!.user.role);
        await _storage.saveUserId(apiResponse.data!.user.id);
        await _storage.saveUserEmail(apiResponse.data!.user.email);

        return apiResponse.data!;
      } else {
        throw ApiException(message: apiResponse.message);
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Get Profile
  Future<UserModel> getProfile() async {
    try {
      final response = await _apiClient.get(ApiConstants.profileEndpoint);

      final apiResponse = ApiResponse<UserModel>.fromJson(
        response.data,
        (data) => UserModel.fromJson(data),
      );

      if (apiResponse.success && apiResponse.data != null) {
        return apiResponse.data!;
      } else {
        throw ApiException(message: apiResponse.message);
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Get Current User (Alias for getProfile)
  Future<UserModel> getCurrentUser() async {
    return await getProfile();
  }

  /// Logout
  Future<void> logout() async {
    try {
      await _apiClient.post(ApiConstants.logoutEndpoint);
    } catch (e) {
      // Ignore errors on logout, clear storage anyway
    } finally {
      await _storage.clearAll();
    }
  }

  /// Check if logged in
  Future<bool> isLoggedIn() async {
    return await _storage.isLoggedIn();
  }

  /// Get current user role
  Future<String?> getCurrentUserRole() async {
    return await _storage.getUserRole();
  }

  /// Handle Dio errors
  ApiException _handleDioError(DioException error) {
    if (error.response != null) {
      final statusCode = error.response!.statusCode;
      final data = error.response!.data;
      final message = data is Map
          ? (data['message'] ?? 'Erreur inconnue')
          : 'Erreur inconnue';

      switch (statusCode) {
        case 401:
          return UnauthorizedException(message: message);
        case 403:
          return ForbiddenException(message: message);
        case 404:
          return NotFoundException(message: message);
        case 500:
          return ServerException(message: message);
        default:
          return ApiException(message: message, statusCode: statusCode);
      }
    } else if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      return NetworkException(
        message:
            'Délai de connexion dépassé. Vérifiez votre connexion internet.',
      );
    } else if (error.type == DioExceptionType.connectionError) {
      return NetworkException(
        message:
            'Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
      );
    } else {
      return NetworkException(message: 'Erreur de connexion au serveur');
    }
  }
}
