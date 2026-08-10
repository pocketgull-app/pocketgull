import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/services/mobile_audio_respiratory_service.dart';

void main() {
  group('MobileAudioRespiratoryService Bio-Acoustics Test Suite', () {
    late MobileAudioRespiratoryService service;

    setUp(() {
      service = MobileAudioRespiratoryService();
    });

    test('classifies normal breathing below thresholds', () {
      final analysis = service.analyzeFrequency(250.0, -35.0);
      expect(analysis.pattern, equals(RespiratoryPattern.normalBreathing));
      expect(analysis.severity, equals('Mild'));
      expect(analysis.toJson()['pattern'], equals('normalBreathing'));
    });

    test('classifies high frequency acoustic stridor (>2000Hz)', () {
      final analysis = service.analyzeFrequency(2400.0, -15.0);
      expect(analysis.pattern, equals(RespiratoryPattern.inspiratoryStridor));
      expect(analysis.severity, equals('Severe'));
    });

    test('classifies expiratory wheeze (400-1600Hz)', () {
      final analysis = service.analyzeFrequency(800.0, -15.0);
      expect(analysis.pattern, equals(RespiratoryPattern.expiratoryWheeze));
      expect(analysis.severity, equals('Moderate'));
    });

    test('classifies explosive cough impulse high energy (> -8dB)', () {
      final analysis = service.analyzeFrequency(300.0, -5.0);
      expect(analysis.pattern, equals(RespiratoryPattern.explosiveCoughBurst));
    });
  });
}
