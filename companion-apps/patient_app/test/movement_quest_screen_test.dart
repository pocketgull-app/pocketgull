import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:patient_app/features/movement_quest/screens/movement_quest_screen.dart';

void main() {
  testWidgets('MovementQuestScreen renders milestones, breathing pacer, and updates vagal points', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: MovementQuestScreen(),
      ),
    );

    // Initial state check
    expect(find.text('Biophilic Vagal Odyssey'), findsOneWidget);
    expect(find.text('0 pts'), findsOneWidget);
    expect(find.text('PARASYMPATHETIC 4-7-8 BREATHING PACER'), findsOneWidget);
    expect(find.text('Breathe'), findsOneWidget);
    expect(find.text('Canopy Immersion Gate'), findsOneWidget);

    // Tap first milestone 'Arrived 🎯' button
    final arrivedButtons = find.text('Arrived 🎯');
    expect(arrivedButtons, findsWidgets);

    await tester.tap(arrivedButtons.first);
    await tester.pump();

    // Vagal points should increment by 40 pts
    expect(find.text('40 pts'), findsOneWidget);
    expect(find.text('✓ Completed'), findsOneWidget);

    // Test Emergency Sanctuary button toggle
    final sanctuaryButton = find.text('Sanctuary');
    expect(sanctuaryButton, findsOneWidget);

    await tester.tap(sanctuaryButton);
    await tester.pump();

    expect(find.text('Sanctuary Egress Active'), findsOneWidget);
    expect(find.text('Cancel'), findsOneWidget);
  });
}
