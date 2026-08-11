import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/services/mobile_camera_pulse_service.dart';

void main() {
  group('MobileCameraPulseService Tests', () {
    late MobileCameraPulseService service;

    setUp(() {
      service = MobileCameraPulseService();
    });

    test('computeWaveformSample returns clamped normalized double', () {
      final sample = service.computeWaveformSample(0.5);
      expect(sample, greaterThanOrEqualTo(0.0));
      expect(sample, lessThanOrEqualTo(1.0));
    });

    test('calculateReading returns valid CameraPulseReading metadata', () {
      final reading = service.calculateReading(targetBpmBase: 75.0);

      expect(reading.heartRateBpm, greaterThanOrEqualTo(45));
      expect(reading.heartRateBpm, lessThanOrEqualTo(185));
      expect(reading.signalConfidence, greaterThanOrEqualTo(0.85));
      expect(reading.signalConfidence, lessThanOrEqualTo(1.0));
      expect(reading.hrvMs, greaterThanOrEqualTo(30));
      expect(reading.rhythmStatus, isNotEmpty);
      expect(reading.timestamp, isNotNull);
    });

    test('rhythmStatus correctly labels Tachycardia vs Bradycardia vs Normal', () {
      final tachy = service.calculateReading(targetBpmBase: 110.0, noiseVariance: 0.0);
      expect(tachy.rhythmStatus, equals('Sinus Tachycardia'));

      final brady = service.calculateReading(targetBpmBase: 50.0, noiseVariance: 0.0);
      expect(brady.rhythmStatus, equals('Sinus Bradycardia'));

      final normal = service.calculateReading(targetBpmBase: 75.0, noiseVariance: 0.0);
      expect(normal.rhythmStatus, equals('Normal Sinus Rhythm'));
    });
  });
}
