import '../core/network/api_client.dart';
import '../core/constants/api_constants.dart';
import '../models/review.dart';

class ReviewService {
  final _apiClient = ApiClient();

  Future<Review> createReview(Review review) async {
    print('DEBUG: ReviewService.createReview - Sending POST request');
    try {
      final response = await _apiClient.post(
        ApiConstants.reviewsEndpoint,
        data: review.toJson(),
      );

      if (response.statusCode == 201) {
        return Review.fromJson(response.data);
      } else {
        throw Exception(
          response.data['message'] ?? 'Erreur lors de la création de l\'avis',
        );
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<TechnicianStats> getTechnicianStats(String technicianId) async {
    try {
      final response = await _apiClient.get(
        '${ApiConstants.reviewsEndpoint}/technician/$technicianId',
      );

      if (response.statusCode == 200) {
        return TechnicianStats.fromJson(response.data);
      } else {
        throw Exception(
          'Erreur lors de la récupération des avis du technicien',
        );
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<Review?> getMaintenanceReview(String maintenanceId) async {
    try {
      final response = await _apiClient.get(
        '${ApiConstants.reviewsEndpoint}/maintenance/$maintenanceId',
      );

      if (response.statusCode == 200) {
        return Review.fromJson(response.data);
      } else {
        return null;
      }
    } catch (e) {
      // ApiClient might throw on 404 depending on implementation,
      // but usually it's handled in interceptors or returns response
      return null;
    }
  }

  Future<List<Review>> getAllReviews() async {
    try {
      final response = await _apiClient.get(ApiConstants.reviewsEndpoint);

      if (response.statusCode == 200) {
        print(
          'DEBUG: ReviewService.getAllReviews raw response: ${response.data}',
        );
        List<dynamic> data = response.data;
        return data.map((json) => Review.fromJson(json)).toList();
      } else {
        throw Exception('Erreur lors de la récupération de la liste des avis');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Review>> getReviewsByClient() async {
    try {
      final response = await _apiClient.get(
        '${ApiConstants.reviewsEndpoint}/client',
      );

      if (response.statusCode == 200) {
        print(
          'DEBUG: ReviewService.getReviewsByClient raw response: ${response.data}',
        );
        List<dynamic> data = response.data;
        return data.map((json) => Review.fromJson(json)).toList();
      } else {
        throw Exception('Erreur lors de la récupération de vos avis');
      }
    } catch (e) {
      rethrow;
    }
  }
}
