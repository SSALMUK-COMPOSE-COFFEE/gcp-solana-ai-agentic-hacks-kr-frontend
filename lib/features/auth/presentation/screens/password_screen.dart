import 'package:flutter/material.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/features/auth/presentation/models/auth_flow.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/features/auth/presentation/widgets/auth_base_screen.dart';
import 'package:goms_design_system/goms_design_system.dart';

/// 비밀번호를 정하는 화면. 회원가입 마지막 단계와 비밀번호 재설정이 같은
/// 폼을 쓰고, 제목과 버튼 문구만 흐름에 따라 달라진다.
class PasswordScreen extends StatefulWidget {
  const PasswordScreen({required this.flow, super.key});

  final AuthFlow flow;

  @override
  State<PasswordScreen> createState() => _PasswordScreenState();
}

class _PasswordScreenState extends State<PasswordScreen> {
  static const _rule = '비밀번호는 6자 이상, 대/소문자, 숫자, 특수문자를 포함해 주세요';

  final _password = TextEditingController();
  final _passwordConfirm = TextEditingController();

  bool _showErrors = false;

  late final List<TextEditingController> _controllers = [
    _password,
    _passwordConfirm,
  ];

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
      _controllers.every((controller) => controller.text.isNotEmpty);

  String? get _passwordError {
    final value = _password.text;
    if (value.isEmpty) return '비밀번호를 입력해주세요';
    if (value.length < 6) return '6자 이상 입력해주세요';
    final hasUpper = RegExp('[A-Z]').hasMatch(value);
    final hasLower = RegExp('[a-z]').hasMatch(value);
    final hasDigit = RegExp('[0-9]').hasMatch(value);
    final hasSymbol = RegExp(r'[^A-Za-z0-9]').hasMatch(value);
    if (!hasUpper || !hasLower || !hasDigit || !hasSymbol) {
      return '대/소문자, 숫자, 특수문자를 모두 포함해주세요';
    }
    return null;
  }

  String? get _passwordConfirmError {
    if (_passwordConfirm.text.isEmpty) return '비밀번호를 다시 입력해주세요';
    if (_passwordConfirm.text != _password.text) return '비밀번호가 일치하지 않아요';
    return null;
  }

  String get _title => widget.flow == AuthFlow.signup ? '비밀번호 설정' : '비밀번호 재설정';

  String get _confirmText =>
      widget.flow == AuthFlow.signup ? '가입 완료' : '비밀번호 변경';

  String get _successMessage => widget.flow == AuthFlow.signup
      ? '회원가입 API 연동 예정입니다'
      : '비밀번호 재설정 API 연동 예정입니다';

  void _submit() {
    setState(() => _showErrors = true);
    if (_passwordError != null || _passwordConfirmError != null) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(_successMessage)));
  }

  @override
  Widget build(BuildContext context) {
    return AuthBaseScreen(
      title: _title,
      confirmText: _confirmText,
      onConfirm: _isFilled ? _submit : null,
      children: [
        PasswordTextField(
          controller: _password,
          hintText: '비밀번호를 입력해주세요',
          errorText: _showErrors ? _passwordError : null,
        ),
        AppGap.v16,
        PasswordTextField(
          controller: _passwordConfirm,
          hintText: '비밀번호를 다시 입력해주세요',
          errorText: _showErrors ? _passwordConfirmError : null,
        ),
        AppGap.v12,
        Text(
          _rule,
          style: context.appTypography.text3.copyWith(color: context.sub2Color),
        ),
      ],
    );
  }
}
