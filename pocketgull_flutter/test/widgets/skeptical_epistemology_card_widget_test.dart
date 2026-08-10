import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/widgets/skeptical_epistemology_card_widget.dart';

void main() {
  testWidgets('SkepticalEpistemologyCardWidget renders H0 falsification badges and Socratic Challenge options', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: SkepticalEpistemologyCardWidget(),
            ),
          ),
        ),
      ),
    );

    expect(find.text('EPISTEMIC FALSIFICATION & ROB 2'), findsOneWidget);
    expect(find.text('H0 Falsified (p < 0.05)'), findsOneWidget);
    expect(find.text('SOCRATIC EVIDENCE CHALLENGE'), findsOneWidget);

    // Tap on option B (correct option)
    final optionB = find.text('If the null hypothesis (H0) were true, there is a 4% chance of observing data this extreme');
    expect(optionB, findsOneWidget);
    await tester.tap(optionB);
    await tester.pump();

    final submitBtn = find.text('Submit Challenge');
    expect(submitBtn, findsOneWidget);
    await tester.tap(submitBtn);
    await tester.pump();

    // Verify explanation box is rendered
    expect(find.textContaining('A p-value measures probability under H0'), findsOneWidget);
  });
}
