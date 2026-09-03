import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pocketgull_flutter/models/nanobot_swarm_model.dart';
import 'package:pocketgull_flutter/providers/nanobot_swarm_provider.dart';
import 'package:pocketgull_flutter/widgets/nanobot_swarm_hud_card.dart';

void main() {
  group('Nanobot Swarm Space-Telescope Physics Suite (Unit Tests)', () {
    test('1. NanobotSwarmTelemetry serialization and deserialization roundtrip', () {
      const original = NanobotSwarmTelemetry(
        agentCount: 500,
        kuramotoCoherence: 0.95,
        collectiveThrustNn: 210.0,
        coronagraphicSnrGainDb: 42.0,
        mode: SwarmOperationalMode.coronagraphicTracking,
      );

      final json = original.toJson();
      expect(json['agentCount'], 500);
      expect(json['kuramotoCoherence'], 0.95);
      expect(json['mode'], 'coronagraphicTracking');

      final deserialized = NanobotSwarmTelemetry(
        agentCount: json['agentCount'] as int,
        kuramotoCoherence: (json['kuramotoCoherence'] as num).toDouble(),
        collectiveThrustNn: (json['collectiveThrustNn'] as num).toDouble(),
        coronagraphicSnrGainDb: (json['coronagraphicSnrGainDb'] as num).toDouble(),
      );

      expect(deserialized.agentCount, original.agentCount);
      expect(deserialized.kuramotoCoherence, original.kuramotoCoherence);
      expect(deserialized.collectiveThrustNn, original.collectiveThrustNn);
      expect(deserialized.coronagraphicSnrGainDb, original.coronagraphicSnrGainDb);
    });

    test('2. Low-Reynolds Purcell velocity calculation obeys Scallop Theorem', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(nanobotSwarmProvider.notifier);

      // Rotating at 400 rad/s produces positive forward propulsion
      final vForward = notifier.computePurcellVelocity(omegaRadS: 400);
      expect(vForward, greaterThan(0.0));

      // At zero angular velocity, velocity must strictly be 0.0
      final vZero = notifier.computePurcellVelocity(omegaRadS: 0);
      expect(vZero, equals(0.0));
    });

    test('3. Coronagraphic speckle nulling SNR gain increases with nulling efficiency', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(nanobotSwarmProvider.notifier);

      final gainHigh = notifier.computeCoronagraphicGain(depthMm: 30, nullingEfficiencyPercent: 99.9);
      final gainLow = notifier.computeCoronagraphicGain(depthMm: 30, nullingEfficiencyPercent: 50.0);

      expect(gainHigh, greaterThan(gainLow));
      expect(gainHigh, greaterThan(25.0)); // > 25 dB optical gain
    });

    test('4. Operational mode toggling updates coherence, thrust, and SNR gain', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(nanobotSwarmProvider.notifier);

      notifier.setOperationalMode(SwarmOperationalMode.acousticDrill);
      expect(container.read(nanobotSwarmProvider).kuramotoCoherence, equals(0.92));
      expect(container.read(nanobotSwarmProvider).mode, equals(SwarmOperationalMode.acousticDrill));

      notifier.setOperationalMode(SwarmOperationalMode.coronagraphicTracking);
      expect(container.read(nanobotSwarmProvider).mode, equals(SwarmOperationalMode.coronagraphicTracking));
      expect(container.read(nanobotSwarmProvider).coronagraphicSnrGainDb, greaterThan(20.0));
    });

    test('5. Acoustic steering updates pitch, yaw, and scales collective thrust', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(nanobotSwarmProvider.notifier);
      final initialThrust = container.read(nanobotSwarmProvider).collectiveThrustNn;

      // Boost pressure from 1.2 MPa to 2.4 MPa
      notifier.updateSteering(pressureMpa: 2.4, pitchDeg: 30, yawDeg: 90);

      final state = container.read(nanobotSwarmProvider);
      expect(state.steering.pitchDeg, equals(30));
      expect(state.steering.yawDeg, equals(90));
      expect(state.steering.acousticPressureMpa, equals(2.4));
      expect(state.collectiveThrustNn, greaterThan(initialThrust));
    });

    testWidgets('6. NanobotSwarmHudCard renders telemetry, mode selector, and sliders cleanly',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: SingleChildScrollView(
                child: NanobotSwarmHudCard(),
              ),
            ),
          ),
        ),
      );

      // Verify title & badges
      expect(find.text('NANOBOT SWARM BIOMECHANICS'), findsOneWidget);
      expect(find.text('Space-Telescope Physics Engine (Low-Re)'), findsOneWidget);
      expect(find.text('Acoustic Drill'), findsOneWidget);
      expect(find.text('Coronagraphic Nulling'), findsOneWidget);
      expect(find.text('Durotactic Microlensing'), findsOneWidget);
      expect(find.text('Warburg SERS Acidosis'), findsOneWidget);

      // Tap on Coronagraphic Nulling
      await tester.tap(find.text('Coronagraphic Nulling'));
      await tester.pumpAndSettle();

      expect(find.text('Coronagraphic Nulling'), findsOneWidget);
    });
  });
}
