/// Access/refresh token pair issued by `/auth/login`, `/auth/signup` and
/// `/auth/refresh`.
final class AuthTokens {
  const AuthTokens({required this.accessToken, this.refreshToken});

  final String accessToken;

  /// Null when the backend rotates refresh tokens via cookie rather than body.
  final String? refreshToken;
}
