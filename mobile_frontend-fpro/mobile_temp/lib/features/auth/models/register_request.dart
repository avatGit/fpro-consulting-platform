/// Request model for user registration
/// Matches the backend API structure: { company: {...}, user: {...} }
class RegisterRequest {
  final CompanyData company;
  final UserData user;

  /// Creates a RegisterRequest with the specific fields required by the UI.
  /// The backend structure (company + user) is automatically generated.
  RegisterRequest({
    required String companyName,
    required String email,
    required String password,
    String? phone,
  }) : company = CompanyData(name: companyName, email: email, phone: phone),
       user = UserData(
         // User email is same as company email
         email: email,
         password: password,
         // User name derived from company name
         firstName: companyName,
         lastName: companyName,
         // User phone same as company phone
         phone: phone,
       );

  Map<String, dynamic> toJson() {
    return {'company': company.toJson(), 'user': user.toJson()};
  }
}

/// Company data for registration
class CompanyData {
  final String name;
  final String email;
  final String? phone;
  final String? address;
  final String? city;
  final String? postalCode;
  final String? siret;

  CompanyData({
    required this.name,
    required this.email,
    this.phone,
    this.address,
    this.city,
    this.postalCode,
    this.siret,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      if (phone != null) 'phone': phone,
      if (address != null) 'address': address,
      if (city != null) 'city': city,
      if (postalCode != null) 'postal_code': postalCode,
      if (siret != null) 'siret': siret,
    };
  }
}

/// User data for registration
class UserData {
  final String email;
  final String password;
  final String firstName;
  final String lastName;
  final String? phone;

  UserData({
    required this.email,
    required this.password,
    required this.firstName,
    required this.lastName,
    this.phone,
  });

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'password': password,
      'first_name': firstName,
      'last_name': lastName,
      if (phone != null) 'phone': phone,
    };
  }
}
