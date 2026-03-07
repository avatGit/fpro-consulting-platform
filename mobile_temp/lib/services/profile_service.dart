import 'package:dio/dio.dart';
import '../core/network/api_client.dart';

class ProfileService {
  final _apiClient = ApiClient();

  Future<Response> getMyProfile() async {
    try {
      return await _apiClient.get('/api/auth/profile');
    } catch (e) {
      print('ProfileService: Error fetching profile: $e');
      rethrow;
    }
  }

  Future<Response> updateMyProfile(Map<String, dynamic> data) async {
    try {
      return await _apiClient.put('/api/auth/profile', data: data);
    } catch (e) {
      print('ProfileService: Error updating profile: $e');
      rethrow;
    }
  }

  Future<Response> changePassword(
    String currentPassword,
    String newPassword,
  ) async {
    try {
      return await _apiClient.post(
        '/api/auth/change-password',
        data: {
          'current_password': currentPassword,
          'new_password': newPassword,
        },
      );
    } catch (e) {
      print('ProfileService: Error changing password: $e');
      rethrow;
    }
  }

  // Admin specific
  Future<Response> updateUserInfo(
    String userId,
    Map<String, dynamic> data,
  ) async {
    try {
      return await _apiClient.put('/api/admin/users/$userId', data: data);
    } catch (e) {
      print('ProfileService: Error updating user info: $e');
      rethrow;
    }
  }
}
