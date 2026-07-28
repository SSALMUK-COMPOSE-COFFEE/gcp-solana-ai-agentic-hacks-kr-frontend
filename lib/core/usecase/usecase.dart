import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/utils/result.dart';

/// Base class for domain use cases in the clean architecture layering:
/// presentation (ViewModel) -> domain (UseCase) -> data (Repository).
abstract interface class UseCase<ReturnType, Params> {
  Future<Result<ReturnType>> call(Params params);
}

/// Use for use cases that take no parameters.
final class NoParams {
  const NoParams();
}
