import 'package:flutter/foundation.dart';
import '../models/cart_item.dart';
import '../models/order.dart';

class CartProvider extends ChangeNotifier {
  final List<CartItem> _cartItems = [];
  final List<Order> _orders = [];
  int _orderCounter = 1000;

  List<CartItem> get cartItems => List.unmodifiable(_cartItems);
  List<Order> get orders => List.unmodifiable(_orders);

  int get cartItemCount {
    return _cartItems.fold(0, (sum, item) => sum + item.quantity);
  }

  double get cartTotalPrice {
    return _cartItems.fold(0.0, (sum, item) => sum + item.totalPrice);
  }

  // Add item to cart
  void addToCart(CartItem item) {
    final existingIndex = _cartItems.indexWhere((i) => i.id == item.id);
    
    if (existingIndex >= 0) {
      // Item already exists, increase quantity
      _cartItems[existingIndex].quantity += item.quantity;
    } else {
      // Add new item
      _cartItems.add(item);
    }
    
    notifyListeners();
  }

  // Update item quantity
  void updateQuantity(String itemId, int newQuantity) {
    final index = _cartItems.indexWhere((item) => item.id == itemId);
    
    if (index >= 0) {
      if (newQuantity <= 0) {
        _cartItems.removeAt(index);
      } else {
        _cartItems[index].quantity = newQuantity;
      }
      notifyListeners();
    }
  }

  // Remove item from cart
  void removeFromCart(String itemId) {
    _cartItems.removeWhere((item) => item.id == itemId);
    notifyListeners();
  }

  // Clear cart
  void clearCart() {
    _cartItems.clear();
    notifyListeners();
  }

  // Confirm order and move to tracking
  void confirmOrder() {
    if (_cartItems.isEmpty) return;

    _orderCounter++;
    final orderRef = 'CMD-${DateTime.now().year}-$_orderCounter';
    
    // Create tracking steps
    final trackingSteps = [
      TrackingStep(
        title: 'Demande reçue',
        subtitle: _formatDateTime(DateTime.now()),
        isCompleted: true,
      ),
      TrackingStep(
        title: 'En cours',
        subtitle: 'Traitement en cours',
        isCompleted: false,
      ),
      TrackingStep(
        title: 'Intervention Prévue',
        subtitle: 'En attente',
        isCompleted: false,
      ),
    ];

    final order = Order(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      reference: orderRef,
      items: List.from(_cartItems),
      totalPrice: cartTotalPrice,
      orderDate: DateTime.now(),
      status: OrderStatus.enAttente,
      trackingSteps: trackingSteps,
    );

    _orders.insert(0, order); // Add to beginning of list
    clearCart();
    notifyListeners();
  }

  // Update order status
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
      );
      
      _orders[index] = updatedOrder;
      notifyListeners();
    }
  }

  List<TrackingStep> _updateTrackingSteps(OrderStatus status) {
    switch (status) {
      case OrderStatus.enAttente:
        return [
          TrackingStep(
            title: 'Demande reçue',
            subtitle: _formatDateTime(DateTime.now()),
            isCompleted: true,
          ),
          TrackingStep(
            title: 'En cours',
            subtitle: 'En attente',
            isCompleted: false,
          ),
          TrackingStep(
            title: 'Intervention Prévue',
            subtitle: 'En attente',
            isCompleted: false,
          ),
        ];
      case OrderStatus.enCours:
        return [
          TrackingStep(
            title: 'Demande reçue',
            subtitle: _formatDateTime(DateTime.now()),
            isCompleted: true,
          ),
          TrackingStep(
            title: 'En cours',
            subtitle: _formatDateTime(DateTime.now()),
            isCompleted: true,
          ),
          TrackingStep(
            title: 'Intervention Prévue',
            subtitle: 'En attente',
            isCompleted: false,
          ),
        ];
      case OrderStatus.termine:
        return [
          TrackingStep(
            title: 'Demande reçue',
            subtitle: _formatDateTime(DateTime.now()),
            isCompleted: true,
          ),
          TrackingStep(
            title: 'En cours',
            subtitle: _formatDateTime(DateTime.now()),
            isCompleted: true,
          ),
          TrackingStep(
            title: 'Terminé',
            subtitle: _formatDateTime(DateTime.now()),
            isCompleted: true,
          ),
        ];
    }
  }

  String _formatDateTime(DateTime dateTime) {
    final months = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
      'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
    ];
    
    return '${dateTime.day} ${months[dateTime.month - 1]}, ${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
  }
}
