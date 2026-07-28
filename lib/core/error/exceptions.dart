/// Thrown by data sources (remote/local). Repository implementations catch
/// these and map them to a [Failure] before returning a [Result] to the
/// domain layer.
class ServerException implements Exception {
  const ServerException([this.message = 'Server error occurred']);

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
