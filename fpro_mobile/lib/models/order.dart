import 'cart_item.dart';

enum OrderStatus {
  enAttente,
  enCours,
  termine,
}

class TrackingStep {
  final String title;
  final String subtitle;
  final bool isCompleted;

  TrackingStep({
    required this.title,
    required this.subtitle,
    required this.isCompleted,
  });
}

class Order {
  final String id;
  final String reference;
  final List<CartItem> items;
  final double totalPrice;
  final DateTime orderDate;
  final OrderStatus status;
  final List<TrackingStep> trackingSteps;

  Order({
    required this.id,
    required this.reference,
    required this.items,
    required this.totalPrice,
    required this.orderDate,
    required this.status,
    required this.trackingSteps,
  });

  String get statusText {
    switch (status) {
      case OrderStatus.enAttente:
        return 'En attente';
      case OrderStatus.enCours:
        return 'En cours';
      case OrderStatus.termine:
        return 'Terminé';
    }
  }

  int get totalItems {
    return items.fold(0, (sum, item) => sum + item.quantity);
  }

  bool get hasRentals => items.any((item) => item.isRental);
  bool get hasPurchases => items.any((item) => !item.isRental);
  
  String get orderTypeLabel {
    if (hasRentals && hasPurchases) return 'MIXTE';
    if (hasRentals) return 'LOCATION';
    return 'ACHAT';
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'reference': reference,
      'items': items.map((item) => item.toJson()).toList(),
      'totalPrice': totalPrice,
      'orderDate': orderDate.toIso8601String(),
      'status': status.index,
    };
  }

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'],
      reference: json['reference'],
      items: (json['items'] as List)
          .map((item) => CartItem.fromJson(item))
          .toList(),
      totalPrice: json['totalPrice'],
      orderDate: DateTime.parse(json['orderDate']),
      status: OrderStatus.values[json['status']],
      trackingSteps: [],
    );
  }
}
