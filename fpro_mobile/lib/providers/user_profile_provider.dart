import 'package:flutter/material.dart';
import '../models/user_profile.dart';

class UserProfileProvider with ChangeNotifier {
  UserProfile _profile = UserProfile(
    id: '1',
    name: 'John Doe',
    role: 'Directeur Technique',
    email: 'john.doe@entreprise.com',
    company: 'F-PRO Solutions',
    phone: '+225 01 02 03 04',
    memberSince: DateTime(2026, 1, 1),
    totalOrders: 12,
    totalAccounts: 5,
    emailNotifications: true,
    language: 'Français',
    twoFactorAuth: false,
  );

  UserProfile get profile => _profile;

  void updateProfile(UserProfile newProfile) {
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
    _profile = _profile.copyWith(
      twoFactorAuth: !_profile.twoFactorAuth,
    );
    notifyListeners();
  }

  void updateLanguage(String language) {
    _profile = _profile.copyWith(
      language: language,
    );
    notifyListeners();
  }
}
