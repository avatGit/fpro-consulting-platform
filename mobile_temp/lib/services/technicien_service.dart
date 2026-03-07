import '../core/network/api_client.dart';
import '../models/intervention_model.dart';

// [Changement] Implémentation de TechnicienService pour centraliser les appels API spécifiques aux techniciens.
// Ce service facilite l'intéraction avec les endpoints de gestion des interventions et de soumission de rapports.
class TechnicienService {
  final ApiClient _apiClient = ApiClient();

  Future<List<Intervention>> getMyInterventions() async {
    try {
      print('DEBUG: TechnicienService: GET /api/interventions/my');
      final response = await _apiClient.get('/api/interventions/my');
      print(
        'DEBUG: TechnicienService: GET /api/interventions/my STATUS: ${response.statusCode}',
      );
      print(
        'DEBUG: TechnicienService: GET /api/interventions/my BODY: ${response.data}',
      );

      if (response.data != null && response.data['success'] == true) {
        final List<dynamic> data = response.data['data'];
        return data.map((json) => Intervention.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print('DEBUG: TechnicienService: getMyInterventions ERROR: $e');
      rethrow;
    }
  }

  Future<Intervention> startIntervention(String id) async {
    try {
      final response = await _apiClient.post('/api/interventions/$id/start');
      if (response.data['success'] == true) {
        return Intervention.fromJson(response.data['data']);
      }
      throw Exception(response.data['message'] ?? 'Erreur lors du démarrage');
    } catch (e) {
      rethrow;
    }
  }

  Future<void> submitReport(String id, Map<String, dynamic> reportData) async {
    try {
      final response = await _apiClient.post(
        '/api/interventions/$id/report',
        data: reportData,
      );
      if (response.data['success'] != true) {
        throw Exception(
          response.data['message'] ?? 'Erreur lors de l\'envoi du rapport',
        );
      }
    } catch (e) {
      rethrow;
    }
  }
}
