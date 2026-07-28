import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/error/failure.dart';

/// Return type for repository/use-case calls that can fail.
///
/// Use Dart 3 pattern matching to unwrap it:
/// ```dart
/// switch (result) {
///   Ok(:final value) => ...,
///   Err(:final failure) => ...,
/// }
/// ```
sealed class Result<T> {
  const Result();
}

final class Ok<T> extends Result<T> {
  const Ok(this.value);

  final T value;
}

final class Err<T> extends Result<T> {
  const Err(this.failure);

  final Failure failure;
}

extension ResultX<T> on Result<T> {
  bool get isOk => this is Ok<T>;

  bool get isErr => this is Err<T>;

  R when<R>({
    required R Function(T value) ok,
    required R Function(Failure failure) err,
  }) {
    return switch (this) {
      Ok<T>(:final value) => ok(value),
      Err<T>(:final failure) => err(failure),
    };
  }
}
