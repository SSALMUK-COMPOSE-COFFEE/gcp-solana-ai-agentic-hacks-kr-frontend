import 'package:flutter/material.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/router/app_router.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/features/auth/presentation/widgets/auth_base_screen.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/features/auth/presentation/widgets/auth_text_link.dart';
import 'package:go_router/go_router.dart';
import 'package:goms_design_system/goms_design_system.dart';

/// 로그인 폼. `POST /auth/login` 연동은 응답 스키마가 나온 뒤에 붙인다.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();

  bool _showErrors = false;

  late final List<TextEditingController> _controllers = [_email, _password];

  @override
  void initState() {
    super.initState();
    for (final controller in _controllers) {
      controller.addListener(_onChanged);
    }
  }

  @override
  void dispose() {
    for (final controller in _controllers) {
      controller
        ..removeListener(_onChanged)
        ..dispose();
    }
    super.dispose();
  }

  void _onChanged() => setState(() {});

  bool get _isFilled =>
      _controllers.every((controller) => controller.text.trim().isNotEmpty);

  String? get _emailError {
    final value = _email.text.trim();
    if (value.isEmpty) return '이메일을 입력해주세요';
    if (!RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(value)) {
      return '잘못된 형식의 이메일입니다';
    }
    return null;
  }

  String? get _passwordError => _password.text.isEmpty ? '비밀번호를 입력해주세요' : null;

  void _submit() {
    setState(() => _showErrors = true);
    if (_emailError != null || _passwordError != null) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('로그인 API 연동 예정입니다')));
  }

  @override
  Widget build(BuildContext context) {
    return AuthBaseScreen(
      title: '로그인',
      confirmText: '로그인',
      onConfirm: _isFilled ? _submit : null,
      children: [
        BaseTextField(
          controller: _email,
          hintText: '이메일을 입력해주세요',
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.next,
          errorText: _showErrors ? _emailError : null,
        ),
        AppGap.v16,
        PasswordTextField(
          controller: _password,
          hintText: '비밀번호를 입력해주세요',
          errorText: _showErrors ? _passwordError : null,
        ),
        AppGap.v4,
        Align(
          alignment: Alignment.centerRight,
          child: AuthTextLink(
            label: '비밀번호 찾기',
            onTap: () => context.push(Routes.findPassword),
          ),
        ),
      ],
    );
  }
}
