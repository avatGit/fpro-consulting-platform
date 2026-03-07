import 'package:dio/dio.dart';
import '../core/network/api_client.dart';
import '../core/network/api_exception.dart';
import '../models/order.dart';
import '../models/product.dart';
import '../models/maintenance_request.dart';
import '../models/user_profile.dart';

class AgentService {
  final _apiClient = ApiClient();

  /// Fetch all client orders
  Future<List<Order>> fetchClientOrders() async {
    try {
      final response = await _apiClient.get('/api/orders');
      print(
        'DEBUG: AgentService: GET /api/orders STATUS: ${response.statusCode}',
      );
      print('DEBUG: AgentService: GET /api/orders BODY: ${response.data}');

      final dynamic rawData = response.data is Map
          ? response.data['data']
          : response.data;

      if (rawData is List) {
        return rawData.map((o) => Order.fromJson(o)).toList();
      }
      return [];
    } on DioException catch (e) {
      print('DEBUG: AgentService: fetchClientOrders ERROR: $e');
      throw _handleDioError(e);
    }
  }

  /// Validate an order
  Future<Order> validateOrder(String id) async {
    try {
      print('DEBUG: AgentService: POST /api/orders/$id/validate');
      final response = await _apiClient.post('/api/orders/$id/validate');
      print(
        'DEBUG: AgentService: POST /api/orders/$id/validate STATUS: ${response.statusCode}',
      );

      final dynamic rawData = response.data is Map
          ? response.data['data']
          : response.data;
      return Order.fromJson(rawData);
    } on DioException catch (e) {
      print('DEBUG: AgentService: validateOrder ERROR: $e');
      throw _handleDioError(e);
    }
  }

  /// Refuse an order
  Future<Order> refuseOrder(String id, String message) async {
    try {
      final payload = {'message': message};
      print(
        'DEBUG: AgentService: POST /api/orders/$id/refuse PAYLOAD: $payload',
      );
      final response = await _apiClient.post(
        '/api/orders/$id/refuse',
        data: payload,
      );
      print(
        'DEBUG: AgentService: POST /api/orders/$id/refuse STATUS: ${response.statusCode}',
      );

      final dynamic rawData = response.data is Map
          ? response.data['data']
          : response.data;
      return Order.fromJson(rawData);
    } on DioException catch (e) {
      print('DEBUG: AgentService: refuseOrder ERROR: $e');
      throw _handleDioError(e);
    }
  }

  /// [Changement] Marquer comme livrée
  Future<Order> markAsDelivered(String id) async {
    try {
      print('DEBUG: AgentService: POST /api/orders/$id/delivered');
      final response = await _apiClient.post('/api/orders/$id/delivered');
      print(
        'DEBUG: AgentService: POST /api/orders/$id/delivered STATUS: ${response.statusCode}',
      );

      final dynamic rawData = response.data is Map
          ? response.data['data']
          : response.data;
      return Order.fromJson(rawData);
    } on DioException catch (e) {
      print('DEBUG: AgentService: markAsDelivered ERROR: $e');
      throw _handleDioError(e);
    }
  }

  /// Fetch all products
  Future<List<Product>> fetchProducts() async {
    try {
      final response = await _apiClient.get('/api/products');
      print(
        'DEBUG: AgentService: GET /api/products STATUS: ${response.statusCode}',
      );
      print('DEBUG: AgentService: GET /api/products BODY: ${response.data}');

      // The backend might return { success: true, data: [...] } or just [...]
      final dynamic rawData = response.data is Map
          ? response.data['data']
          : response.data;

      if (rawData is List) {
        return rawData.map((p) => Product.fromJson(p)).toList();
      }
      return [];
    } on DioException catch (e) {
      print('DEBUG: AgentService: fetchProducts ERROR: $e');
      throw _handleDioError(e);
    }
  }

  /// Create a new product
  Future<Product> createProduct(Product product) async {
    try {
      final payload = product.toJson(includeId: false);
      print('DEBUG: AgentService: POST /api/products PAYLOAD: $payload');

      final response = await _apiClient.post('/api/products', data: payload);
      print(
        'DEBUG: AgentService: POST /api/products STATUS: ${response.statusCode}',
      );
      print('DEBUG: AgentService: POST /api/products BODY: ${response.data}');

      final dynamic rawData = response.data is Map
          ? response.data['data']
          : response.data;
      return Product.fromJson(rawData);
    } on DioException catch (e) {
      print('DEBUG: AgentService: createProduct ERROR: $e');
      throw _handleDioError(e);
    }
  }

