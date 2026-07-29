import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:goms_design_system/goms_design_system.dart';

/// 뒤로가기 링크만 있는 앱바.
///
/// 시안의 상단 영역 그대로다. GOMS 원본은 역할(RoleEnum)에 따라 색을 바꾸고
/// 로고 변형을 함께 들고 있었는데, 이 프로젝트에는 해당 개념이 없어 뒤로가기
/// 형태만 남겼다.
class AppBackAppBar extends StatelessWidget implements PreferredSizeWidget {
  const AppBackAppBar({super.key, this.onBackPressed, this.actions});

  final VoidCallback? onBackPressed;
  final List<Widget>? actions;

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    // context.go로 진입해 백스택이 비면 pop이 무동작이 되므로 홈으로 폴백한다.
    final backAction =
        onBackPressed ??
        () => context.canPop() ? context.pop() : context.go('/');

    return AppBar(
      automaticallyImplyLeading: false,
      // 원본은 120이었지만 SUIT가 아닌 폴백 폰트에서는 '돌아가기'가 넘친다.
      // 폰트가 바뀌어도 견디도록 여유를 둔다.
      leadingWidth: 160,
      leading: Padding(
        padding: const EdgeInsets.only(left: AppSpacing.s24),
        child: TextButton(
          onPressed: backAction,
          style: TextButton.styleFrom(
            padding: EdgeInsets.zero,
            alignment: Alignment.centerLeft,
            splashFactory: NoSplash.splashFactory,
            overlayColor: Colors.transparent,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              // 강조색이 아닌 회색으로 둔다. placeholder 회색(sub2)은 배경 대비가
              // 1.6:1이라 누를 수 있는 요소로 안 보여서, 한 단계 진한 sub1을 쓴다.
              // back.svg에는 GOMS 주황이 박혀 있어 색을 넘기지 않으면 그대로 나온다.
              AppIcons.back(width: 24, height: 24, color: AppColors.sub1),
              AppGap.h4,
              Text(
                '돌아가기',
                style: AppTextStyles.text2.copyWith(color: AppColors.sub1),
              ),
            ],
          ),
        ),
      ),
      titleSpacing: 0,
      actions: actions,
    );
  }
}
