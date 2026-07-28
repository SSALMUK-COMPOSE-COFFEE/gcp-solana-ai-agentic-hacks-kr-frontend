import 'package:flutter/material.dart';

/// Seed and semantic color tokens. [AppTheme] derives the Material 3
/// [ColorScheme] from [seed]; the semantic colors below fill gaps Material
/// doesn't cover out of the box (success/warning).
abstract final class AppColors {
  static const Color seed = Color(0xFF6750A4);

  static const Color success = Color(0xFF2E7D32);
  static const Color onSuccess = Color(0xFFFFFFFF);
  static const Color warning = Color(0xFFED6C02);
  static const Color onWarning = Color(0xFFFFFFFF);
}
