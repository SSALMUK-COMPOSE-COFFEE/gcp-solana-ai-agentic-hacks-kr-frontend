import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/features/auth/presentation/models/auth_flow.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/features/auth/presentation/screens/find_password_screen.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/features/auth/presentation/screens/login_screen.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/features/auth/presentation/screens/password_screen.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/features/auth/presentation/screens/signup_screen.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/features/auth/presentation/screens/splash_screen.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/features/auth/presentation/screens/verification_screen.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/features/auth/presentation/screens/welcome_screen.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'app_router.g.dart';

@riverpod
GoRouter appRouter(Ref ref) {
  return GoRouter(
    initialLocation: Routes.splash,
    routes: [
      GoRoute(
        path: Routes.splash,
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: Routes.welcome,
        name: 'welcome',
        builder: (context, state) => const WelcomeScreen(),
      ),
      GoRoute(
        path: Routes.login,
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: Routes.signup,
        name: 'signup',
        builder: (context, state) => const SignupScreen(),
      ),
      GoRoute(
        path: Routes.findPassword,
        name: 'findPassword',
        builder: (context, state) => const FindPasswordScreen(),
      ),
      GoRoute(
        path: Routes.verification,
        name: 'verification',
        builder: (context, state) => VerificationScreen(
          flow: AuthFlow.fromQuery(state.uri.queryParameters[Routes.flowParam]),
        ),
      ),
      GoRoute(
        path: Routes.password,
        name: 'password',
        builder: (context, state) => PasswordScreen(
          flow: AuthFlow.fromQuery(state.uri.queryParameters[Routes.flowParam]),
        ),
      ),
    ],
  );
}

/// 라우트 경로. 문자열을 직접 쓰지 않고 여기를 참조해 오타를 컴파일 시점에
/// 잡는다.
abstract final class Routes {
  static const String splash = '/';
  static const String welcome = '/welcome';
  static const String login = '/login';
  static const String signup = '/signup';
  static const String findPassword = '/find-password';
  static const String verification = '/verification';
  static const String password = '/password';

  /// 인증번호·비밀번호 화면이 어느 흐름인지 구분하는 쿼리 키.
  static const String flowParam = 'flow';

  static String verificationFor(AuthFlow flow) =>
      '$verification?$flowParam=${flow.queryValue}';

  static String passwordFor(AuthFlow flow) =>
      '$password?$flowParam=${flow.queryValue}';
}
