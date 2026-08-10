import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/services/mobile_cgm_time_in_range_service.dart';

void main() {
  group('MobileCgmTimeInRangeService', () {
    final service = MobileCgmTimeInRangeService();

    test('should calculate correct TIR and GMI for glucose readings', () {
      final readings = [85.0, 95.0, 110.0, 130.0, 160.0, 175.0, 210.0];
      final metrics = service.calculateMetrics(readings);

      expect(metrics.timeInRangePercent, greaterThan(80.0));
      expect(metrics.glucoseManagementIndexGmi, greaterThan(5.0));
      expect(metrics.timeAboveRangePercent, greaterThan(0.0));
      expect(metrics.timeBelowRangePercent, equals(0.0));
      expect(metrics.meanGlucoseMgDl, greaterThan(120.0));
      expect(metrics.coefficientOfVariationPercent, lessThan(40.0));
    });

    test('should return default fallback metrics for empty readings', () {
      final metrics = service.calculateMetrics([]);
      expect(metrics.timeInRangePercent, equals(75.0));
      expect(metrics.coefficientOfVariationPercent, equals(28.5));
      expect(metrics.isClinicalTargetMet, isTrue);
    });
  });
}
