import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/network/api_paths.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/network/auth_interceptor.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/network/auth_tokens.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/network/token_storage.dart';

/// Serves canned responses and records what was asked for, so the tests can
/// assert on the headers the interceptor attached and on how many times the
/// refresh endpoint was hit.
final class _FakeAdapter implements HttpClientAdapter {
  _FakeAdapter({required this.handler});

  final ResponseBody Function(RequestOptions options) handler;
  final List<RequestOptions> requests = [];

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    requests.add(options);
    return handler(options);
  }

  @override
  void close({bool force = false}) {}
}

ResponseBody _json(Map<String, Object?> body, int statusCode) {
  return ResponseBody.fromString(
    jsonEncode(body),
    statusCode,
    headers: {
      Headers.contentTypeHeader: [Headers.jsonContentType],
    },
  );
}

final class _InMemoryTokenStorage implements TokenStorage {
  _InMemoryTokenStorage({this.access, this.refresh});

  String? access;
  String? refresh;
  int clearCount = 0;

  @override
  Future<String?> readAccessToken() async => access;

  @override
  Future<String?> readRefreshToken() async => refresh;

  @override
  Future<void> save(AuthTokens tokens) async {
    access = tokens.accessToken;
    if (tokens.refreshToken != null) refresh = tokens.refreshToken;
  }

  @override
  Future<void> clear() async {
    access = null;
    refresh = null;
    clearCount++;
  }
}

/// Builds a client whose auth interceptor and refresh client share one adapter,
/// mirroring how [AuthInterceptor] is wired in `dio_client.dart`.
({
  Dio dio,
  _FakeAdapter adapter,
  _InMemoryTokenStorage storage,
  List<void Function()> expiries,
})
_buildClient({
  required ResponseBody Function(RequestOptions options) handler,
  String? access = 'expired-access',
  String? refresh = 'valid-refresh',
}) {
  final adapter = _FakeAdapter(handler: handler);
  final storage = _InMemoryTokenStorage(access: access, refresh: refresh);
  final expiries = <void Function()>[];

  final authFree = Dio(BaseOptions(baseUrl: 'https://example.test'))
    ..httpClientAdapter = adapter;
  final dio = Dio(BaseOptions(baseUrl: 'https://example.test'))
    ..httpClientAdapter = adapter
    ..interceptors.add(
      AuthInterceptor(
        tokenStorage: storage,
        authFreeClient: authFree,
        onSessionExpired: () => expiries.add(() {}),
      ),
    );

  return (dio: dio, adapter: adapter, storage: storage, expiries: expiries);
}

void main() {
  group('AuthInterceptor', () {
    test('attaches the stored access token as a bearer header', () async {
      final c = _buildClient(
        handler: (_) => _json({'ok': true}, 200),
        access: 'token-abc',
      );

      await c.dio.get<Object?>(UserPaths.me);

      expect(
        c.adapter.requests.single.headers['Authorization'],
        'Bearer token-abc',
      );
    });

    test('does not attach a token to requests marked skipAuth', () async {
      final c = _buildClient(handler: (_) => _json({'ok': true}, 200));

      await c.dio.post<Object?>(
        AuthPaths.login,
        options: Options(extra: skipAuth),
      );

      expect(
        c.adapter.requests.single.headers.containsKey('Authorization'),
        isFalse,
      );
    });

    test(
      'refreshes on 401 and replays the request with the new token',
      () async {
        final c = _buildClient(
          handler: (options) {
            if (options.path == AuthPaths.refresh) {
              return _json({'accessToken': 'fresh-access'}, 200);
            }
            final auth = options.headers['Authorization'];
            if (auth == 'Bearer fresh-access') {
              return _json({'id': 'me'}, 200);
            }
            return _json({'message': 'expired'}, 401);
          },
        );

        final response = await c.dio.get<Object?>(UserPaths.me);

        expect(response.statusCode, 200);
        expect((response.data! as Map)['id'], 'me');
        expect(c.storage.access, 'fresh-access');
        expect(c.adapter.requests.map((r) => r.path).toList(), [
          UserPaths.me,
          AuthPaths.refresh,
          UserPaths.me,
        ]);
      },
    );

    test('refreshes once when several requests get a 401 together', () async {
      var refreshCount = 0;
      final c = _buildClient(
        handler: (options) {
          if (options.path == AuthPaths.refresh) {
            refreshCount++;
            return _json({'accessToken': 'fresh-access'}, 200);
          }
          final auth = options.headers['Authorization'];
          if (auth == 'Bearer fresh-access') {
            return _json({'ok': true}, 200);
          }
          return _json({'message': 'expired'}, 401);
        },
      );

      await Future.wait([
        c.dio.get<Object?>(UserPaths.me),
        c.dio.get<Object?>(UserPaths.meTiny),
        c.dio.get<Object?>(UserPaths.meContributions),
      ]);

      expect(refreshCount, 1);
    });

    test('clears the session when the refresh call itself fails', () async {
      final c = _buildClient(
        handler: (options) {
          if (options.path == AuthPaths.refresh) {
            return _json({'message': 'invalid refresh token'}, 401);
          }
          return _json({'message': 'expired'}, 401);
        },
      );

      await expectLater(
        c.dio.get<Object?>(UserPaths.me),
        throwsA(
          isA<DioException>().having(
            (e) => e.response?.statusCode,
            'statusCode',
            401,
          ),
        ),
      );

      expect(c.storage.access, isNull);
      expect(c.storage.refresh, isNull);
      expect(c.expiries, hasLength(1));
    });

    test('does not try to refresh when no refresh token is stored', () async {
      final c = _buildClient(
        handler: (_) => _json({'message': 'expired'}, 401),
        refresh: null,
      );

      await expectLater(
        c.dio.get<Object?>(UserPaths.me),
        throwsA(isA<DioException>()),
      );

      expect(
        c.adapter.requests.map((r) => r.path),
        isNot(contains(AuthPaths.refresh)),
      );
    });

    test('gives up after one retry rather than looping', () async {
      final c = _buildClient(
        handler: (options) {
          if (options.path == AuthPaths.refresh) {
            return _json({'accessToken': 'fresh-access'}, 200);
          }
          return _json({'message': 'still expired'}, 401);
        },
      );

      await expectLater(
        c.dio.get<Object?>(UserPaths.me),
        throwsA(isA<DioException>()),
      );

      expect(
        c.adapter.requests.where((r) => r.path == AuthPaths.refresh),
        hasLength(1),
      );
    });
  });

  group('parseAuthTokens', () {
    test('reads camelCase keys', () {
      final tokens = parseAuthTokens({'accessToken': 'a', 'refreshToken': 'r'});

      expect(tokens?.accessToken, 'a');
      expect(tokens?.refreshToken, 'r');
    });

    test('reads snake_case keys nested under data', () {
      final tokens = parseAuthTokens({
        'data': {'access_token': 'a', 'refresh_token': 'r'},
      });

      expect(tokens?.accessToken, 'a');
      expect(tokens?.refreshToken, 'r');
    });

    test('returns null when no access token is present', () {
      expect(parseAuthTokens({'refreshToken': 'r'}), isNull);
      expect(parseAuthTokens('not a map'), isNull);
    });
  });
}
