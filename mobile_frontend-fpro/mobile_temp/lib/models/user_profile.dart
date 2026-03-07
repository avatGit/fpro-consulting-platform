class UserProfile {
  final String id;
  final String name;
  final String role;
  final String email;
  final String company;
  final String? companyId;
  final String phone;
  final DateTime memberSince;
  final int totalOrders;
  final int totalAccounts;
  final double averageRating;
  final int reviewCount;

  // Préférences
  final bool emailNotifications;
  final String language;
  final bool twoFactorAuth;
  final List<String> skills;

  UserProfile({
    required this.id,
    required this.name,
    required this.role,
    required this.email,
    required this.company,
    this.companyId,
    required this.phone,
    required this.memberSince,
    this.totalOrders = 0,
    this.totalAccounts = 0,
    this.emailNotifications = true,
    this.language = 'Français',
    this.twoFactorAuth = false,
    this.skills = const [],
    this.averageRating = 0.0,
    this.reviewCount = 0,
  });

  String get initials {
    final parts = name.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  UserProfile copyWith({
    String? id,
    String? name,
    String? role,
    String? email,
    String? company,
    String? phone,
    DateTime? memberSince,
    int? totalOrders,
    int? totalAccounts,
    bool? emailNotifications,
    String? language,
    bool? twoFactorAuth,
    List<String>? skills,
    double? averageRating,
    int? reviewCount,
  }) {
    return UserProfile(
      id: id ?? this.id,
      name: name ?? this.name,
      role: role ?? this.role,
      email: email ?? this.email,
      company: company ?? this.company,
      companyId: companyId ?? this.companyId,
      phone: phone ?? this.phone,
      memberSince: memberSince ?? this.memberSince,
      totalOrders: totalOrders ?? this.totalOrders,
      totalAccounts: totalAccounts ?? this.totalAccounts,
      emailNotifications: emailNotifications ?? this.emailNotifications,
      language: language ?? this.language,
      twoFactorAuth: twoFactorAuth ?? this.twoFactorAuth,
      skills: skills ?? this.skills,
      averageRating: averageRating ?? this.averageRating,
      reviewCount: reviewCount ?? this.reviewCount,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'role': role,
      'email': email,
      'company': company,
      'companyId': companyId,
      'phone': phone,
      'memberSince': memberSince.toIso8601String(),
      'totalOrders': totalOrders,
      'totalAccounts': totalAccounts,
      'emailNotifications': emailNotifications,
      'language': language,
      'twoFactorAuth': twoFactorAuth,
      'skills': skills,
    };
  }

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id']?.toString() ?? '',
      name:
          json['name'] ??
          (json['first_name'] != null
              ? '${json['first_name']} ${json['last_name'] ?? ''}'
              : 'Sans nom'),
      role: json['role'] ?? 'client',
      email: json['email'] ?? '',
      company: json['company'] is String
          ? json['company']
          : (json['company']?['name'] ?? 'F-PRO'),
      companyId:
          json['companyId']?.toString() ?? json['company_id']?.toString(),
      phone: json['phone'] ?? '',
      memberSince: json['memberSince'] != null
          ? DateTime.tryParse(json['memberSince']) ?? DateTime.now()
          : (json['created_at'] != null
                ? DateTime.tryParse(json['created_at']) ?? DateTime.now()
                : DateTime.now()),
      totalOrders: json['totalOrders'] ?? 0,
      totalAccounts: json['totalAccounts'] ?? 0,
      emailNotifications: json['emailNotifications'] ?? true,
      language: json['language'] ?? 'Français',
      twoFactorAuth: json['twoFactorAuth'] ?? false,
      skills:
          (json['skills'] as List?)?.map((e) => e.toString()).toList() ?? [],
      //averageRating: (json['averageRating'] ?? 0.0).toDouble(),
      averageRating:
          double.tryParse(json['averageRating']?.toString() ?? '0') ?? 0.0,
      reviewCount: json['reviewCount'] ?? 0,
    );
  }
}
