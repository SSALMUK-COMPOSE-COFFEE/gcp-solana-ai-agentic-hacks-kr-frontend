import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:gcp_solana_ai_agentic_hacks_kr_frontend/app.dart';

void main() {
  testWidgets('App boots and shows the home placeholder', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: App()));
    await tester.pumpAndSettle();

    expect(find.text('팬덤 총대 에이전트'), findsOneWidget);
  });
}
