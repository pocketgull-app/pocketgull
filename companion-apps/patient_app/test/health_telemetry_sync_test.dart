import 'package:flutter_test/flutter_test.dart';
import 'package:patient_app/core/models/health_telemetry_sync.dart';

void main() {
  group('HealthTelemetrySyncData Model Unit Tests', () {
    test('1. Initializes default HealthKit / Google Fit telemetry values', () {
      final data = HealthTelemetrySyncData.initial();

      expect(data.stepCount, greaterThan(5000));
      expect(data.activeEnergyKcal, greaterThan(300.0));
      expect(data.heartRateBpm, equals(72));
      expect(data.activeTransitMinutes, equals(35));
      expect(data.syncProvider, contains('HealthKit'));
    });

    test('2. Serializes and deserializes correctly via JSON', () {
      final initial = HealthTelemetrySyncData.initial();
      final json = initial.toJson();
      final restored = HealthTelemetrySyncData.fromJson(json);

      expect(restored.stepCount, equals(initial.stepCount));
      expect(restored.activeEnergyKcal, equals(initial.activeEnergyKcal));
      expect(restored.heartRateBpm, equals(initial.heartRateBpm));
      expect(restored.carbonOffsetKgCo2, equals(initial.carbonOffsetKgCo2));
    });
  });
}
