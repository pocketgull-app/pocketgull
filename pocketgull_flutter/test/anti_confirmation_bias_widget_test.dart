import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pocketgull_flutter/providers/epistemic_assertion_provider.dart';
import 'package:pocketgull_flutter/widgets/anti_confirmation_bias_widget.dart';

void main() {
  group('EpistemicAssertionNotifier Tests', () {
    test('Initial state contains Patient 1 default assertion with 0 completed exams', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final state = container.read(epistemicAssertionProvider);
      expect(state.assertion.hypothesis, contains('Lumbar intervertebral disc displacement'));
      expect(state.completedExams, isEmpty);
      expect(state.allExamsCompleted, isFalse);
      expect(state.isAttested, isFalse);
      expect(state.attestationDigest, isNull);
    });

    test('Toggling exams updates completion ratio and allows digital attestation', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(epistemicAssertionProvider.notifier);
      final exams = container.read(epistemicAssertionProvider).assertion.disconfirmingPhysicalExams;

      // Complete 1st exam
      notifier.toggleExam(exams[0]);
      expect(container.read(epistemicAssertionProvider).completedExams.length, 1);
      expect(container.read(epistemicAssertionProvider).allExamsCompleted, isFalse);

      // Complete 2nd and 3rd exams
      notifier.toggleExam(exams[1]);
      notifier.toggleExam(exams[2]);
      expect(container.read(epistemicAssertionProvider).allExamsCompleted, isTrue);

      // Perform Part 11 Digital Attestation
      notifier.attestClinicalFalsification('Phil Gear');
      final attestedState = container.read(epistemicAssertionProvider);
      expect(attestedState.isAttested, isTrue);
      expect(attestedState.attestationDigest, isNotNull);
      expect(attestedState.attestationDigest!.length, 16);
    });
  });

  group('AntiConfirmationBiasWidget Widget Tests', () {
    testWidgets('Renders primary hypothesis, 3 counter-hypotheses, and interactive checklist', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: SingleChildScrollView(
                child: AntiConfirmationBiasWidget(),
              ),
            ),
          ),
        ),
      );

      // Verify Header and Badges
      expect(find.text('ANTI-CONFIRMATION BIAS'), findsOneWidget);
      expect(find.text('H₀ p = 0.008'), findsOneWidget);
      expect(find.text('ICD-10: M51.26'), findsOneWidget);
      expect(find.text('SNOMED: 202794008'), findsOneWidget);

      // Verify 3 Counter-Hypotheses
      expect(find.text('▲1'), findsOneWidget);
      expect(find.text('▲2'), findsOneWidget);
      expect(find.text('▲3'), findsOneWidget);
      expect(find.textContaining('Sacroiliac joint dysfunction'), findsOneWidget);
      expect(find.textContaining('Piriformis syndrome'), findsOneWidget);

      // Verify Initial Checklist Progress
      expect(find.text('0 / 3 Verified'), findsOneWidget);
      expect(find.textContaining('Complete all 3 disconfirming physical exam tests'), findsOneWidget);

      // Tap first exam checkbox
      await tester.tap(find.textContaining('Straight Leg Raise (Lasègue sign)').first);
      await tester.pumpAndSettle();
      expect(find.text('1 / 3 Verified'), findsOneWidget);

      // Tap second exam checkbox
      await tester.tap(find.textContaining('Crossed Straight Leg Raise').first);
      await tester.pumpAndSettle();
      expect(find.text('2 / 3 Verified'), findsOneWidget);

      // Tap third exam checkbox
      await tester.tap(find.textContaining('Normal patellar and Achilles').first);
      await tester.pumpAndSettle();
      expect(find.text('3 / 3 Verified'), findsOneWidget);

      // Attest Button is now visible
      final attestBtn = find.text('ATTEST BEDSIDE FALSIFICATION (PART 11)');
      expect(attestBtn, findsOneWidget);

      // Ensure visible in SingleChildScrollView and tap
      await tester.ensureVisible(attestBtn);
      await tester.pumpAndSettle();
      await tester.tap(attestBtn);
      await tester.pumpAndSettle();

      // Part 11 Attested Seal is displayed
      expect(find.text('FDA 21 CFR PART 11 ATTESTED SEAL'), findsOneWidget);
      expect(find.textContaining('DIGEST SHA-256: #'), findsOneWidget);
    });
  });
}
