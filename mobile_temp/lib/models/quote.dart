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
    return {
      'name': name,
      'quantity': quantity,
      'unitPrice': unitPrice,
    };
  }

  factory QuoteProduct.fromJson(Map<String, dynamic> json) {
    return QuoteProduct(
      name: json['name'] as String,
      quantity: json['quantity'] as int,
      unitPrice: (json['unitPrice'] as num).toDouble(),
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
      reference: json['reference'] as String,
      clientName: json['clientName'] as String,
      clientAddress: json['clientAddress'] as String,
      products: (json['products'] as List)
          .map((p) => QuoteProduct.fromJson(p as Map<String, dynamic>))
          .toList(),
      createdDate: DateTime.parse(json['createdDate'] as String),
      status: QuoteStatus.values.firstWhere(
        (s) => s.name == json['status'],
        orElse: () => QuoteStatus.pending,
      ),
    );
  }
}
