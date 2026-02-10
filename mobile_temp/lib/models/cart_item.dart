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

  CartItem({
    required this.id,
    required this.name,
    required this.category,
    required this.price,
    required this.imageUrl,
    this.quantity = 1,
    this.type = ProductType.purchase,
    this.rentalDurationDays,
    this.rentalStartDate,
    this.rentalEndDate,
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
    };
  }

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id'],
      name: json['name'],
      category: json['category'],
      price: json['price'],
      imageUrl: json['imageUrl'],
      quantity: json['quantity'],
      type: ProductType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => ProductType.purchase,
      ),
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
