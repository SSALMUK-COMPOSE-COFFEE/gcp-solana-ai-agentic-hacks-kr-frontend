import 'package:flutter/material.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/router/app_router.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/features/auth/presentation/widgets/app_logo.dart';
import 'package:go_router/go_router.dart';
import 'package:goms_design_system/goms_design_system.dart';

/// 진입 화면: 브랜드 마크, 서비스 한 줄 설명, 두 갈래 진입.
class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s24),
          child: Column(
            children: [
              const Spacer(flex: 3),
              const AppLogo(),
              AppGap.v16,
              Text.rich(
                TextSpan(
                  children: [
                    TextSpan(
                      text: '팬덤 총대 ',
                      style: context.appTypography.title2.copyWith(
                        color: AppColors.mainColor,
                      ),
                    ),
                    TextSpan(
                      text: '자금 관리 서비스',
                      style: context.appTypography.title2.copyWith(
                        color: context.mainTextColor,
                      ),
                    ),
                  ],
                ),
              ),
              AppGap.v16,
              Text(
                '모인 돈이 어디에 쓰이는지\n에이전트가 대신 확인해요',
                textAlign: TextAlign.center,
                style: context.appTypography.text2.copyWith(
                  color: context.sub1Color,
                ),
              ),
              const Spacer(flex: 4),
              ConfirmButton(
                text: '로그인',
                onPressed: () => context.push(Routes.login),
              ),
              AppGap.v24,
              const _SignUpPrompt(),
              AppGap.v24,
            ],
          ),
        ),
      ),
    );
  }
}

/// 구분선 사이에 안내 문구를 끼우고, 그 아래 회원가입 링크를 둔다.
class _SignUpPrompt extends StatelessWidget {
  const _SignUpPrompt();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(child: Divider(color: context.buttonColor)),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s16),
              child: Text(
                '처음 오셨나요?',
                style: context.appTypography.caption1.copyWith(
                  color: context.sub2Color,
                ),
              ),
            ),
            Expanded(child: Divider(color: context.buttonColor)),
          ],
        ),
        AppGap.v8,
        TextButton(
          onPressed: () => context.push(Routes.signup),
          child: Text(
            '회원가입 하기',
            style: context.appTypography.text2.copyWith(
              color: AppColors.mainColor,
            ),
          ),
        ),
      ],
    );
  }
}
