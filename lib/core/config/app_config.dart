/// Compile-time configuration.
///
/// The backend currently runs on a personal server and moves to GCP Cloud Run
/// before submission, so the host must be overridable without a code change:
///
/// ```bash
/// flutter run --dart-define=BASE_URL=https://staging.example.com
/// ```
abstract final class AppConfig {
  static const String baseUrl = String.fromEnvironment(
    'BASE_URL',
    defaultValue: 'https://hajin.xyz',
  );

  static const Duration connectTimeout = Duration(seconds: 10);

  static const Duration receiveTimeout = Duration(seconds: 20);
}
