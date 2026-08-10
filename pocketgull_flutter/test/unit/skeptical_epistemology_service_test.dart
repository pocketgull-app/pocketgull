import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/services/skeptical_epistemology_service.dart';

void main() {
  group('SkepticalEpistemologyService Popperian Null-Hypothesis & Cochrane RoB 2 Suite', () {
    late SkepticalEpistemologyService service;

    setUp(() {
      service = SkepticalEpistemologyService();
    });

    test('falsifies null hypothesis when p < 0.05', () {
      final eval = service.evaluateNullHypothesis(
        metricName: 'hs-CRP Elevation',
        observedValue: 4.8,
        pValue: 0.012,
        nullHypothesisH0: 'hs-CRP is normal (<= 1.0 mg/L)',
      );

      expect(eval.isFalsified, isTrue);
      expect(eval.epistemicConfidencePercent, equals(99));
      expect(eval.skepticalWarningNotice, isNull);
    });

    test('retains null hypothesis and triggers warning notice when p >= 0.05', () {
      final eval = service.evaluateNullHypothesis(
        metricName: 'HbA1c Shift',
        observedValue: 0.1,
        pValue: 0.18,
        nullHypothesisH0: 'HbA1c change equals 0',
      );

      expect(eval.isFalsified, isFalse);
      expect(eval.epistemicConfidencePercent, equals(49));
      expect(eval.skepticalWarningNotice, contains('fails to reject null hypothesis'));
    });

    test('evaluates Cochrane Risk of Bias overall rating correctly', () {
      final lowRoB = service.assessCochraneRiskOfBias(
        citationId: 'NEJM-2025-001',
        randomizationBias: CochraneRiskOfBiasLevel.lowRisk,
        deviationFromInterventionBias: CochraneRiskOfBiasLevel.lowRisk,
        missingDataBias: CochraneRiskOfBiasLevel.lowRisk,
        measurementBias: CochraneRiskOfBiasLevel.lowRisk,
      );
      expect(lowRoB.overallRiskOfBias, equals(CochraneRiskOfBiasLevel.lowRisk));

      final highRoB = service.assessCochraneRiskOfBias(
        citationId: 'OBS-2024-099',
        randomizationBias: CochraneRiskOfBiasLevel.someConcerns,
        deviationFromInterventionBias: CochraneRiskOfBiasLevel.highRisk,
        missingDataBias: CochraneRiskOfBiasLevel.lowRisk,
        measurementBias: CochraneRiskOfBiasLevel.lowRisk,
      );
      expect(highRoB.overallRiskOfBias, equals(CochraneRiskOfBiasLevel.highRisk));
    });

    test('synthesizes FDA Section 520(o) CDS compliance report', () {
      final report = service.generateCdsComplianceReport(
        metricName: 'Periodontal SIBI',
        observedValue: 68,
        pValue: 0.005,
        citationId: 'JCP-2025-PARO',
        evidenceLevel: 'Level A (RCTs)',
      );

      expect(report.isFdaSection520oCompliant, isTrue);
      expect(report.disclaimer, contains('21 U.S.C. 360j(o)(1)(E)'));
      expect(report.falsifiability.isFalsified, isTrue);
      expect(report.cochraneBias.overallRiskOfBias, equals(CochraneRiskOfBiasLevel.lowRisk));
    });
  });
}
