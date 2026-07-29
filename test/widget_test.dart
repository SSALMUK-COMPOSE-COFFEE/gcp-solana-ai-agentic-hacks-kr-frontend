import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/app.dart';

void main() {
  /// 스플래시가 타이머로 넘어가므로, 환영 화면이 그려질 때까지 기다린다.
  Future<void> bootToWelcome(WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: App()));
    await tester.pump(const Duration(milliseconds: 1500));
    await tester.pumpAndSettle();
  }

  testWidgets('App boots into the welcome screen', (tester) async {
    await bootToWelcome(tester);

    expect(find.text('로그인'), findsOneWidget);
    expect(find.text('회원가입 하기'), findsOneWidget);
  });

  testWidgets('Welcome screen routes to sign-up', (tester) async {
    await bootToWelcome(tester);

    await tester.tap(find.text('회원가입 하기'));
    await tester.pumpAndSettle();

    expect(find.text('회원가입'), findsOneWidget);
    expect(find.text('인증번호 받기'), findsOneWidget);
  });

  testWidgets('Welcome screen routes to login', (tester) async {
    await bootToWelcome(tester);

    await tester.tap(find.text('로그인'));
    await tester.pumpAndSettle();

    expect(find.text('이메일을 입력해주세요'), findsOneWidget);
    expect(find.text('비밀번호를 입력해주세요'), findsOneWidget);
  });

  /// 인증번호 화면에서 코드를 넣고 넘어간다.
  Future<void> passVerification(WidgetTester tester) async {
    expect(find.text('인증번호'), findsOneWidget);
    expect(find.text('05:00'), findsOneWidget);

    await tester.enterText(find.byType(TextFormField), '123456');
    await tester.pumpAndSettle();
    await tester.tap(find.text('인증'));
    await tester.pumpAndSettle();
  }

  testWidgets('Sign-up flow walks info → verify → password', (tester) async {
    await bootToWelcome(tester);

    await tester.tap(find.text('회원가입 하기'));
    await tester.pumpAndSettle();

    // 비밀번호는 이 단계에서 받지 않는다.
    expect(find.text('비밀번호를 입력해주세요'), findsNothing);

    await tester.enterText(find.byType(TextFormField).at(0), '수연');
    await tester.enterText(find.byType(TextFormField).at(1), 'me@example.com');
    await tester.pumpAndSettle();
    await tester.tap(find.text('인증번호 받기'));
    await tester.pumpAndSettle();

    await passVerification(tester);

    expect(find.text('비밀번호 설정'), findsOneWidget);
    expect(find.text('가입 완료'), findsOneWidget);
  });

  testWidgets('Password recovery flow walks find → verify → reset', (
    tester,
  ) async {
    await bootToWelcome(tester);

    await tester.tap(find.text('로그인'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('비밀번호 찾기'));
    await tester.pumpAndSettle();

    expect(find.text('인증번호 받기'), findsOneWidget);

    await tester.enterText(find.byType(TextFormField), 'me@example.com');
    await tester.pumpAndSettle();
    await tester.tap(find.text('인증번호 받기'));
    await tester.pumpAndSettle();

    await passVerification(tester);

    // 같은 화면이지만 흐름에 따라 제목과 버튼이 달라진다.
    expect(find.text('비밀번호 재설정'), findsOneWidget);
    expect(find.text('비밀번호 변경'), findsOneWidget);
  });
}