  /// Update an existing product
  Future<Product> updateProduct(Product product) async {
    try {
      final payload = product.toJson(includeId: false);
      final id = product.id;
      print('DEBUG: AgentService: PUT /api/products/$id PAYLOAD: $payload');

      final response = await _apiClient.put('/api/products/$id', data: payload);
      print(
        'DEBUG: AgentService: PUT /api/products/$id STATUS: ${response.statusCode}',
      );
      print(
        'DEBUG: AgentService: PUT /api/products/$id BODY: ${response.data}',
      );

      if (response.statusCode == 200 || response.statusCode == 204) {
        // If 204 No Content, we might not have a body, return updated product as is
        if (response.statusCode == 204 ||
            response.data == null ||
            response.data == '') {
          return product;
        }
        final dynamic rawData = response.data is Map
            ? response.data['data']
            : response.data;
        return Product.fromJson(rawData ?? product.toJson(includeId: true));
      }
      throw ApiException(
        message: 'Échec de la mise à jour (Status: ${response.statusCode})',
      );
    } on DioException catch (e) {
      print('DEBUG: AgentService: updateProduct ERROR: $e');
      throw _handleDioError(e);
    }
  }

  /// Fetch all maintenance requests
  Future<List<MaintenanceRequest>> fetchMaintenanceRequests() async {
    try {
      final response = await _apiClient.get('/api/maintenance');
      print(
        'DEBUG: AgentService: GET /api/maintenance STATUS: ${response.statusCode}',
      );
      print('DEBUG: AgentService: GET /api/maintenance BODY: ${response.data}');

      final dynamic rawData = response.data is Map
          ? response.data['data']
          : response.data;

      if (rawData is List) {
        return rawData.map((m) => MaintenanceRequest.fromJson(m)).toList();
      }
      return [];
    } on DioException catch (e) {
      print('DEBUG: AgentService: fetchMaintenanceRequests ERROR: $e');
      throw _handleDioError(e);
    }
  }

  /// Get suggested techniciens
  Future<List<dynamic>> getSuggestedTechniciens(String requestId) async {
    try {
      final response = await _apiClient.get(
        '/api/maintenance/$requestId/suggest-technician',
      );
      print(
        'DEBUG: AgentService: GET suggest-technician STATUS: ${response.statusCode}',
      );

      final dynamic rawData = response.data is Map
          ? response.data['data']
          : response.data;
      if (rawData is List) {
        return rawData;
      }
      return [];
    } on DioException catch (e) {
      print('DEBUG: AgentService: getSuggestedTechniciens ERROR: $e');
      throw _handleDioError(e);
    }
  }

  /// Assign technicien
  Future<bool> assignTechnicien(String requestId, String technicianId) async {
    try {
      final payload = {'technicianId': technicianId};
      print('DEBUG: AgentService: POST assign PAYLOAD: $payload');

      final response = await _apiClient.post(
        '/api/maintenance/$requestId/assign',
        data: payload,
      );
      print('DEBUG: AgentService: POST assign STATUS: ${response.statusCode}');
      return response.statusCode == 200 || response.statusCode == 201;
    } on DioException catch (e) {
      print('DEBUG: AgentService: assignTechnicien ERROR: $e');
      throw _handleDioError(e);
    }
  }

  /// Fetch techniciens list (for manual assignment)
  Future<List<UserProfile>> fetchTechniciens() async {
    try {
      final response = await _apiClient.get('/api/admin/users?role=technicien');
      print(
        'DEBUG: AgentService: GET techniciens STATUS: ${response.statusCode}',
      );
      print('DEBUG: AgentService: GET techniciens BODY: ${response.data}');

      final dynamic rawData = response.data is Map
          ? response.data['data']
          : response.data;

      if (rawData is List) {
        return rawData.map((u) => UserProfile.fromJson(u)).toList();
      }
      return [];
    } on DioException catch (e) {
      print('DEBUG: AgentService: fetchTechniciens ERROR: $e');
      throw _handleDioError(e);
    }
  }

  ApiException _handleDioError(DioException error) {
    if (error.response != null) {
      final data = error.response!.data;
      final message = data is Map
          ? (data['message'] ?? 'Erreur API')
          : 'Erreur API';
      return ApiException(
        message: message,
        statusCode: error.response!.statusCode,
      );
    }
    return ApiException(message: 'Erreur de connexion');
  }

  Future<bool> deleteProduct(String productId) async {
    try {
      print('Suppression du produit: $productId');

      final response = await _apiClient.delete('/api/products/$productId');

      if (response.statusCode == 200 || response.statusCode == 204) {
        print('Produit supprimé avec succès');
        return true;
      } else {
        print(' Réponse inattendue: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      print(' Erreur: $e');
      return false;
    }
  }
}
