import 'package:dio/dio.dart';
import '../core/network/api_client.dart';
import '../core/constants/api_constants.dart';

class QuoteService {
  final _apiClient = ApiClient();

  // Fetch user quotes
  Future<Response> generateQuoteFromCart(String companyId) async {
    try {
      final response = await _apiClient.post(
        '/api/quotes/generate',
        data: {'companyId': companyId},
      );
      print(
        'QuoteService: POST /api/quotes/generate STATUS: ${response.statusCode}',
      );
      return response;
    } catch (e) {
      print('QuoteService: Error generating quote: $e');
      rethrow;
    }
  }

  Future<Response> updateQuoteStatus(String quoteId, String status) async {
    try {
      final response = await _apiClient.patch(
        '/api/quotes/$quoteId/status',
        data: {'status': status},
      );
      print(
        'QuoteService: PATCH /api/quotes/$quoteId/status STATUS: ${response.statusCode}',
      );
      return response;
    } catch (e) {
      print('QuoteService: Error updating quote status: $e');
      rethrow;
    }
  }

  Future<List<dynamic>> getUserQuotes() async {
    try {
      final response = await _apiClient.get(
        '/api/quotes',
      ); // Check routes, usually /api/quotes
      if (response.statusCode == 200 && response.data['success'] == true) {
        return response.data['data'];
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  // Download quote PDF
  Future<Response> downloadQuotePdf(String quoteId) async {
    try {
      final response = await _apiClient.get(
        '/api/quotes/$quoteId/pdf',
        options: Options(responseType: ResponseType.bytes),
      );
      print(
        'QuoteService: GET /api/quotes/$quoteId/pdf STATUS: ${response.statusCode}',
      );
      return response;
    } catch (e) {
      print('QuoteService: Error downloading PDF: $e');
      rethrow;
    }
  }

  // Fetch user orders (for tracking/suivis)
  Future<List<dynamic>> getUserOrders() async {
    try {
      final response = await _apiClient.get(ApiConstants.ordersEndpoint);
      if (response.statusCode == 200 && response.data['success'] == true) {
        return response.data['data'];
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }
}
