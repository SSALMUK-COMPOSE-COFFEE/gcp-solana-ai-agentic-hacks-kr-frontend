import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/router/app_router.dart';
import 'package:goms_design_system/goms_design_system.dart';
import 'package:responsive_framework/responsive_framework.dart';

class App extends ConsumerWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: '팬덤 총대 에이전트',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      // 시안이 라이트 전용이라 다크는 화면이 준비될 때까지 잠근다.
      themeMode: ThemeMode.light,
      // 디자인 시스템이 간격·타이포를 이 둘로 스케일한다. 레이아웃 확장이
      // ResponsiveBreakpoints를 읽으므로 모든 화면 위에 있어야 한다.
      builder: (context, child) => ScreenUtilInit(
        designSize: const Size(360, 800),
        minTextAdapt: true,
        child: ResponsiveBreakpoints.builder(
          breakpoints: const [
            Breakpoint(start: 0, end: 359, name: AppBreakpoints.smallPhone),
            Breakpoint(start: 360, end: 450, name: AppBreakpoints.mobile),
            Breakpoint(start: 451, end: 800, name: AppBreakpoints.tablet),
            Breakpoint(start: 801, end: 1920, name: AppBreakpoints.desktop),
            Breakpoint(
              start: 1921,
              end: double.infinity,
              name: AppBreakpoints.largeDesktop,
            ),
          ],
          child: child!,
        ),
      ),
      routerConfig: router,
    );
  }
}
