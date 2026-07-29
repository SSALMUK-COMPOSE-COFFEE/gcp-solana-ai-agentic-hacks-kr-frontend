import 'package:flutter/material.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/widgets/app_back_app_bar.dart';
import 'package:goms_design_system/goms_design_system.dart';

/// 인증 화면 공통 껍데기: 뒤로가기 앱바 → 제목 → 입력 영역 → 하단 확인 버튼.
///
/// 회원가입·로그인·비밀번호 재설정이 같은 골격을 쓰므로 한 곳에 둔다.
/// 확인 버튼은 [Spacer]로 아래에 붙고, 키보드가 올라오면 하단 여백을 접어
/// 버튼이 가려지지 않게 한다.
class AuthBaseScreen extends StatelessWidget {
  const AuthBaseScreen({
    required this.title,
    required this.children,
    required this.confirmText,
    required this.onConfirm,
    super.key,
    this.isLoading = false,
    this.showAppBar = true,
    this.onBackPressed,
  });

  final String title;
  final List<Widget> children;
  final String confirmText;

  /// null이면 버튼이 비활성 상태로 렌더링된다.
  final VoidCallback? onConfirm;
  final bool isLoading;
  final bool showAppBar;
  final VoidCallback? onBackPressed;

  @override
  Widget build(BuildContext context) {
    final isKeyboardVisible = MediaQuery.viewInsetsOf(context).bottom > 0;

    return Scaffold(
      appBar: showAppBar ? AppBackAppBar(onBackPressed: onBackPressed) : null,
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.fromLTRB(
            AppSpacing.s24,
            AppSpacing.s16,
            AppSpacing.s24,
            isKeyboardVisible ? 0 : AppSpacing.s24,
          ),
          child: LayoutBuilder(
            builder: (context, constraints) {
              return SingleChildScrollView(
                keyboardDismissBehavior:
                    ScrollViewKeyboardDismissBehavior.onDrag,
                child: ConstrainedBox(
                  constraints: BoxConstraints(minHeight: constraints.maxHeight),
                  child: IntrinsicHeight(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: context.appTypography.title1.copyWith(
                            color: context.mainTextColor,
                          ),
                        ),
                        context.vSpace(24),
                        ...children,
                        const Spacer(),
                        ConfirmButton(
                          text: confirmText,
                          isLoading: isLoading,
                          onPressed: isLoading ? null : onConfirm,
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
