enum ProductType {
  purchase('Achat'),
  rental('Location');

  final String label;
  const ProductType(this.label);
}

class CartItem {
  final String id;
  final String name;
  final String category;
  final double price;
  final String imageUrl;
  int quantity;
  final ProductType type;
  final int? rentalDurationDays;
  final DateTime? rentalStartDate;
  final DateTime? rentalEndDate;
  final String? cartItemId; // ID from backend cart_items table

  CartItem({
    required this.id, // Product ID
    required this.name,
    required this.category,
    required this.price,
    required this.imageUrl,
    this.quantity = 1,
    this.type = ProductType.purchase,
    this.rentalDurationDays,
    this.rentalStartDate,
    this.rentalEndDate,
    this.cartItemId,
  });

  bool get isRental => type == ProductType.rental;

  double get totalPrice {
    if (isRental && rentalDurationDays != null) {
      return price * rentalDurationDays! * quantity;
    }
    return price * quantity;
  }

  String get rentalDurationLabel {
    if (rentalDurationDays == null) return '';
    if (rentalDurationDays == 1) return '1 jour';
    if (rentalDurationDays == 3) return '3 jours';
    if (rentalDurationDays == 7) return '1 semaine';
    if (rentalDurationDays == 30) return '1 mois';
    return '$rentalDurationDays jours';
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'category': category,
      'price': price,
      'imageUrl': imageUrl,
      'quantity': quantity,
      'type': type.name,
      'rentalDurationDays': rentalDurationDays,
      'rentalStartDate': rentalStartDate?.toIso8601String(),
      'rentalEndDate': rentalEndDate?.toIso8601String(),
      'cartItemId': cartItemId,
    };
  }

  factory CartItem.fromJson(Map<String, dynamic> json) {
    // Check for nested product (from OrderItem or CartItem)
    final productData = json['product'] ?? json;

    // Handle specific field mapping differences (backend vs local storage)
    final nameVal = productData['name'] ?? json['name'] ?? 'Produit inconnu';
    final categoryVal = productData['category'] ?? json['category'] ?? 'Divers';

    // Price: unit_price from OrderItem, or price from Product, or price from local
    dynamic priceVal =
        json['unit_price'] ?? productData['price'] ?? json['price'] ?? 0;
    if (priceVal is String) priceVal = double.tryParse(priceVal) ?? 0.0;

    final imageUrlVal =
        productData['image_url'] ??
        productData['imageUrl'] ??
        json['imageUrl'] ??
        '';

    // Enum parsing safe handling
    ProductType typeVal = ProductType.purchase;
    if (json['type'] != null) {
      try {
        typeVal = ProductType.values.firstWhere((e) => e.name == json['type']);
      } catch (_) {}
    } else if (productData['type'] != null) {
      try {
        typeVal = ProductType.values.firstWhere(
          (e) => e.name == productData['type'],
        );
      } catch (_) {}
    }

    return CartItem(
      id: productData['id'] ?? json['product_id'] ?? '',
      cartItemId:
          json['id'], // If this IS the cart item from backend, it has an ID
      name: nameVal,
      category: categoryVal,
      price: (priceVal is num) ? priceVal.toDouble() : 0.0,
      imageUrl: imageUrlVal,
      quantity: json['quantity'] ?? 1,
      type: typeVal,
      rentalDurationDays: json['rentalDurationDays'] as int?,
      rentalStartDate: json['rentalStartDate'] != null
          ? DateTime.parse(json['rentalStartDate'] as String)
          : null,
      rentalEndDate: json['rentalEndDate'] != null
          ? DateTime.parse(json['rentalEndDate'] as String)
          : null,
    );
  }

  CartItem copyWith({
    String? id,
    String? name,
    String? category,
    double? price,
    String? imageUrl,
    int? quantity,
    ProductType? type,
    int? rentalDurationDays,
    DateTime? rentalStartDate,
    DateTime? rentalEndDate,
  }) {
    return CartItem(
      id: id ?? this.id,
      name: name ?? this.name,
      category: category ?? this.category,
      price: price ?? this.price,
      imageUrl: imageUrl ?? this.imageUrl,
      quantity: quantity ?? this.quantity,
      type: type ?? this.type,
      rentalDurationDays: rentalDurationDays ?? this.rentalDurationDays,
      rentalStartDate: rentalStartDate ?? this.rentalStartDate,
      rentalEndDate: rentalEndDate ?? this.rentalEndDate,
    );
  }
}
