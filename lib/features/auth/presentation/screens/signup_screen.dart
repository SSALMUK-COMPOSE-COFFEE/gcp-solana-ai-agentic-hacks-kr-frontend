import 'package:flutter/material.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/core/router/app_router.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/features/auth/presentation/models/auth_flow.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/features/auth/presentation/widgets/auth_base_screen.dart';
import 'package:go_router/go_router.dart';
import 'package:goms_design_system/goms_design_system.dart';

/// 회원가입 1단계: 기본 정보를 받고 이메일로 인증번호를 보낸다.
///
/// 비밀번호는 여기서 받지 않는다. 인증을 통과한 뒤 마지막 단계에서 정한다.
class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _nickname = TextEditingController();
  final _email = TextEditingController();

  /// 제출을 눌러 검증이 한 번 돌기 전까지는 에러를 띄우지 않는다. 입력 도중
  /// 빨간 글씨가 따라다니면 아직 다 치지도 않은 사용자를 다그치는 꼴이 된다.
  bool _showErrors = false;

  late final List<TextEditingController> _controllers = [_nickname, _email];

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

  String? get _nicknameError {
    final value = _nickname.text.trim();
    if (value.isEmpty) return '닉네임을 입력해주세요';
    if (value.length < 2) return '2자 이상 입력해주세요';
    return null;
  }

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
    if (_nicknameError != null || _emailError != null) return;
    context.push(Routes.verificationFor(AuthFlow.signup));
  }

  @override
  Widget build(BuildContext context) {
    return AuthBaseScreen(
      title: '회원가입',
      confirmText: '인증번호 받기',
      onConfirm: _isFilled ? _submit : null,
      children: [
        BaseTextField(
          controller: _nickname,
          hintText: '닉네임을 입력해주세요',
          textInputAction: TextInputAction.next,
          errorText: _showErrors ? _nicknameError : null,
        ),
        AppGap.v16,
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
