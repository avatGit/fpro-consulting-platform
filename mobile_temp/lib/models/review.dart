class Review {
  final String? id;
  final String maintenanceId;
  final String clientId;
  final String?
  technicianId; // [Changement] Permettre le null car le backend a un fallback
  final int rating;
  final String? comment;
  final DateTime? createdAt;
  final String? clientName;
  final String? technicianName;
  final String? maintenanceDescription;

  Review({
    this.id,
    required this.maintenanceId,
    required this.clientId,
    this.technicianId,
    required this.rating,
    this.comment,
    this.createdAt,
    this.clientName,
    this.technicianName,
    this.maintenanceDescription,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    try {
      print('DEBUG: Review.fromJson - parsing ID: ${json['id']}');
      final id = json['id']?.toString();

      print(
        'DEBUG: Review.fromJson - parsing maintenance_id: ${json['maintenance_id']}',
      );
      final maintenanceId = json['maintenance_id']?.toString() ?? '';

      print('DEBUG: Review.fromJson - parsing client_id: ${json['client_id']}');
      final clientId = json['client_id']?.toString() ?? '';

      print(
        'DEBUG: Review.fromJson - parsing technician_id: ${json['technician_id']}',
      );
      final technicianId = json['technician_id']?.toString();

      print('DEBUG: Review.fromJson - parsing rating: ${json['rating']}');
      final rating = json['rating'] ?? 0;

      print('DEBUG: Review.fromJson - parsing comment: ${json['comment']}');
      final comment = json['comment'];

      print(
        'DEBUG: Review.fromJson - parsing created_at: ${json['created_at']}',
      );
      DateTime? createdAt;
      try {
        if (json['created_at'] != null) {
          createdAt = DateTime.parse(json['created_at']);
        } else if (json['createdAt'] != null) {
          createdAt = DateTime.parse(json['createdAt']);
        }
      } catch (e) {
        print('DEBUG: Review.fromJson - Date parsing error: $e');
      }

      String? clientName;
      if (json['client'] != null) {
        clientName =
            '${json['client']['first_name']} ${json['client']['last_name']}';
      }

      String? technicianName;
      if (json['technician'] != null) {
        technicianName =
            '${json['technician']['first_name']} ${json['technician']['last_name']}';
      }

      final maintenanceDescription = json['maintenance']?['description'];

      print('DEBUG: Review.fromJson - parse SUCCESS for review $id');

      return Review(
        id: id,
        maintenanceId: maintenanceId,
        clientId: clientId,
        technicianId: technicianId,
        rating: rating,
        comment: comment,
        createdAt: createdAt,
        clientName: clientName,
        technicianName: technicianName,
        maintenanceDescription: maintenanceDescription,
      );
    } catch (e, stack) {
      print('DEBUG: Review.fromJson - CRITICAL ERROR: $e');
      print('DEBUG: StackTrace: $stack');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'maintenance_id': maintenanceId,
      'client_id': clientId,
      'technician_id': technicianId,
      'rating': rating,
      'comment': comment,
    };
  }
}

class TechnicianStats {
  final double averageRating;
  final int reviewCount;
  final List<Review> reviews;

  TechnicianStats({
    required this.averageRating,
    required this.reviewCount,
    required this.reviews,
  });

  factory TechnicianStats.fromJson(Map<String, dynamic> json) {
    double averageRating = 0.0;
    try {
      if (json['averageRating'] != null) {
        if (json['averageRating'] is num) {
          averageRating = (json['averageRating'] as num).toDouble();
        } else if (json['averageRating'] is String) {
          averageRating = double.parse(json['averageRating']);
        }
      }
    } catch (e) {
      print('Erreur parsing averageRating: $e');
    }

    return TechnicianStats(
      averageRating: averageRating,
      reviewCount: json['reviewCount'] ?? 0,
      reviews: (json['reviews'] as List? ?? [])
          .map((r) => Review.fromJson(r))
          .toList(),
    );
  }
}
