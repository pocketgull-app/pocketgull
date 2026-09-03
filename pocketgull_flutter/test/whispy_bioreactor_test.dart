import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pocketgull_flutter/models/whispy_bioreactor_model.dart';
import 'package:pocketgull_flutter/providers/whispy_bioreactor_provider.dart';
import 'package:pocketgull_flutter/widgets/whispy_bioreactor_hud_card.dart';

void main() {
  group('Whispy Healing Swarm Bioreactor Suite (Unit Tests)', () {
    test('1. AcousticContainmentTelemetry and Config serialization roundtrip', () {
      const config = BioreactorTankConfig(
        transducerFrequencyKhz: 320.0,
        acousticPressureMpa: 2.1,
        bioelectricFieldMvMm: 90.0,
      );

      final configJson = config.toJson();
      expect(configJson['transducerFrequencyKhz'], 320.0);
      expect(configJson['acousticPressureMpa'], 2.1);
      expect(configJson['bioelectricFieldMvMm'], 90.0);

      const telemetry = AcousticContainmentTelemetry(
        phase: BioreactorPhase.solGelCrosslink,
        chamberPressureKpa: 101.5,
        gorkovPotentialNn: 24.2,
        gelationFraction: 0.86,
        config: config,
      );

      final json = telemetry.toJson();
      expect(json['phase'], 'solGelCrosslink');
      expect(json['chamberPressureKpa'], 101.5);
      expect(json['gelationFraction'], 0.86);
    });

    test('2. Gor\'kov acoustic potential calculation scales with pressure', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(whispyBioreactorProvider.notifier);

      final lowPressurePotential = notifier.computeGorkovPotential(
        pressureMpa: 1.0,
        radiusUm: 1.8,
      );
      final highPressurePotential = notifier.computeGorkovPotential(
        pressureMpa: 2.0,
        radiusUm: 1.8,
      );

      expect(lowPressurePotential, greaterThan(0.0));
      expect(highPressurePotential, greaterThan(lowPressurePotential));
    });

    test('3. Advances sequentially through all 6 manufacturing phases', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(whispyBioreactorProvider.notifier);

      expect(container.read(whispyBioreactorProvider).phase, equals(BioreactorPhase.scanIngestion));

      notifier.advancePhase();
      expect(container.read(whispyBioreactorProvider).phase, equals(BioreactorPhase.mistInoculation));
      expect(container.read(whispyBioreactorProvider).dropletDensityCm3, greaterThan(1e6));

      notifier.advancePhase();
      expect(container.read(whispyBioreactorProvider).phase, equals(BioreactorPhase.acousticSculpting));
      expect(container.read(whispyBioreactorProvider).isAcousticFieldLocked, isTrue);

      notifier.advancePhase();
      expect(container.read(whispyBioreactorProvider).phase, equals(BioreactorPhase.solGelCrosslink));
      expect(container.read(whispyBioreactorProvider).gelationFraction, greaterThan(0.8));

      notifier.advancePhase();
      expect(container.read(whispyBioreactorProvider).phase, equals(BioreactorPhase.bioelectricPolarization));

      notifier.advancePhase();
      expect(container.read(whispyBioreactorProvider).phase, equals(BioreactorPhase.harvestReady));
      expect(container.read(whispyBioreactorProvider).chamberPressureKpa, lessThan(100.0)); // Vacuum egress
    });

    test('4. Resets chamber and updates acoustic pressure', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(whispyBioreactorProvider.notifier);

      notifier.advancePhase();
      notifier.advancePhase();
      expect(container.read(whispyBioreactorProvider).phase, equals(BioreactorPhase.acousticSculpting));

      notifier.resetChamber();
      expect(container.read(whispyBioreactorProvider).phase, equals(BioreactorPhase.scanIngestion));

      notifier.updateAcousticPressure(2.2);
      expect(container.read(whispyBioreactorProvider).config.acousticPressureMpa, equals(2.2));
    });

    testWidgets('5. WhispyBioreactorHudCard renders telemetry, phase badge, and buttons cleanly',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: SingleChildScrollView(
                child: WhispyBioreactorHudCard(),
              ),
            ),
          ),
        ),
      );

      // Verify Header & Badges
      expect(find.text('ACOUSTIC BIOREACTOR TANK'), findsOneWidget);
      expect(find.text('Scan-Inverted Volumetric Assembly'), findsOneWidget);
      expect(find.text('PAT. PEND.'), findsOneWidget);
      expect(find.text('1. Scan Ingestion'), findsOneWidget);
      expect(find.text('ADVANCE PHASE'), findsOneWidget);
      expect(find.text('RESET'), findsOneWidget);

      // Tap Advance Phase
      await tester.tap(find.text('ADVANCE PHASE'));
      await tester.pumpAndSettle();

      expect(find.text('2. Mist Inoculation'), findsOneWidget);
    });
  });
}
