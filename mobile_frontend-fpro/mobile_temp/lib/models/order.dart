import 'cart_item.dart';

enum OrderStatus {
  enAttente, // pending
  confirmee, // validated
  enLivraison, // delivered
  completee, // completed
  refusee, // refused
  annulee, // cancelled
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
  final String clientName;

  Order({
    required this.id,
    required this.reference,
    required this.items,
    required this.totalPrice,
    required this.orderDate,
    required this.status,
    required this.trackingSteps,
    required this.clientName,
  });

  // [Changement] Mapping proprement les statuts backend
  String get statusText => getReadableStatus(status);

  // [Correction] Fonction utilitaire pour obtenir un texte lisible
  static String getReadableStatus(OrderStatus status) {
    switch (status) {
      case OrderStatus.enAttente:
        return 'En attente';
      case OrderStatus.confirmee:
        return 'Confirmée';
      case OrderStatus.enLivraison:
        return 'En livraison';
      case OrderStatus.completee:
        return 'Terminée';
      case OrderStatus.refusee:
        return 'Refusée';
      case OrderStatus.annulee:
        return 'Annulée';
    }
  }

  // [Correction] Centralisation de la logique de complétion par le client
  static bool canClientComplete(Order order, String role) {
    return role == 'client' && order.status == OrderStatus.enLivraison;
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
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      reference:
          json['reference']?.toString() ??
          json['order_number']?.toString() ??
          json['orderNumber']?.toString() ??
          '#N/A',
      items:
          (json['items'] as List?)
              ?.map((item) => CartItem.fromJson(item))
              .toList() ??
          [],
      totalPrice: (json['totalPrice'] is num)
          ? (json['totalPrice'] as num).toDouble()
          : (json['total_amount'] is num)
          ? (json['total_amount'] as num).toDouble()
          : double.tryParse(
                  json['totalPrice']?.toString() ??
                      json['total_amount']?.toString() ??
                      '0',
                ) ??
                0.0,
      orderDate:
          DateTime.tryParse(
            json['orderDate']?.toString() ??
                json['created_at']?.toString() ??
                '',
          ) ??
          DateTime.now(),
      status: _parseStatus(json['status']),
      trackingSteps: _buildTrackingSteps(json['status']),
      clientName: (json['user'] is Map)
          ? '${json['user']['first_name']} ${json['user']['last_name']}'
          : 'Client inconnu',
    );
  }

  static OrderStatus _parseStatus(dynamic status) {
    if (status is int) {
      if (status >= 0 && status < OrderStatus.values.length) {
        return OrderStatus.values[status];
      }
      return OrderStatus.enAttente;
    }

    // [Changement] Mapping exhaustif des statuts backend réels
    switch (status.toString().toLowerCase()) {
      case 'pending':
        return OrderStatus.enAttente;
      case 'validated':
      case 'processing':
      case 'confirmée':
        return OrderStatus.confirmee;
      case 'delivered':
      case 'shipped':
      case 'livrée':
        return OrderStatus.enLivraison;
      case 'completed':
      case 'complétée':
        return OrderStatus.completee;
      case 'refused':
      case 'refusée':
        return OrderStatus.refusee;
      case 'cancelled':
      case 'annulée':
        return OrderStatus.annulee;
      default:
        return OrderStatus.enAttente;
    }
  }

  static List<TrackingStep> _buildTrackingSteps(dynamic status) {
    final currentStatus = _parseStatus(status);

    return [
      TrackingStep(
        title: 'Commande reçue',
        subtitle: 'Enregistrée',
        isCompleted: true,
      ),
      TrackingStep(
        title: 'Confirmation',
        subtitle: 'Validée par l\'agent',
        isCompleted:
            currentStatus.index >= OrderStatus.confirmee.index &&
            currentStatus != OrderStatus.refusee &&
            currentStatus != OrderStatus.annulee,
      ),
      TrackingStep(
        title: 'Livraison',
        subtitle: 'En cours ou livrée',
        isCompleted:
            currentStatus.index >= OrderStatus.enLivraison.index &&
            currentStatus != OrderStatus.refusee &&
            currentStatus != OrderStatus.annulee,
      ),
      TrackingStep(
        title: 'Terminée',
        subtitle: 'Réception confirmée',
        isCompleted: currentStatus == OrderStatus.completee,
      ),
    ];
  }
}
