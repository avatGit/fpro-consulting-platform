import 'package:dio/dio.dart';
import '../storage/secure_storage_service.dart';
import '../constants/api_constants.dart';
import 'api_exception.dart';

class ApiInterceptor extends Interceptor {
  final _storage = SecureStorageService();

  /* @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Inject access token for all requests except login/register
    if (!options.path.contains('/login') &&
        !options.path.contains('/register')) {
      final token = await _storage.getAccessToken();
      if (token != null && token.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
      }
    }

    handler.next(options);
  } */

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // On crée une liste propre des routes qui ne demandent pas de Token
    final String path = options.path.toLowerCase();
    final bool isAuthRoute =
        path.contains('login') ||
        path.contains('register') ||
        path.contains('signup');

    if (!isAuthRoute) {
      final token = await _storage.getAccessToken();
      if (token != null && token.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
      }
    }

    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    handler.next(response);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    // Handle 401 Unauthorized - try to refresh token
    if (err.response?.statusCode == 401) {
      try {
        // Attempt to refresh the token
        await _refreshToken();

        // Retry the original request with new token
        final opts = err.requestOptions;
        final token = await _storage.getAccessToken();
        if (token != null) {
          opts.headers['Authorization'] = 'Bearer $token';
        }

        final dio = Dio();
        final response = await dio.fetch(opts);
        return handler.resolve(response);
      } catch (e) {
        // Refresh failed, clear storage and propagate error
        await _storage.clearAll();
        return handler.reject(err);
      }
    }

    handler.next(err);
  }

  Future<void> _refreshToken() async {
    final refreshToken = await _storage.getRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) {
      throw UnauthorizedException(message: 'No refresh token available');
    }

    try {
      final dio = Dio(BaseOptions(baseUrl: ApiConstants.baseUrl));
      final response = await dio.post(
        ApiConstants.refreshTokenEndpoint,
        data: {'refreshToken': refreshToken},
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final data = response.data['data'];
        await _storage.saveAccessToken(data['token']);
        await _storage.saveRefreshToken(data['refreshToken']);
      } else {
        throw UnauthorizedException(message: 'Failed to refresh token');
      }
    } catch (e) {
      throw UnauthorizedException(message: 'Token refresh failed');
    }
  }
}
