import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pocketgull_flutter/widgets/orp_foveal_reticle_widget.dart';
import 'package:pocketgull_flutter/providers/bionic_reading_provider.dart';

void main() {
  group('OrpFovealReticleWidget Tests', () {
    testWidgets('Renders empty state when no text loaded', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: SingleChildScrollView(
                child: OrpFovealReticleWidget(),
              ),
            ),
          ),
        ),
      );

      expect(find.text('ORP FOVEAL RETICLE'), findsOneWidget);
      expect(find.text('NO TEXT LOADED'), findsOneWidget);
    });

    testWidgets('Renders tokens, ORP center character, and speed chips when text is loaded', (tester) async {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      // Load medical text into provider
      container.read(bionicReadingProvider.notifier).loadText('Patient presents with severe bradycardia and hypertension.');

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(
            home: Scaffold(
              body: SingleChildScrollView(
                child: OrpFovealReticleWidget(),
              ),
            ),
          ),
        ),
      );

      expect(find.text('ORP FOVEAL RETICLE'), findsOneWidget);
      expect(find.textContaining('Token 1 of 7'), findsOneWidget);
      expect(find.text('600 WPM'), findsNWidgets(2)); // Status header + ChoiceChip
      expect(find.text('300 WPM'), findsOneWidget);
      expect(find.text('900 WPM'), findsOneWidget);

      // Verify play button exists and toggles play state
      final playBtn = find.byTooltip('Play RSVP');
      expect(playBtn, findsOneWidget);
      await tester.tap(playBtn);
      await tester.pump();

      expect(container.read(bionicReadingProvider).isPlayingRsvp, isTrue);

      // Clean up timer before finishing test
      container.read(bionicReadingProvider.notifier).pause();
      await tester.pump();
    });
  });
}
