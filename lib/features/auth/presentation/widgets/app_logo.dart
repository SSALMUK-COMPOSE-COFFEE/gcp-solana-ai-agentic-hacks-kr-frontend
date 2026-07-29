import 'package:flutter/material.dart';
import 'package:goms_design_system/goms_design_system.dart';

/// 브랜드 마크: 방패 안의 체크.
///
/// 이 서비스가 약속하는 건 "모인 돈이 나가기 전에 검증된다"는 것이라, 팬덤이나
/// 화폐를 그리는 대신 검증을 상징하는 형태로 잡았다. 에셋 대신 직접 그려서
/// 크기와 색을 자유롭게 쓴다.
class AppLogo extends StatelessWidget {
  const AppLogo({
    super.key,
    this.size = 80,
    this.color = AppColors.mainColorDeep,
  });

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return SizedBox.square(
      dimension: size,
      child: CustomPaint(painter: _LogoPainter(color)),
    );
  }
}

class _LogoPainter extends CustomPainter {
  const _LogoPainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    final shield = Path()
      ..moveTo(w * 0.5, h * 0.04)
      ..lineTo(w * 0.92, h * 0.20)
      ..lineTo(w * 0.92, h * 0.52)
      ..cubicTo(w * 0.92, h * 0.76, w * 0.74, h * 0.92, w * 0.5, h * 0.98)
      ..cubicTo(w * 0.26, h * 0.92, w * 0.08, h * 0.76, w * 0.08, h * 0.52)
      ..lineTo(w * 0.08, h * 0.20)
      ..close();

    canvas.drawPath(shield, Paint()..color = color);

    final check = Path()
      ..moveTo(w * 0.31, h * 0.49)
      ..lineTo(w * 0.44, h * 0.63)
      ..lineTo(w * 0.70, h * 0.35);

    canvas.drawPath(
      check,
      Paint()
        ..color = Colors.white
        ..style = PaintingStyle.stroke
        ..strokeWidth = w * 0.10
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round,
    );
  }

  @override
  bool shouldRepaint(_LogoPainter oldDelegate) => oldDelegate.color != color;
}
