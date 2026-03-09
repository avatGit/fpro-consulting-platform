class RentalItem {
  final String id;
  final String name;
  final double pricePerDay;
  final String description;
  final String imageUrl;
  final bool available;

  RentalItem({
    required this.id,
    required this.name,
    required this.pricePerDay,
    required this.description,
    this.imageUrl = '',
    this.available = true,
  });

  double calculatePrice(int days) {
    return pricePerDay * days;
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'pricePerDay': pricePerDay,
      'description': description,
      'imageUrl': imageUrl,
      'available': available,
    };
  }

  factory RentalItem.fromJson(Map<String, dynamic> json) {
    return RentalItem(
      id: json['id'] as String,
      name: json['name'] as String,
      pricePerDay: (json['pricePerDay'] as num).toDouble(),
      description: json['description'] as String,
      imageUrl: json['imageUrl'] as String? ?? '',
      available: json['available'] as bool? ?? true,
    );
  }
}

enum RentalDuration {
  oneDay(1, '1 jour'),
  threeDays(3, '3 jours'),
  oneWeek(7, '1 semaine'),
  oneMonth(30, '1 mois');

  final int days;
  final String label;

  const RentalDuration(this.days, this.label);
}
