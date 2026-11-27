// SPDX-License-Identifier: Apache-2.0
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/providers/health_connect_provider.dart';
import 'package:pocketgull_flutter/providers/services_providers.dart';
import 'package:pocketgull_flutter/services/capacity_signal_service.dart';
import 'package:pocketgull_flutter/services/health_connect_bridge_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('CapacitySignalService (Zero-PHI Pacing & Runway)', () {
    final service = CapacitySignalService();

    test('computes green/optimal signal when sleep and HRV are strong', () {
      final bio = HealthConnectBiometrics(
        restingHeartRateBpm: 58.0,
        heartRateVariabilityRmssdMs: 68.0,
        spO2Percent: 99.0,
        dailyStepCount: 9000,
        sleepDurationMinutes: 485,
        biomechanicalLoadingScore: 2.4,
        lastSyncedAt: DateTime.utc(2026, 11, 16, 14),
        isSimulated: false,
      );

      final signal = service.compute(biometrics: bio);
      expect(signal.shiftRiskBand, equals(ShiftRiskBand.green));
      expect(signal.pacingAction, equals(ShiftPacingAction.optimal));
      expect(signal.sleepDebtMinutes, equals(0));
      expect(signal.biologicalInterestRate, equals(0.0));
      expect(signal.recommendedMaxFocusMinutes, equals(90));
      expect(signal.isSimulated, isFalse);
    });

    test('computes amber/pace signal on moderate sleep debt', () {
      final bio = HealthConnectBiometrics(
        restingHeartRateBpm: 64.0,
        heartRateVariabilityRmssdMs: 52.0,
        spO2Percent: 98.0,
        dailyStepCount: 6000,
        sleepDurationMinutes: 400, // 80m debt
        biomechanicalLoadingScore: 2.4,
        lastSyncedAt: DateTime.utc(2026, 11, 16, 14),
        isSimulated: false,
      );

      final signal = service.compute(biometrics: bio);
      expect(signal.shiftRiskBand, equals(ShiftRiskBand.amber));
      expect(signal.pacingAction, equals(ShiftPacingAction.pace));
      expect(signal.sleepDebtMinutes, equals(80));
      expect(signal.biologicalInterestRate, equals(1.25));
      expect(signal.recommendedMaxFocusMinutes, equals(45));
    });

    test('computes red/protect signal on severe sleep debt or low coherence', () {
      final bio = HealthConnectBiometrics(
        restingHeartRateBpm: 88.0,
        heartRateVariabilityRmssdMs: 24.0,
        spO2Percent: 96.5,
        dailyStepCount: 2500,
        sleepDurationMinutes: 300, // 180m debt
        biomechanicalLoadingScore: 1.8,
        lastSyncedAt: DateTime.utc(2026, 11, 16, 14),
        isSimulated: false,
      );

      final signal = service.compute(biometrics: bio);
      expect(signal.shiftRiskBand, equals(ShiftRiskBand.red));
      expect(signal.pacingAction, equals(ShiftPacingAction.protect));
      expect(signal.sleepDebtMinutes, equals(180));
      expect(signal.biologicalInterestRate, equals(2.5));
      expect(signal.recommendedMaxFocusMinutes, equals(25));
    });

    test('toJson exports strictly zero-PHI schema', () {
      final bio = HealthConnectBiometrics(
        restingHeartRateBpm: 62.0,
        heartRateVariabilityRmssdMs: 60.0,
        spO2Percent: 98.4,
        dailyStepCount: 8000,
        cgmGlucoseMgDl: 102.0,
        sleepDurationMinutes: 460,
        biomechanicalLoadingScore: 2.4,
        lastSyncedAt: DateTime.utc(2026, 11, 16, 14),
      );

      final json = service.compute(biometrics: bio).toJson();
      expect(json['schema'], equals('pocketgull.capacity.v1'));
      expect(json.containsKey('restingHeartRateBpm'), isFalse);
      expect(json.containsKey('cgmGlucoseMgDl'), isFalse);
      expect(json.containsKey('spO2Percent'), isFalse);
      expect(json.containsKey('patientId'), isFalse);
      expect(json.containsKey('name'), isFalse);
    });

    test('capacitySignalProvider resolves reactively from Riverpod', () async {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      await container.read(healthConnectProvider.notifier).initialize();
      final signal = container.read(capacitySignalProvider);
      expect(signal.autonomicCoherence, inInclusiveRange(0, 100));
      expect(signal.sleepDebtMinutes, greaterThanOrEqualTo(0));
    });
  });
}
