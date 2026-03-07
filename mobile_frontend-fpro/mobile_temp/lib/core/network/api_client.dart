import 'package:dio/dio.dart';
import 'package:logger/logger.dart';
import '../constants/api_constants.dart';
import 'api_interceptor.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  ApiClient._internal();

  late final Dio _dio;
  final _logger = Logger();
  bool _initialized = false;

  void initialize() {
    if (_initialized) return;

    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: ApiConstants.connectTimeout,
        receiveTimeout: ApiConstants.receiveTimeout,
        headers: {
          'Content-Type': ApiConstants.contentType,
          'Accept': ApiConstants.accept,
        },
      ),
    );

    // Add custom interceptor for token injection
    _dio.interceptors.add(ApiInterceptor());

    // Add logging interceptor in debug mode
    _dio.interceptors.add(
      LogInterceptor(
        requestBody: true,
        responseBody: true,
        error: true,
        logPrint: (obj) => _logger.d(obj),
      ),
    );

    _initialized = true;
  }

  Dio get dio {
    if (!_initialized) {
      initialize();
    }
    return _dio;
  }

  // GET
  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await dio.get(
      path,
      queryParameters: queryParameters,
      options: options,
    );
  }

  // POST
  Future<Response> post(String path, {dynamic data, Options? options}) async {
    return await dio.post(path, data: data, options: options);
  }

  // PUT
  Future<Response> put(String path, {dynamic data, Options? options}) async {
    return await dio.put(path, data: data, options: options);
  }

  // PATCH
  Future<Response> patch(String path, {dynamic data, Options? options}) async {
    return await dio.patch(path, data: data, options: options);
  }

  // DELETE
  Future<Response> delete(String path, {Options? options}) async {
    return await dio.delete(path, options: options);
  }
}
