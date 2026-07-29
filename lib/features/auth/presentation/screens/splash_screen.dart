import 'dart:async';

import 'package:flutter/material.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/router/app_router.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/features/auth/presentation/widgets/app_logo.dart';
import 'package:go_router/go_router.dart';

/// 진입 스플래시. 지금은 정해진 시간 뒤 환영 화면으로 넘어가지만, 세션 복구가
/// 붙으면 여기서 토큰을 확인해 홈/환영을 가르게 된다.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  static const _duration = Duration(milliseconds: 1200);

  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer(_duration, () {
      if (mounted) context.go(Routes.welcome);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: AppLogo()));
  }
}
