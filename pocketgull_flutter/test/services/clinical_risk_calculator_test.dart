import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/services/clinical_risk_calculator.dart';
import 'package:pocketgull_flutter/models/patient_types.dart';

void main() {
  group('Clinical Risk Calculator & Actuarial QALY Suite', () {
    test('calculates low risk for normal baseline vitals', () {
      const vitals = PatientVitals(
        bp: '120/80',
        hr: '72',
        spO2: '98',
        temp: '98.6F',
        weight: '154 lbs',
        height: "5'11\"",
      );

      final result = ClinicalRiskCalculator.calculate(vitals, 35, []);
      expect(result.riskLevel, equals(RiskLevel.low));
      expect(result.score, lessThan(0.5));
    });

    test('calculates critical risk for hypoxia and severe tachycardia', () {
      const vitals = PatientVitals(
        bp: '85/50',
        hr: '135',
        spO2: '89',
        temp: '101.2F',
        weight: '160 lbs',
        height: "5'8\"",
      );

      final result = ClinicalRiskCalculator.calculate(vitals, 68, ['COPD']);
      expect(result.score, greaterThanOrEqualTo(0.5));
      expect(result.contributingFactors, contains(predicate((String s) => s.contains('Hypoxia'))));
    });
  });
}
