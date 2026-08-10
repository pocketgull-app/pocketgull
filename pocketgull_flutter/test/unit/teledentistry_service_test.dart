import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/services/teledentistry_service.dart';

void main() {
  group('TeledentistryService FDI & Systemic Inflammatory Burden Index (SIBI) Suite', () {
    late TeledentistryService service;

    setUp(() {
      service = TeledentistryService();
    });

    test('initializes FDI 32-tooth odontogram with baseline demo state', () {
      expect(service.teeth.length, equals(32));
      final tooth16 = service.teeth.firstWhere((t) => t.fdiNumber == 16);
      expect(tooth16.probingDepthMm, equals(5.0));
      expect(tooth16.hasBleedingOnProbing, isTrue);
      expect(tooth16.cariesSurfaces, contains(ToothSurface.O));
      expect(tooth16.cariesSurfaces, contains(ToothSurface.M));
    });

    test('calculates deep pockets count (PPD >= 4mm)', () {
      // Baseline teeth 16, 26, 46 have PPD >= 4mm
      expect(service.deepPocketsCount, equals(3));
    });

    test('calculates Bleeding on Probing percentage (BOP %)', () {
      // 3 teeth out of 32 have BOP baseline
      final expectedBopPct = (3.0 / 32.0) * 100.0;
      expect(service.bleedingPercentage, closeTo(expectedBopPct, 0.01));
    });

    test('calculates Systemic Inflammatory Burden Index (SIBI 0-100)', () {
      final sibi = service.sibiScore;
      expect(sibi, greaterThan(0));
      expect(sibi, lessThanOrEqualTo(100));
    });

    test('calculates Cardiovascular Risk Multiplier and HbA1c elevation', () {
      expect(service.cvRiskMultiplier, greaterThanOrEqualTo(1.0));
      expect(service.cvRiskMultiplier, lessThanOrEqualTo(2.8));
      expect(service.predictedHbA1cElevation, greaterThanOrEqualTo(0.0));
      expect(service.predictedHbA1cElevation, lessThanOrEqualTo(0.8));
    });

    test('toggles surface caries and probing depth mutations', () {
      service.toggleSurface(11, ToothSurface.F);
      final tooth11 = service.teeth.firstWhere((t) => t.fdiNumber == 11);
      expect(tooth11.cariesSurfaces, contains(ToothSurface.F));

      service.setProbingDepth(11, 6.0);
      expect(service.teeth.firstWhere((t) => t.fdiNumber == 11).probingDepthMm, equals(6.0));
      expect(service.deepPocketsCount, equals(4));
    });
  });
}
