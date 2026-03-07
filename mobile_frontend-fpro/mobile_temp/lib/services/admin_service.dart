import '../core/network/api_client.dart';
import '../models/user_profile.dart';
import '../models/maintenance_request.dart';

class AdminService {
  final ApiClient _apiClient = ApiClient();

  Future<List<UserProfile>> listUsers({String? role}) async {
    try {
      final response = await _apiClient.get(
        '/api/admin/users',
        queryParameters: role != null ? {'role': role} : null,
      );

      // Backend returns { success: true, data: [...], meta: ... }
      // Or ResponseHandler format: { success: true, data: [...], message: ... }
      // The controller uses ResponseHandler.successWithPagination which returns data in 'data' field.
      // But verify ResponseHandler structure.
      // Usually it is response.data['data'] if wrapper exists.

      final List<dynamic> data = response.data['data'];
      return data.map((json) => UserProfile.fromJson(json)).toList();
    } catch (e) {
      print('Error fetching users: $e');
      rethrow;
    }
  }

  Future<UserProfile> createAgent(Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.post(
        '/api/admin/users/agent',
        data: data,
      );
      return UserProfile.fromJson(response.data['data']);
    } catch (e) {
      rethrow;
    }
  }

  Future<UserProfile> createTechnicien(Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.post(
        '/api/admin/users/technician',
        data: data,
      );
      return UserProfile.fromJson(response.data['data']);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateUserStatus(String id, bool isActive) async {
    try {
      await _apiClient.put(
        '/api/admin/users/$id/status',
        data: {'is_active': isActive},
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateUserRole(String id, String role) async {
    try {
      await _apiClient.put('/api/admin/users/$id/role', data: {'role': role});
    } catch (e) {
      rethrow;
    }
  }

  Future<bool> deleteProduct(String productId) async {
    try {
      print('DEBUG: AdminService: DELETE /api/products/$productId');

      final response = await _apiClient.delete('/api/products/$productId');
      print(
        'DEBUG: AdminService: DELETE /api/products/$productId STATUS: ${response.statusCode}',
      );

      if (response.statusCode == 200 || response.statusCode == 204) {
        print('DEBUG: AdminService: Produit supprimé avec succès');
        return true;
      } else {
        print(
          'DEBUG: AdminService: Réponse inattendue: ${response.statusCode}',
        );
        return false;
      }
    } catch (e) {
      print(
        'DEBUG: AdminService: Erreur lors de la suppression du produit: $e',
      );
      return false;
    }
  }

  Future<List<MaintenanceRequest>> fetchMaintenanceRequests() async {
    try {
      print('DEBUG: AdminService: GET /api/maintenance');
      final response = await _apiClient.get('/api/maintenance');
      print(
        'DEBUG: AdminService: GET /api/maintenance STATUS: ${response.statusCode}',
      );
      print('DEBUG: AdminService: GET /api/maintenance BODY: ${response.data}');

      // The user suggests checking for 'maintenances' key, but ResponseHandler uses 'data'.
      // We check both for safety.
      final dynamic rawData = response.data is Map
          ? (response.data['data'] ?? response.data['maintenances'])
          : response.data;

      if (rawData is List) {
        return rawData.map((m) => MaintenanceRequest.fromJson(m)).toList();
      }
      return [];
    } catch (e) {
      print('DEBUG: AdminService: Error fetching maintenance: $e');
      rethrow;
    }
  }

  // [Changement] Mise à jour manuelle du statut par l'Admin
  Future<void> updateMaintenanceStatus(String id, String status) async {
    try {
      await _apiClient.patch(
        '/api/maintenance/$id/status',
        data: {'status': status},
      );
    } catch (e) {
      print('DEBUG: AdminService: Error updating status: $e');
      rethrow;
    }
  }
}
