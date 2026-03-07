import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/storage_keys.dart';

class SecureStorageService {
  static final SecureStorageService _instance =
      SecureStorageService._internal();
  factory SecureStorageService() => _instance;
  SecureStorageService._internal();

  final _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  // Token Management
  Future<void> saveAccessToken(String token) async {
    await _storage.write(key: StorageKeys.accessToken, value: token);
  }

  Future<String?> getAccessToken() async {
    return await _storage.read(key: StorageKeys.accessToken);
  }

  Future<void> saveRefreshToken(String token) async {
    await _storage.write(key: StorageKeys.refreshToken, value: token);
  }

  Future<String?> getRefreshToken() async {
    return await _storage.read(key: StorageKeys.refreshToken);
  }

  // User Data
  Future<void> saveUserRole(String role) async {
    await _storage.write(key: StorageKeys.userRole, value: role);
  }

  Future<String?> getUserRole() async {
    return await _storage.read(key: StorageKeys.userRole);
  }

  Future<void> saveUserId(String id) async {
    await _storage.write(key: StorageKeys.userId, value: id);
  }

  Future<String?> getUserId() async {
    return await _storage.read(key: StorageKeys.userId);
  }

  Future<void> saveUserEmail(String email) async {
    await _storage.write(key: StorageKeys.userEmail, value: email);
  }

  Future<String?> getUserEmail() async {
    return await _storage.read(key: StorageKeys.userEmail);
  }

  Future<void> saveCompanyId(String? companyId) async {
    if (companyId != null) {
      await _storage.write(key: 'company_id', value: companyId);
    }
  }

  Future<String?> getCompanyId() async {
    return await _storage.read(key: 'company_id');
  }

  // Clear All
  Future<void> clearAll() async {
    await _storage.deleteAll();
  }

  // Check if logged in
  Future<bool> isLoggedIn() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }
}
