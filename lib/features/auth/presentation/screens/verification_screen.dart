import 'dart:async';

import 'package:flutter/material.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/router/app_router.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/features/auth/presentation/models/auth_flow.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/features/auth/presentation/widgets/auth_base_screen.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/features/auth/presentation/widgets/auth_text_link.dart';
import 'package:go_router/go_router.dart';
import 'package:goms_design_system/goms_design_system.dart';

/// 이메일로 받은 인증번호 입력. 제한 시간이 지나면 재발송만 가능하다.
class VerificationScreen extends StatefulWidget {
  const VerificationScreen({required this.flow, super.key});

  /// 회원가입에서 왔는지 비밀번호 찾기에서 왔는지. 인증 후 목적지가 갈린다.
  final AuthFlow flow;

  @override
  State<VerificationScreen> createState() => _VerificationScreenState();
}

class _VerificationScreenState extends State<VerificationScreen> {
  static const _limit = Duration(minutes: 5);

  final _code = TextEditingController();

  Timer? _ticker;
  Duration _remaining = _limit;
  bool _showErrors = false;

  @override
  void initState() {
    super.initState();
    _code.addListener(_onChanged);
    _startTimer();
  }

  @override
  void dispose() {
    _ticker?.cancel();
    _code
      ..removeListener(_onChanged)
      ..dispose();
    super.dispose();
  }

  void _onChanged() => setState(() {});

  void _startTimer() {
    _ticker?.cancel();
    setState(() => _remaining = _limit);
    _ticker = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remaining.inSeconds <= 1) {
        timer.cancel();
        setState(() => _remaining = Duration.zero);
        return;
      }
      setState(() => _remaining -= const Duration(seconds: 1));
    });
  }

  bool get _isExpired => _remaining == Duration.zero;

  String get _formattedRemaining {
    final minutes = _remaining.inMinutes.toString().padLeft(2, '0');
    final seconds = (_remaining.inSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  String? get _codeError {
    if (_code.text.trim().isEmpty) return '인증번호를 입력해주세요';
    if (_isExpired) return '인증 시간이 지났어요. 재발송해 주세요';
    return null;
  }

  void _resend() {
    _startTimer();
    setState(() => _showErrors = false);
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('인증번호를 다시 보냈어요')));
  }

  void _submit() {
    setState(() => _showErrors = true);
    if (_codeError != null) return;
    context.push(Routes.passwordFor(widget.flow));
  }

  @override
  Widget build(BuildContext context) {
    return AuthBaseScreen(
      title: '인증번호',
      confirmText: '인증',
      onConfirm: _code.text.trim().isNotEmpty ? _submit : null,
      children: [
        BaseTextField(
          controller: _code,
          hintText: '인증번호를 입력해주세요',
          keyboardType: TextInputType.number,
          textInputAction: TextInputAction.done,
          errorText: _showErrors ? _codeError : null,
        ),
        AppGap.v12,
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              _formattedRemaining,
              style: context.appTypography.text3.copyWith(
                color: _isExpired ? AppColors.negative : context.sub2Color,
              ),
            ),
            AuthTextLink(label: '재발송', onTap: _resend),
          ],
        ),
      ],
    );
  }
}
