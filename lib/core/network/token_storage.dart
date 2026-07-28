import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/network/auth_tokens.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'token_storage.g.dart';

/// Where the JWT pair lives. An interface so tests can substitute an in-memory
/// implementation — the secure-storage plugin has no host binding under
/// `flutter test`.
abstract interface class TokenStorage {
  Future<String?> readAccessToken();

  Future<String?> readRefreshToken();

  Future<void> save(AuthTokens tokens);

  Future<void> clear();
}

/// Platform-backed implementation (Keystore on Android, Keychain on iOS).
/// Tokens are credentials, so they do not belong in shared preferences.
final class SecureTokenStorage implements TokenStorage {
  const SecureTokenStorage(this._storage);

  final FlutterSecureStorage _storage;

  static const String _accessKey = 'auth.access_token';
  static const String _refreshKey = 'auth.refresh_token';

  @override
  Future<String?> readAccessToken() => _storage.read(key: _accessKey);

  @override
  Future<String?> readRefreshToken() => _storage.read(key: _refreshKey);

  @override
  Future<void> save(AuthTokens tokens) async {
    await _storage.write(key: _accessKey, value: tokens.accessToken);
    // A rotating backend omits the refresh token on some responses; keeping the
    // existing one is correct there, so only overwrite when a value came back.
    if (tokens.refreshToken != null) {
      await _storage.write(key: _refreshKey, value: tokens.refreshToken);
    }
  }

  @override
  Future<void> clear() async {
    await _storage.delete(key: _accessKey);
    await _storage.delete(key: _refreshKey);
  }
}

@Riverpod(keepAlive: true)
TokenStorage tokenStorage(TokenStorageRef ref) {
  return const SecureTokenStorage(FlutterSecureStorage());
}
