class ApiConstants {
  // Base URL - Change this to your backend URL
  // For Android Emulator, use: http://10.0.2.2:5000
  // For iOS Simulator, use: http://localhost:5000
  // For Physical Device, use: http://YOUR_IP:5000
  static const String baseUrl = 'http://localhost:5001';

  // Auth Endpoints
  static const String loginEndpoint = '/api/auth/login';
  static const String registerEndpoint = '/api/auth/register';
  static const String refreshTokenEndpoint = '/api/auth/refresh-token';
  static const String profileEndpoint = '/api/auth/profile';
  static const String logoutEndpoint = '/api/auth/logout';

  static const String productsEndpoint = '/api/products';
  static const String maintenanceEndpoint = '/api/maintenance';
  static const String ordersEndpoint = '/api/orders';
  static const String cartEndpoint = '/api/cart';
  static const String reviewsEndpoint = '/api/reviews';

  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // Headers
  static const String contentType = 'application/json';
  static const String accept = 'application/json';
}
