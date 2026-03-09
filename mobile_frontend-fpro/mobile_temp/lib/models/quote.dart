enum QuoteStatus {
  pending('En attente', 0xFFFFA726),
  validated('Validé', 0xFF66BB6A),
  rejected('Rejeté', 0xFFEF5350),
  expired('Expiré', 0xFF9E9E9E);

  final String label;
  final int colorValue;

  const QuoteStatus(this.label, this.colorValue);
}

class QuoteProduct {
  final String name;
  final int quantity;
  final double unitPrice;

  QuoteProduct({
    required this.name,
    required this.quantity,
    required this.unitPrice,
  });

  double get totalPrice => quantity * unitPrice;

  Map<String, dynamic> toJson() {
    return {'name': name, 'quantity': quantity, 'unitPrice': unitPrice};
  }

  factory QuoteProduct.fromJson(Map<String, dynamic> json) {
    // Check if product details are nested in 'product' object (from include)
    final productData = json['product'] ?? json;

    return QuoteProduct(
      name: productData['name'] ?? 'Produit inconnu',
      quantity: json['quantity'] ?? 1,
      unitPrice: (json['unit_price'] is num)
          ? (json['unit_price'] as num).toDouble()
          : double.tryParse(json['unit_price']?.toString() ?? '0') ?? 0.0,
    );
  }
}

class Quote {
  final String id;
  final String reference;
  final String clientName;
  final String clientAddress;
  final List<QuoteProduct> products;
  final DateTime createdDate;
  final QuoteStatus status;

  Quote({
    required this.id,
    required this.reference,
    required this.clientName,
    required this.clientAddress,
    required this.products,
    required this.createdDate,
    required this.status,
  });

  double get totalHT {
    return products.fold(0.0, (sum, product) => sum + product.totalPrice);
  }

  double get tva => totalHT * 0.20; // 20% TVA

  double get totalTTC => totalHT + tva;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'reference': reference,
      'clientName': clientName,
      'clientAddress': clientAddress,
      'products': products.map((p) => p.toJson()).toList(),
      'createdDate': createdDate.toIso8601String(),
      'status': status.name,
    };
  }

  factory Quote.fromJson(Map<String, dynamic> json) {
    return Quote(
      id: json['id'] as String,
      reference: json['quote_number'] ?? 'N/A',
      clientName: json['company'] != null
          ? json['company']['name']
          : 'Client', // Fallback
      clientAddress:
          json['company'] != null && json['company']['address'] != null
          ? json['company']['address']
          : 'Adresse non renseignée',
      products:
          (json['items'] as List?)
              ?.map((p) => QuoteProduct.fromJson(p as Map<String, dynamic>))
              .toList() ??
          [],
      createdDate: DateTime.parse(
        json['created_at'] ?? DateTime.now().toIso8601String(),
      ),
      status: _parseStatus(json['status']),
    );
  }

  static QuoteStatus _parseStatus(String? status) {
    switch (status?.toLowerCase()) {
      case 'draft':
      case 'sent':
        return QuoteStatus.pending;
      case 'accepted':
        return QuoteStatus.validated;
      case 'refused':
        return QuoteStatus.rejected;
      case 'expired':
        return QuoteStatus.expired;
      default:
        return QuoteStatus.pending;
    }
  }
}
