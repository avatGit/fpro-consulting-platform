import '../core/network/api_client.dart';
import 'package:dio/dio.dart';

class OrderService {
  final ApiClient _apiClient = ApiClient();

  Future<Response> createOrder(String quoteId) async {
    try {
      final response = await _apiClient.post(
        '/api/orders',
        data: {'quoteId': quoteId},
      );
      print('OrderService: POST /api/orders STATUS: ${response.statusCode}');
      return response;
    } catch (e) {
      print('OrderService: Error creating order: $e');
      rethrow;
    }
  }

  Future<Response> getUserOrders() async {
    try {
      final response = await _apiClient.get('/api/orders');
      print('OrderService: GET /api/orders STATUS: ${response.statusCode}');
      return response;
    } catch (e) {
      print('OrderService: Error fetching user orders: $e');
      rethrow;
    }
  }

  Future<Response> getOrderDetails(String orderId) async {
    try {
      final response = await _apiClient.get('/api/orders/$orderId');
      print(
        'OrderService: GET /api/orders/$orderId STATUS: ${response.statusCode}',
      );
      return response;
    } catch (e) {
      print('OrderService: Error fetching order details: $e');
      rethrow;
    }
  }

  /// [Changement] Confirmer la réception (Client)
  Future<Response> confirmReceipt(String orderId) async {
    try {
      final response = await _apiClient.post('/api/orders/$orderId/complete');
      print(
        'OrderService: POST /api/orders/$orderId/complete STATUS: ${response.statusCode}',
      );
      return response;
    } catch (e) {
      print('OrderService: Error confirming receipt: $e');
      rethrow;
    }
  }
}
