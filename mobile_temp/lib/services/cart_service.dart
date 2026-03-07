import 'package:dio/dio.dart';
import '../core/network/api_client.dart';
import '../core/constants/api_constants.dart';
import '../models/cart_item.dart';

class CartService {
  final _apiClient = ApiClient();

  Future<Response> getCart() async {
    try {
      final response = await _apiClient.get(ApiConstants.cartEndpoint);
      print('CartService: GET /api/cart STATUS: ${response.statusCode}');
      return response;
    } catch (e) {
      print('CartService: Error getting cart: $e');
      rethrow;
    }
  }

  Future<void> addToCart(String productId, int quantity) async {
    try {
      print(
        'CartService: POST /api/cart/items productId=$productId quantity=$quantity',
      );
      await _apiClient.post(
        '${ApiConstants.cartEndpoint}/items',
        data: {'productId': productId, 'quantity': quantity},
      );
    } catch (e) {
      print('CartService: Error adding item: $e');
      rethrow;
    }
  }

  Future<void> updateItemQuantity(String itemId, int quantity) async {
    try {
      print('CartService: PUT /api/cart/items/$itemId quantity=$quantity');
      await _apiClient.put(
        '${ApiConstants.cartEndpoint}/items/$itemId',
        data: {'quantity': quantity},
      );
    } catch (e) {
      print('CartService: Error updating item: $e');
      rethrow;
    }
  }

  Future<void> removeItem(String itemId) async {
    try {
      print('CartService: DELETE /api/cart/items/$itemId');
      await _apiClient.delete('${ApiConstants.cartEndpoint}/items/$itemId');
    } catch (e) {
      print('CartService: Error removing item: $e');
      rethrow;
    }
  }

  Future<void> clearCart() async {
    try {
      print('CartService: DELETE /api/cart');
      await _apiClient.delete(ApiConstants.cartEndpoint);
    } catch (e) {
      print('CartService: Error clearing cart: $e');
      rethrow;
    }
  }

  Future<void> generateQuote(String companyId) async {
    try {
      print('CartService: POST /api/quotes/generate companyId=$companyId');
      await _apiClient.post(
        '/api/quotes/generate',
        data: {'companyId': companyId},
      );
    } catch (e) {
      print('CartService: Error generating quote: $e');
      rethrow;
    }
  }
}
