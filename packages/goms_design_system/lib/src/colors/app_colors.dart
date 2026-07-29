import 'package:flutter/material.dart';

/// 앱 컬러 시스템
class AppColors {
  AppColors._();

  // ==================== Themes ====================
  /// Primary. 넓은 면(버튼 배경 등)에 쓰는 밝은 민트.
  ///
  /// 밝아서 글자색으로는 못 쓴다. 흰 글씨를 얹으면 대비가 1.3:1까지 떨어져
  /// 읽히지 않으므로, 이 색 위의 글자는 [mainText]를 쓰고 글자·링크·아이콘
  /// 자체에는 [mainColorDeep]을 쓴다.
  static const Color mainColor = Color(0xFFC1EBE9);

  /// 글자·링크·아이콘용 진한 민트. 배경 위에서 5.5:1로 읽힌다.
  static const Color mainColorDeep = Color(0xFF1F726D);

  /// Admin
  static const Color admin = Color(0xFFB486F9);

  /// Negative
  static const Color negative = Color(0xFFE23A24);

  /// backgroundColor - Light mode
  static const Color background = Color(0xFFFAFAFA);

  /// backgroundColor - Dark mode
  static const Color backgroundDark = Color(0xFF0D0D0D);

  // ==================== Light mode ====================
  /// bg-surface
  static const Color bgSurface = Color(0xFFF3F3F3);

  /// Button
  static const Color button = Color(0xFFDEDEDE);

  /// sub-2
  static const Color sub2 = Color(0xFFC8C8C8);

  /// sub-1
  static const Color sub1 = Color(0xFF737373);

  /// Main text
  static const Color mainText = Color(0xFF494949);

  // ==================== Dark mode ====================
  /// bg-surface
  static const Color bgSurfaceDark = Color(0xFF191919);

  /// Button
  static const Color buttonDark = Color(0xFF343434);

  /// sub-2
  static const Color sub2Dark = Color(0xFF5F5F5F);

  /// sub-1
  static const Color sub1Dark = Color(0xFFB0B0B0);

  /// Main text
  static const Color mainTextDark = Color(0xFFFAFAFA);

  /// 장소 컨테이너 배경색 다크모드
  static const Color bgMapContainerDark = Color(0xFF1F1F1F);

  /// 장소 컨테이너 배경색
  static const Color bgMapContainer = Color(0xFFEBEBEB);

  /// g-3
  static const Color gray3 = Color(0xFFA1A1A1);

  static const Color blue = Color(0xFF007AFF);
}
