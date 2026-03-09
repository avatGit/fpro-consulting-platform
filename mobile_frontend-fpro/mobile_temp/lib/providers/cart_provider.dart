import 'package:flutter/foundation.dart';
import '../models/cart_item.dart';
import '../models/order.dart';
import '../services/cart_service.dart';
import '../services/quote_service.dart';
import '../services/order_service.dart';

class CartProvider extends ChangeNotifier {
  final List<CartItem> _cartItems = [];
  final List<Order> _orders = [];

  List<CartItem> get cartItems => List.unmodifiable(_cartItems);
  List<Order> get orders => List.unmodifiable(_orders);

  int get cartItemCount {
    return _cartItems.fold(0, (sum, item) => sum + item.quantity);
  }

  double get cartTotalPrice {
    return _cartItems.fold(0.0, (sum, item) => sum + item.totalPrice);
  }

  final CartService _cartService = CartService();
  final QuoteService _quoteService = QuoteService();
  final OrderService _orderService = OrderService();
  bool _isLoading = false;
  bool get isLoading => _isLoading;

  CartProvider() {
    fetchCart();
    fetchOrders();
  }

  Future<void> fetchCart() async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _cartService.getCart();
      if (response.data['success'] == true) {
        final List<dynamic> itemsData = response.data['data']['items'] ?? [];
        _cartItems.clear();
        _cartItems.addAll(
          itemsData.map((json) => CartItem.fromJson(json)).toList(),
        );
      }
    } catch (e) {
      print('CartProvider: Error fetching cart: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchOrders() async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _orderService.getUserOrders();
      if (response.data['success'] == true) {
        final List<dynamic> ordersData = response.data['data'];
        _orders.clear();
        _orders.addAll(ordersData.map((json) => Order.fromJson(json)).toList());
      }
    } catch (e) {
      print('CartProvider: Error fetching orders: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addToCart(CartItem item) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _cartService.addToCart(item.id, item.quantity);
      await fetchCart();
    } catch (e) {
      print('CartProvider: Error adding to cart: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateQuantity(String itemId, int newQuantity) async {
    _isLoading = true;
    notifyListeners();
    try {
      if (newQuantity <= 0) {
        await _cartService.removeItem(itemId);
      } else {
        await _cartService.updateItemQuantity(itemId, newQuantity);
      }
      await fetchCart();
    } catch (e) {
      print('CartProvider: Error updating quantity: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> removeFromCart(String itemId) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _cartService.removeItem(itemId);
      await fetchCart();
    } catch (e) {
      print('CartProvider: Error removing from cart: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> clearCart() async {
    _isLoading = true;
    notifyListeners();
    try {
      await _cartService.clearCart();
      await fetchCart();
    } catch (e) {
      print('CartProvider: Error clearing cart: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> confirmOrder(String companyId) async {
    if (_cartItems.isEmpty) return;

    _isLoading = true;
    notifyListeners();
    try {
      // 1. Generate Quote from Cart
      final quoteResponse = await _quoteService.generateQuoteFromCart(
        companyId,
      );
      final quoteId = quoteResponse.data['data']['id'];

      // 2. Accept Quote (assuming direct order bypasses manual acceptance or auto-accepts)
      await _quoteService.updateQuoteStatus(quoteId, 'accepted');

      // 3. Create Order from Quote
      await _orderService.createOrder(quoteId);

      // 4. Update local state
      _cartItems.clear();
      await fetchOrders();
      notifyListeners();
    } catch (e) {
      print('CartProvider: Error confirming order: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // [Changement] Confirmer la réception
  Future<void> confirmReceipt(String orderId) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _orderService.confirmReceipt(orderId);
      await fetchOrders();
    } catch (e) {
      print('CartProvider: Error confirming receipt: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void updateOrderStatus(String orderId, OrderStatus newStatus) {
    final index = _orders.indexWhere((order) => order.id == orderId);

    if (index >= 0) {
      final order = _orders[index];
      final updatedOrder = Order(
        id: order.id,
        reference: order.reference,
        items: order.items,
        totalPrice: order.totalPrice,
        orderDate: order.orderDate,
        status: newStatus,
        trackingSteps: _updateTrackingSteps(newStatus),
        clientName: order.clientName,
      );

      _orders[index] = updatedOrder;
      notifyListeners();
    }
  }

  List<TrackingStep> _updateTrackingSteps(OrderStatus status) {
    final now = DateTime.now();
    switch (status) {
      case OrderStatus.enAttente:
        return [
          TrackingStep(
            title: 'Demande reçue',
            subtitle: _formatDateTime(now),
            isCompleted: true,
          ),
          TrackingStep(
            title: 'Confirmation',
            subtitle: 'En attente',
            isCompleted: false,
          ),
          TrackingStep(
            title: 'Livraison',
            subtitle: 'En attente',
            isCompleted: false,
          ),
          TrackingStep(
            title: 'Terminée',
            subtitle: 'En attente',
            isCompleted: false,
          ),
        ];
      case OrderStatus.confirmee:
        return [
          TrackingStep(
            title: 'Demande reçue',
            subtitle: _formatDateTime(now),
            isCompleted: true,
          ),
          TrackingStep(
            title: 'Confirmation',
            subtitle: _formatDateTime(now),
            isCompleted: true,
          ),
          TrackingStep(
            title: 'Livraison',
            subtitle: 'En attente',
            isCompleted: false,
          ),
          TrackingStep(
            title: 'Terminée',
            subtitle: 'En attente',
            isCompleted: false,
          ),
        ];
      case OrderStatus.enLivraison:
        return [
          TrackingStep(
            title: 'Demande reçue',
            subtitle: _formatDateTime(now),
            isCompleted: true,
          ),
          TrackingStep(
            title: 'Confirmation',
            subtitle: _formatDateTime(now),
            isCompleted: true,
          ),
          TrackingStep(
            title: 'Livraison',
            subtitle: _formatDateTime(now),
            isCompleted: true,
          ),
          TrackingStep(
            title: 'Terminée',
            subtitle: 'En attente',
            isCompleted: false,
          ),
        ];
      case OrderStatus.completee:
        return [
          TrackingStep(
            title: 'Demande reçue',
            subtitle: _formatDateTime(now),
            isCompleted: true,
          ),
          TrackingStep(
            title: 'Confirmation',
            subtitle: _formatDateTime(now),
            isCompleted: true,
          ),
          TrackingStep(
            title: 'Livraison',
            subtitle: _formatDateTime(now),
            isCompleted: true,
          ),
          TrackingStep(
            title: 'Terminée',
            subtitle: _formatDateTime(now),
            isCompleted: true,
          ),
        ];
      case OrderStatus.refusee:
      case OrderStatus.annulee:
        return [
          TrackingStep(
            title: 'Demande reçue',
            subtitle: _formatDateTime(now),
            isCompleted: true,
          ),
          TrackingStep(
            title: 'Annulée/Refusée',
            subtitle: _formatDateTime(now),
            isCompleted: true,
          ),
        ];
    }
  }

  String _formatDateTime(DateTime dateTime) {
    final months = [
      'Jan',
      'Fév',
      'Mar',
      'Avr',
      'Mai',
      'Juin',
      'Juil',
      'Août',
      'Sep',
      'Oct',
      'Nov',
      'Déc',
    ];
    return '${dateTime.day} ${months[dateTime.month - 1]}, ${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
  }
}
