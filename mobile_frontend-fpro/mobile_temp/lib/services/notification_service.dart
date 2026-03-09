import '../core/network/api_client.dart';
import 'package:dio/dio.dart';

class NotificationService {
  final ApiClient _apiClient = ApiClient();

  Future<Response> getNotifications({int page = 1, int limit = 20}) async {
    try {
      final response = await _apiClient.get(
        '/api/notifications',
        queryParameters: {'page': page, 'limit': limit},
      );
      print(
        'NotificationService: GET /api/notifications STATUS: ${response.statusCode}',
      );
      return response;
    } catch (e) {
      print('NotificationService: Error fetching notifications: $e');
      rethrow;
    }
  }

  Future<Response> getUnreadCount() async {
    try {
      final response = await _apiClient.get('/api/notifications/unread-count');
      print(
        'NotificationService: GET /api/notifications/unread-count STATUS: ${response.statusCode}',
      );
      return response;
    } catch (e) {
      print('NotificationService: Error fetching unread count: $e');
      rethrow;
    }
  }

  Future<Response> markAsRead(int notificationId) async {
    try {
      final response = await _apiClient.patch(
        '/api/notifications/$notificationId/read',
      );
      print(
        'NotificationService: PATCH /api/notifications/$notificationId/read STATUS: ${response.statusCode}',
      );
      return response;
    } catch (e) {
      print('NotificationService: Error marking notification as read: $e');
      rethrow;
    }
  }

  Future<Response> markAllAsRead() async {
    try {
      final response = await _apiClient.patch('/api/notifications/read-all');
      print(
        'NotificationService: PATCH /api/notifications/read-all STATUS: ${response.statusCode}',
      );
      return response;
    } catch (e) {
      print('NotificationService: Error marking all read: $e');
      rethrow;
    }
  }
}
