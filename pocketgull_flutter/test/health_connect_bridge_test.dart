import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pocketgull_flutter/services/health_connect_bridge_service.dart';
import 'package:pocketgull_flutter/providers/health_connect_provider.dart';
import 'package:pocketgull_flutter/providers/physical_genomics_provider.dart';
import 'package:pocketgull_flutter/services/physical_genomics_mobile_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Health Connect Bridge & Physical Genomics Telemetry Suite', () {
    late HealthConnectBridgeService service;

    setUp(() {
      service = HealthConnectBridgeService();
    });

    test('1. Validates deterministic fallback biometrics conform to clinical baselines', () {
      final bio = service.getDeterministicFallbackBiometrics();

      expect(bio.restingHeartRateBpm, equals(60.0));
      expect(bio.heartRateVariabilityRmssdMs, equals(62.0));
      expect(bio.spO2Percent, equals(98.6));
      expect(bio.dailyStepCount, equals(8450));
      expect(bio.biomechanicalLoadingScore, equals(2.4));
      expect(bio.isSimulated, isTrue);
      expect(bio.dataSource, equals('LOCAL_DETERMINISTIC_HEALTH_CONNECT_FALLBACK'));
    });

    test('2. Accurately maps daily steps to physiological actin filament tension', () {
      expect(service.deriveActinTensionFromSteps(1500), equals(1.2));
      expect(service.deriveActinTensionFromSteps(4200), equals(1.8));
      expect(service.deriveActinTensionFromSteps(8500), equals(2.4));
      expect(service.deriveActinTensionFromSteps(14200), equals(3.1));
    });

    test('3. HealthConnectNotifier initializes and syncs biometrics into Riverpod state', () async {
      final container = ProviderContainer(
        overrides: [
          healthConnectServiceProvider.overrideWithValue(service),
        ],
      );
      addTearDown(container.dispose);

      final notifier = container.read(healthConnectProvider.notifier);
      await notifier.initialize();

      final state = container.read(healthConnectProvider);
      expect(state.isAvailable, isTrue);
      expect(state.status, equals(HealthConnectStatus.synced));
      expect(state.biometrics, isNotNull);
      expect(state.biometrics!.dailyStepCount, equals(8450));
      expect(state.biometrics!.restingHeartRateBpm, equals(60.0));
    });

    test('4. Synchronizes Health Connect biometrics directly into Physical Genomics cellular model', () async {
      final container = ProviderContainer(
        overrides: [
          healthConnectServiceProvider.overrideWithValue(service),
          physicalGenomicsServiceProvider.overrideWithValue(PhysicalGenomicsMobileService()),
        ],
      );
      addTearDown(container.dispose);

      final biometrics = HealthConnectBiometrics(
        restingHeartRateBpm: 72.0,
        heartRateVariabilityRmssdMs: 54.0,
        spO2Percent: 97.8,
        dailyStepCount: 12500,
        biomechanicalLoadingScore: 3.1,
        lastSyncedAt: DateTime.now(),
      );

      final physicalNotifier = container.read(physicalGenomicsProvider.notifier);
      physicalNotifier.synchronizeWithHealthConnect(biometrics);
      await physicalNotifier.evaluatePrediction();

      final physicalState = container.read(physicalGenomicsProvider);
      expect(physicalState.request.actinTensionNn, equals(3.1));
      // ECM stiffness: 8.5 * (72 / 60) = 8.5 * 1.2 = 10.2 kPa
      expect(physicalState.request.ecmStiffnessKpa, equals(10.2));

      // Verify that prediction evaluated with new coupled mechanics
      expect(physicalState.prediction.hasValue, isTrue);
      final prediction = physicalState.prediction.value!;
      expect(prediction.patientId, equals('SYN-PG-MOB-001'));
      expect(prediction.tadInsulationScore, greaterThan(0.50));
    });
  });
}
