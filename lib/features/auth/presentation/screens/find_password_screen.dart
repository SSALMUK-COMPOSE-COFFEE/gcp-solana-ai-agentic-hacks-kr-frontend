import 'package:flutter/material.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/router/app_router.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/features/auth/presentation/models/auth_flow.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/features/auth/presentation/widgets/auth_base_screen.dart';
import 'package:go_router/go_router.dart';
import 'package:goms_design_system/goms_design_system.dart';

/// 비밀번호 찾기: 가입한 이메일로 인증번호를 보낸다.
class FindPasswordScreen extends StatefulWidget {
  const FindPasswordScreen({super.key});

  @override
  State<FindPasswordScreen> createState() => _FindPasswordScreenState();
}

class _FindPasswordScreenState extends State<FindPasswordScreen> {
  final _email = TextEditingController();

  bool _showErrors = false;

  @override
  void initState() {
    super.initState();
    _email.addListener(_onChanged);
  }

  @override
  void dispose() {
    _email
      ..removeListener(_onChanged)
      ..dispose();
    super.dispose();
  }

  void _onChanged() => setState(() {});

  String? get _emailError {
    final value = _email.text.trim();
    if (value.isEmpty) return '이메일을 입력해주세요';
    if (!RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(value)) {
      return '잘못된 형식의 이메일입니다';
    }
    return null;
  }

  void _submit() {
    setState(() => _showErrors = true);
    if (_emailError != null) return;
    context.push(Routes.verificationFor(AuthFlow.passwordReset));
  }

  @override
  Widget build(BuildContext context) {
    return AuthBaseScreen(
      title: '비밀번호 찾기',
      confirmText: '인증번호 받기',
      onConfirm: _email.text.trim().isNotEmpty ? _submit : null,
      children: [
        BaseTextField(
          controller: _email,
          hintText: '이메일을 입력해주세요',
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.done,
          errorText: _showErrors ? _emailError : null,
        ),
      ],
    );
  }
}
