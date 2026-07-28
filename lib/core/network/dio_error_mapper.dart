import 'package:dio/dio.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/error/exceptions.dart';

/// Translates transport-level [DioException]s into the app's data-layer
/// exceptions, so nothing above the data layer has to know about Dio.
///
/// Remote data sources wrap their calls with this:
/// ```dart
/// try {
///   final res = await _dio.get(UserPaths.me);
///   return UserDto.fromJson(res.data as Map<String, dynamic>);
/// } on DioException catch (e) {
///   throw mapDioException(e);
/// }
/// ```
Exception mapDioException(DioException e) {
  switch (e.type) {
    case DioExceptionType.connectionTimeout:
    case DioExceptionType.sendTimeout:
    case DioExceptionType.receiveTimeout:
    case DioExceptionType.transformTimeout:
      return const NetworkException('Request timed out');
    case DioExceptionType.connectionError:
      return const NetworkException();
    case DioExceptionType.cancel:
      return const NetworkException('Request was cancelled');
    case DioExceptionType.badCertificate:
      return const NetworkException('Invalid server certificate');
    case DioExceptionType.badResponse:
    case DioExceptionType.unknown:
      break;
  }

  final status = e.response?.statusCode;
  if (status == 401 || status == 403) {
    return UnauthorizedException(_messageFrom(e) ?? 'Authentication required');
  }
  if (status == null) {
    return const NetworkException();
  }
  return ServerException(_messageFrom(e) ?? 'Server error occurred', status);
}

/// Pulls a human-readable message out of the error body when the backend
/// provides one. The error envelope is not specified yet (see
/// `docs/api-spec.md`), so several common shapes are tried.
String? _messageFrom(DioException e) {
  final data = e.response?.data;
  if (data is String && data.trim().isNotEmpty) {
    return data;
  }
  if (data is Map) {
    for (final key in const ['message', 'error', 'detail']) {
      final value = data[key];
      if (value is String && value.trim().isNotEmpty) {
        return value;
      }
    }
  }
  return null;
}
