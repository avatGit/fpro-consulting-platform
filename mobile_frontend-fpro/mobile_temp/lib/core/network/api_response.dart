class ApiResponse<T> {
  final bool success;
  final String message;
  final T? data;
  final String? timestamp;
  final dynamic errors;

  ApiResponse({
    required this.success,
    required this.message,
    this.data,
    this.timestamp,
    this.errors,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? fromJsonT,
  ) {
    return ApiResponse<T>(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: json['data'] != null && fromJsonT != null
          ? fromJsonT(json['data'])
          : json['data'],
      timestamp: json['timestamp'],
      errors: json['errors'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'data': data,
      'timestamp': timestamp,
      'errors': errors,
    };
  }
}
