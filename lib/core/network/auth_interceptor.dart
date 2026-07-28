import 'package:dio/dio.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/network/api_paths.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/network/auth_tokens.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/network/token_storage.dart';

/// Marks a request as not needing (and not retrying) authentication.
///
/// ```dart
/// dio.post(AuthPaths.login, data: body, options: Options(extra: skipAuth));
/// ```
const Map<String, dynamic> skipAuth = {_skipAuthKey: true};

const String _skipAuthKey = 'skipAuth';
const String _retriedKey = 'authRetried';

/// Attaches the bearer token to outgoing requests and transparently recovers
/// from an expired access token.
///
/// On a 401 it calls `/auth/refresh` once and replays the original request.
/// Refreshes are single-flight: if several requests fail at the same time they
/// all await the same refresh instead of each firing their own, which would
/// invalidate each other's tokens on a rotating backend.
final class AuthInterceptor extends Interceptor {
  AuthInterceptor({
    required TokenStorage tokenStorage,
    required Dio authFreeClient,
    this.onSessionExpired,
  }) : _tokenStorage = tokenStorage,
       _authFreeClient = authFreeClient;

  final TokenStorage _tokenStorage;

  /// Interceptor-free client, used for the refresh call and the replay so
  /// neither can recurse back into this interceptor.
  final Dio _authFreeClient;

  /// Invoked when the session cannot be recovered and the tokens were cleared.
  final void Function()? onSessionExpired;

  Future<AuthTokens?>? _inFlightRefresh;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    if (options.extra[_skipAuthKey] != true) {
      final token = await _tokenStorage.readAccessToken();
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (!_shouldAttemptRefresh(err)) {
      return handler.next(err);
    }

    final tokens = await _refresh();
    if (tokens == null) {
      await _tokenStorage.clear();
      onSessionExpired?.call();
      return handler.next(err);
    }

    try {
      handler.resolve(await _replay(err.requestOptions, tokens.accessToken));
    } on DioException catch (e) {
      handler.next(e);
    }
  }

  bool _shouldAttemptRefresh(DioException err) {
    if (err.response?.statusCode != 401) return false;
    final extra = err.requestOptions.extra;
    return extra[_skipAuthKey] != true && extra[_retriedKey] != true;
  }

  Future<AuthTokens?> _refresh() {
    return _inFlightRefresh ??= _performRefresh().whenComplete(() {
      _inFlightRefresh = null;
    });
  }

  Future<AuthTokens?> _performRefresh() async {
    final refreshToken = await _tokenStorage.readRefreshToken();
    if (refreshToken == null) return null;

    try {
      final response = await _authFreeClient.post<Object?>(
        AuthPaths.refresh,
        data: {'refreshToken': refreshToken},
        options: Options(extra: skipAuth),
      );
      final tokens = parseAuthTokens(response.data);
      if (tokens == null) return null;
      await _tokenStorage.save(tokens);
      return tokens;
    } on DioException {
      return null;
    }
  }

  Future<Response<dynamic>> _replay(
    RequestOptions options,
    String accessToken,
  ) {
    return _authFreeClient.fetch<dynamic>(
      options.copyWith(
        headers: {...options.headers, 'Authorization': 'Bearer $accessToken'},
        extra: {...options.extra, _retriedKey: true},
      ),
    );
  }
}

/// Reads the token pair out of an auth response body.
///
/// The response schema for `/auth/login`, `/auth/signup` and `/auth/refresh`
/// is not documented yet (see `docs/api-spec.md`), so both camelCase and
/// snake_case keys are accepted, optionally nested under `data`. This is the
/// only place tokens are parsed — narrow it once the contract is confirmed.
AuthTokens? parseAuthTokens(Object? data) {
  if (data is! Map) return null;

  final body = data['data'] is Map ? data['data'] as Map : data;

  final access = _firstString(body, const ['accessToken', 'access_token']);
  if (access == null) return null;

  return AuthTokens(
    accessToken: access,
    refreshToken: _firstString(body, const ['refreshToken', 'refresh_token']),
  );
}

String? _firstString(Map<dynamic, dynamic> map, List<String> keys) {
  for (final key in keys) {
    final value = map[key];
    if (value is String && value.isNotEmpty) return value;
  }
  return null;
}
