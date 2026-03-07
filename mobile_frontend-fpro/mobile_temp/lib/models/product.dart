class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final int stock;
  final String imageUrl;
  final String category;
  final bool isRental;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.stock,
    required this.imageUrl,
    required this.category,
    this.isRental = false,
  });

  Product copyWith({
    String? id,
    String? name,
    String? description,
    double? price,
    int? stock,
    String? imageUrl,
    String? category,
    bool? isRental,
  }) {
    return Product(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      price: price ?? this.price,
      stock: stock ?? this.stock,
      imageUrl: imageUrl ?? this.imageUrl,
      category: category ?? this.category,
      isRental: isRental ?? this.isRental,
    );
  }

  /*  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['base_price'] ?? 0).toDouble(),
      stock: json['stock_quantity'] ?? 0,
      imageUrl:
          json['imageUrl'] ??
          'assets/images/placeholder.png', // Backend doesn't have imageUrl yet
      category: json['type'] == 'product'
          ? 'Matériel'
          : 'Service', // Mapping type to category
      isRental: false, // Default for now
    );
  } */
  factory Product.fromJson(Map<String, dynamic> json) {
    // Gestion du prix - peut être String ou num
    double parsePrice(dynamic price) {
      if (price == null) return 0.0;
      if (price is num) return price.toDouble();
      if (price is String) return double.parse(price);
      return 0.0;
    }

    return Product(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Produit sans nom',
      description: json['description']?.toString() ?? '',
      price: parsePrice(json['base_price']),
      stock: (json['stock_quantity'] is int)
          ? json['stock_quantity'] as int
          : int.tryParse(json['stock_quantity']?.toString() ?? '0') ?? 0,
      imageUrl: json['imageUrl']?.toString() ?? 'assets/images/placeholder.png',
      category: json['type']?.toString() == 'product' ? 'Matériel' : 'Service',
      isRental: false,
    );
  }

  Map<String, dynamic> toJson({bool includeId = false}) {
    final map = {
      'name': name,
      'description': description,
      'base_price': price,
      'stock_quantity': stock,
      'type': category == 'Service' ? 'service' : 'product',
    };

    if (includeId) {
      map['id'] = id; // N'inclure l'id que pour les mises à jour
    }

    return map;
  }
}
