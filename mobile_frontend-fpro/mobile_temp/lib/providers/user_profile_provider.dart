import 'package:flutter/material.dart';
import '../models/user_profile.dart';
import '../services/profile_service.dart';

class UserProfileProvider with ChangeNotifier {
  UserProfile _profile = UserProfile(
    id: '',
    name: '',
    role: '',
    email: '',
    company: '',
    companyId: null,
    phone: '',
    memberSince: DateTime.now(),
  );

  UserProfile get profile => _profile;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  final _service = ProfileService();

  Future<void> fetchProfile() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _service.getMyProfile();
      if (response.statusCode == 200 && response.data['success'] == true) {
        _profile = UserProfile.fromJson(response.data['data']);
      } else {
        _errorMessage =
            response.data['message'] ??
            'Erreur lors de la récupération du profil';
      }
    } catch (e) {
      _errorMessage = 'Erreur de connexion';
      print('UserProfileProvider: fetchProfile error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> updateProfile(Map<String, dynamic> data) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _service.updateMyProfile(data);
      if (response.statusCode == 200 && response.data['success'] == true) {
        _profile = UserProfile.fromJson(response.data['data']);
        notifyListeners();
        return true;
      } else {
        _errorMessage =
            response.data['message'] ?? 'Erreur lors de la mise à jour';
        return false;
      }
    } catch (e) {
      _errorMessage = 'Erreur lors de la mise à jour';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> changePassword(String current, String next) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _service.changePassword(current, next);
      if (response.statusCode == 200 && response.data['success'] == true) {
        return true;
      } else {
        _errorMessage =
            response.data['message'] ??
            'Erreur lors du changement de mot de passe';
        return false;
      }
    } catch (e) {
      _errorMessage = 'Erreur lors du changement de mot de passe';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void setProfile(UserProfile newProfile) {
    _profile = newProfile;
    notifyListeners();
  }

  void updatePersonalInfo({
    String? name,
    String? email,
    String? company,
    String? phone,
  }) {
    _profile = _profile.copyWith(
      name: name,
      email: email,
      company: company,
      phone: phone,
    );
    notifyListeners();
  }

  void toggleEmailNotifications() {
    _profile = _profile.copyWith(
      emailNotifications: !_profile.emailNotifications,
    );
    notifyListeners();
  }

  void toggleTwoFactorAuth() {
    _profile = _profile.copyWith(twoFactorAuth: !_profile.twoFactorAuth);
    notifyListeners();
  }

  void updateLanguage(String language) {
    _profile = _profile.copyWith(language: language);
    notifyListeners();
  }
}
