import 'package:flutter/material.dart';
import '../models/notification_model.dart';
import '../services/notification_service.dart';

class NotificationProvider with ChangeNotifier {
  final NotificationService _service = NotificationService();
  List<NotificationModel> _notifications = [];
  int _unreadCount = 0;
  bool _isLoading = false;

  List<NotificationModel> get notifications => _notifications;
  int get unreadCount => _unreadCount;
  bool get isLoading => _isLoading;

  NotificationProvider() {
    fetchUnreadCount();
    fetchNotifications();
  }

  Future<void> fetchNotifications({int page = 1}) async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _service.getNotifications(page: page);
      if (response.data['success'] == true) {
        final List<dynamic> data = response.data['data'];
        _notifications = data
            .map((json) => NotificationModel.fromJson(json))
            .toList();
      }
    } catch (e) {
      print('NotificationProvider: Error fetching notifications: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchUnreadCount() async {
    try {
      final response = await _service.getUnreadCount();
      if (response.data['success'] == true) {
        _unreadCount = response.data['data']['count'];
        notifyListeners();
      }
    } catch (e) {
      print('NotificationProvider: Error fetching unread count: $e');
    }
  }

  Future<void> markAsRead(int id) async {
    try {
      await _service.markAsRead(id);
      final index = _notifications.indexWhere((n) => n.id == id);
      if (index != -1) {
        // Optimistic update
        fetchUnreadCount();
        fetchNotifications();
      }
    } catch (e) {
      print('NotificationProvider: Error marking as read: $e');
    }
  }

  Future<void> markAllAsRead() async {
    try {
      await _service.markAllAsRead();
      _unreadCount = 0;
      for (var i = 0; i < _notifications.length; i++) {
        // Update local state if needed
      }
      fetchNotifications();
      notifyListeners();
    } catch (e) {
      print('NotificationProvider: Error marking all as read: $e');
    }
  }
}
