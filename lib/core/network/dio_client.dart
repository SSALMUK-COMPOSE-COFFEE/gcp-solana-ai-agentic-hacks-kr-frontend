import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/config/app_config.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/network/auth_interceptor.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/network/token_storage.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'dio_client.g.dart';

BaseOptions _baseOptions() {
  return BaseOptions(
    baseUrl: AppConfig.baseUrl,
    connectTimeout: AppConfig.connectTimeout,
    receiveTimeout: AppConfig.receiveTimeout,
    contentType: Headers.jsonContentType,
    // Let the interceptor see 4xx/5xx as errors rather than resolving them.
    validateStatus: (status) => status != null && status >= 200 && status < 300,
  );
}

/// Client without the auth interceptor.
///
/// Used for sign-in/sign-up, the token refresh itself, and replaying a request
/// after a refresh — all cases where re-entering [AuthInterceptor] would either
/// recurse or attach a stale token.
@Riverpod(keepAlive: true)
Dio authFreeDio(AuthFreeDioRef ref) {
  final dio = Dio(_baseOptions());
  if (kDebugMode) {
    dio.interceptors.add(_debugLogInterceptor());
  }
  return dio;
}

/// The client every authenticated data source should use.
@Riverpod(keepAlive: true)
Dio dio(DioRef ref) {
  final dio = Dio(_baseOptions());
  dio.interceptors.add(
    AuthInterceptor(
      tokenStorage: ref.watch(tokenStorageProvider),
      authFreeClient: ref.watch(authFreeDioProvider),
    ),
  );
  if (kDebugMode) {
    dio.interceptors.add(_debugLogInterceptor());
  }
  return dio;
}

/// Request headers are deliberately excluded — they carry the bearer token.
LogInterceptor _debugLogInterceptor() {
  return LogInterceptor(
    request: true,
    requestHeader: false,
    requestBody: true,
    responseHeader: false,
    responseBody: true,
    error: true,
  );
}
