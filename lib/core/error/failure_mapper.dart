import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/error/exceptions.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/error/failure.dart';

/// Translates a data-layer exception into the [Failure] the domain layer sees.
///
/// Repository implementations use this so the mapping lives in one place:
/// ```dart
/// try {
///   return Ok(await _remote.fetchMe());
/// } on Exception catch (e) {
///   return Err(mapExceptionToFailure(e));
/// }
/// ```
Failure mapExceptionToFailure(Object error) {
  return switch (error) {
    UnauthorizedException(:final message) => UnauthorizedFailure(message),
    ServerException(:final message) => ServerFailure(message),
    NetworkException(:final message) => NetworkFailure(message),
    CacheException(:final message) => CacheFailure(message),
    _ => const UnexpectedFailure(),
  };
}
