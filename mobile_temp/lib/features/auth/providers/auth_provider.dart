import 'package:flutter/foundation.dart';
import '../models/user_model.dart';
import '../models/register_request.dart';
import '../services/auth_service.dart';
import '../../../core/network/api_exception.dart';

enum AuthStatus { initial, loading, authenticated, unauthenticated, error }

class AuthProvider with ChangeNotifier {
  final _authService = AuthService();

  AuthStatus _status = AuthStatus.initial;
  UserModel? _user;
  String? _errorMessage;

  AuthStatus get status => _status;
  UserModel? get user => _user;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _status == AuthStatus.authenticated;
  bool get isLoading => _status == AuthStatus.loading;

  /// Register
  Future<bool> register(RegisterRequest request) async {
    _setStatus(AuthStatus.loading);
    _errorMessage = null;

    try {
      final response = await _authService.register(request);
      _user = response.user;
      _setStatus(AuthStatus.authenticated);
      return true;
    } on ApiException catch (e) {
      _errorMessage = e.message;
      _setStatus(AuthStatus.error);
      return false;
    } catch (e) {
      _errorMessage = 'Erreur inattendue: ${e.toString()}';
      _setStatus(AuthStatus.error);
      return false;
    }
  }

  /// Login
  Future<bool> login(String email, String password) async {
    _setStatus(AuthStatus.loading);
    _errorMessage = null;

    try {
      final response = await _authService.login(email, password);
      _user = response.user;
      _setStatus(AuthStatus.authenticated);
      return true;
    } on ApiException catch (e) {
      _errorMessage = e.message;
      _setStatus(AuthStatus.error);
      return false;
    } catch (e) {
      _errorMessage = 'Erreur inattendue: ${e.toString()}';
      _setStatus(AuthStatus.error);
      return false;
    }
  }

  /// Logout
  Future<void> logout() async {
    await _authService.logout();
    _user = null;
    _errorMessage = null;
    _setStatus(AuthStatus.unauthenticated);
  }

  /// Check auth status on app start
  Future<void> checkAuthStatus() async {
    final isLoggedIn = await _authService.isLoggedIn();

    if (isLoggedIn) {
      try {
        _user = await _authService.getProfile();
        _setStatus(AuthStatus.authenticated);
      } catch (e) {
        // Token invalid or expired, clear and set unauthenticated
        await _authService.logout();
        _setStatus(AuthStatus.unauthenticated);
      }
    } else {
      _setStatus(AuthStatus.unauthenticated);
    }
  }

  /// Refresh user profile
  Future<void> refreshProfile() async {
    try {
      _user = await _authService.getProfile();
      notifyListeners();
    } catch (e) {
      // Ignore errors on refresh
    }
  }

  /// Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  void _setStatus(AuthStatus status) {
    _status = status;
    notifyListeners();
  }
}
