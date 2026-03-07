import 'user_model.dart';

class LoginResponse {
  final UserModel user;
  final String token;
  final String refreshToken;

  LoginResponse({
    required this.user,
    required this.token,
    required this.refreshToken,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      user: UserModel.fromJson(json['user']),
      token: json['token'] ?? '',
      refreshToken: json['refreshToken'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user': user.toJson(),
      'token': token,
      'refreshToken': refreshToken,
    };
  }
}
