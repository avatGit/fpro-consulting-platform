import 'package:flutter/material.dart';
import '../models/maintenance_request.dart';
import '../services/maintenance_service.dart';
import '../services/review_service.dart';
import '../models/review.dart';

// [Changement] Centralisation du Provider Maintenance pour une synchronisation entre les rôles
class MaintenanceProvider extends ChangeNotifier {
  final MaintenanceService _service = MaintenanceService();
  final ReviewService _reviewService = ReviewService();

  List<MaintenanceRequest> _requests = [];
  List<Review> _allReviews = []; // [Ajout] Tous les avis publics
  List<Review> _myReviews = []; // [Ajout] Mes avis personnels
  bool _isLoading = false;
  String? _error;

  List<MaintenanceRequest> get requests => _requests;
  List<Review> get allReviews => _allReviews; // [Ajout]
  List<Review> get myReviews => _myReviews; // [Ajout]
  bool get isLoading => _isLoading;
  String? get error => _error;

  final Map<String, Review?> _reviews = {};
  Map<String, Review?> get reviewsCache => _reviews;

  Future<void> fetchRequests() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _requests = await _service.getMyRequests();
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // [Ajout] Récupérer tous les avis clients
  Future<void> fetchAllReviews() async {
    _isLoading = true;
    notifyListeners();
    try {
      _allReviews = await _reviewService.getAllReviews();
      print(
        'DEBUG: MaintenanceProvider.fetchAllReviews - count: ${_allReviews.length}',
      );
    } catch (e) {
      print('Error fetching all reviews: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // [Ajout] Récupérer mes propres avis
  Future<void> fetchMyReviews() async {
    _isLoading = true;
    notifyListeners();
    try {
      _myReviews = await _reviewService.getReviewsByClient();
      print(
        'DEBUG: MaintenanceProvider.fetchMyReviews - count: ${_myReviews.length}',
      );
    } catch (e) {
      print('Error fetching my reviews: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // [Changement] Rafraîchissement des données maintenance après action
  Future<void> refreshRequest(String id) async {
    try {
      final updated = await _service.getRequestDetails(id);
      final index = _requests.indexWhere((r) => r.id == id);
      if (index != -1) {
        _requests[index] = updated;
      } else {
        _requests.insert(0, updated);
      }
      notifyListeners();
    } catch (e) {
      print('Error refreshing request: $e');
    }
  }

  Future<void> confirmMaintenance(String id) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _service.confirmMaintenance(id);
      // [Changement] Ajout refresh après confirmation
      await refreshRequest(id);
      await fetchRequests(); // Refresh the whole list for the dashboard
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // [Ajout] Gestion des avis
  Future<Review?> getReview(String maintenanceId) async {
    if (_reviews.containsKey(maintenanceId)) return _reviews[maintenanceId];

    try {
      final review = await _reviewService.getMaintenanceReview(maintenanceId);
      _reviews[maintenanceId] = review;
      notifyListeners();
      return review;
    } catch (e) {
      print('Error fetching review: $e');
      return null;
    }
  }

  Future<void> postReview({
    required String maintenanceId,
    required int rating,
    required String comment,
    String? technicianId, // [Changement] Rendu optionnel
    required String clientId,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    print('DEBUG: MaintenanceProvider.postReview - Initializing Review object');
    try {
      final review = Review(
        maintenanceId: maintenanceId,
        rating: rating,
        comment: comment,
        technicianId: technicianId,
        clientId: clientId,
      );

      final createdReview = await _reviewService.createReview(review);

      _reviews[maintenanceId] = createdReview;
      _error = null;
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
