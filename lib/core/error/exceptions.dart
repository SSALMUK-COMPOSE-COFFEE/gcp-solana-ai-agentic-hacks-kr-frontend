/// Thrown by data sources (remote/local). Repository implementations catch
/// these and map them to a [Failure] before returning a [Result] to the
/// domain layer.
class ServerException implements Exception {
  const ServerException([
    this.message = 'Server error occurred',
    this.statusCode,
  ]);

  final String message;

  /// HTTP status the server responded with, when there was a response at all.
  final int? statusCode;
}

/// The request was rejected as unauthenticated and refreshing the access token
/// did not recover it. Callers should send the user back to sign-in.
class UnauthorizedException implements Exception {
  const UnauthorizedException([this.message = 'Authentication required']);

  final String message;
}

class NetworkException implements Exception {
  const NetworkException([this.message = 'No network connection']);

  final String message;
}

class CacheException implements Exception {
  const CacheException([this.message = 'Cache error occurred']);

  final String message;
}
