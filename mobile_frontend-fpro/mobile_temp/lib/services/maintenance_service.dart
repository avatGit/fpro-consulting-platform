import '../core/network/api_client.dart';
import '../core/constants/api_constants.dart';
import '../models/maintenance_request.dart';

class MaintenanceService {
  final _apiClient = ApiClient();

  Future<List<MaintenanceRequest>> getMyRequests() async {
    try {
      final response = await _apiClient.get(ApiConstants.maintenanceEndpoint);
      if (response.statusCode == 200 && response.data['success'] == true) {
        final List<dynamic> data = response.data['data'];
        return data.map((json) => MaintenanceRequest.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  Future<void> createRequest(MaintenanceRequest request) async {
    try {
      await _apiClient.post(
        ApiConstants.maintenanceEndpoint,
        data: request.toJson(),
      );
    } catch (e) {
      rethrow;
    }
  }

  // [Changement] Récupérer les détails d'une maintenance spécifique
  Future<MaintenanceRequest> getRequestDetails(String requestId) async {
    try {
      final response = await _apiClient.get(
        '${ApiConstants.maintenanceEndpoint}/$requestId',
      );
      if (response.statusCode == 200 && response.data['success'] == true) {
        return MaintenanceRequest.fromJson(response.data['data']);
      }
      throw Exception('Erreur lors de la récupération des détails');
    } catch (e) {
      rethrow;
    }
  }

  // [Changement] Confirmer la maintenance par le client
  Future<void> confirmMaintenance(String requestId) async {
    try {
      await _apiClient.post(
        '${ApiConstants.maintenanceEndpoint}/$requestId/confirm',
      );
    } catch (e) {
      rethrow;
    }
  }
}
