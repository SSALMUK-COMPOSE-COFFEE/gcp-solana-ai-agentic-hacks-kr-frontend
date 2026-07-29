import 'package:flutter/material.dart';
import 'package:goms_design_system/goms_design_system.dart';

/// 인증 화면에서 쓰는 보조 링크(비밀번호 찾기, 재발송 등).
///
/// 글자만 감싼 [GestureDetector]는 글리프가 그려진 픽셀만 히트 테스트해서
/// 글자 사이 빈틈을 누르면 반응하지 않는다. 여백을 주고 [HitTestBehavior.opaque]
/// 로 영역 전체를 받게 해 탭 타겟을 확보한다.
class AuthTextLink extends StatelessWidget {
  const AuthTextLink({required this.label, required this.onTap, super.key});

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.symmetric(
          vertical: AppSpacing.s8,
          horizontal: AppSpacing.s4,
        ),
        child: Text(
          label,
          style: context.appTypography.text3.copyWith(
            color: AppColors.mainColorDeep,
          ),
        ),
      ),
    );
  }
}
