import 'package:flutter/material.dart';
import '../models/intervention_model.dart';
import '../models/user_profile.dart';
import '../services/technicien_service.dart';
import '../services/profile_service.dart';
import '../services/review_service.dart';
import '../models/review.dart';

// [Changement] Création de TechnicienProvider pour gérer l'état des interventions côté client.
// Ce provider permet de notifier les widgets lors de la mise à jour des missions (récupération, démarrage, rapport).
class TechnicienProvider extends ChangeNotifier {
  final TechnicienService _service = TechnicienService();
  final ProfileService _profileService = ProfileService();
  final ReviewService _reviewService = ReviewService();

  List<Intervention> _interventions = [];
  List<Review> _reviews = [];
  UserProfile? _profile;
  bool _isLoading = false;
  String? _error;

  List<Intervention> get interventions => _interventions;
  List<Review> get reviews => _reviews;
  UserProfile? get profile => _profile;
  bool get isLoading => _isLoading;
  String? get error => _error;

  List<Intervention> get activeInterventions => _interventions
      .where((i) => i.status == InterventionStatus.inProgress)
      .toList();

  List<Intervention> get scheduledInterventions => _interventions
      .where((i) => i.status == InterventionStatus.scheduled)
      .toList();

  Future<void> fetchInterventions() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _interventions = await _service.getMyInterventions();
      _error = null;
    } catch (e) {
      if (e.toString().contains('500')) {
        _error = 'Erreur Serveur (500). Le backend a rencontré un problème.';
      } else {
        _error = 'Impossible de charger les interventions: $e';
      }
      print('Fetch error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchReviews() async {
    if (_profile == null) await fetchProfile();
    if (_profile == null) return;

    _isLoading = true;
    notifyListeners();

    try {
      final stats = await _reviewService.getTechnicianStats(_profile!.id);
      _reviews = stats.reviews;
      _error = null;
    } catch (e) {
      print('TechnicienProvider: fetchReviews error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> startIntervention(String id) async {
    _isLoading = true;
    notifyListeners();

    try {
      final updated = await _service.startIntervention(id);
      final index = _interventions.indexWhere((i) => i.id == id);
      if (index != -1) {
        _interventions[index] = updated;
      }
      _error = null;
    } catch (e) {
      _error = 'Erreur lors du démarrage';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> submitReport(String id, Map<String, dynamic> reportData) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _service.submitReport(id, reportData);
      await fetchInterventions(); // Refresh list to get updated statuses
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Erreur lors de l\'envoi du rapport';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Profile Management
  Future<void> fetchProfile() async {
    try {
      final response = await _profileService.getMyProfile();
      if (response.statusCode == 200 && response.data['success'] == true) {
        _profile = UserProfile.fromJson(response.data['data']);
        notifyListeners();
      }
    } catch (e) {
      print('TechnicienProvider: fetchProfile error: $e');
    }
  }

  Future<bool> updateProfile(Map<String, dynamic> data) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _profileService.updateMyProfile(data);
      if (response.statusCode == 200 && response.data['success'] == true) {
        _profile = UserProfile.fromJson(response.data['data']);
        return true;
      }
      _error = response.data['message'] ?? 'Erreur lors de la mise à jour';
      return false;
    } catch (e) {
      _error = 'Erreur de connexion';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
