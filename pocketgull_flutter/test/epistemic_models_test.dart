import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/models/epistemic_models.dart';

void main() {
  group('GroundedClinicalAssertion (Flutter Parity)', () {
    test('Default Patient 1 assertion is statistically valid and compliant', () {
      final assertion = GroundedClinicalAssertion.defaultForPatient1();

      expect(assertion.validate(), isEmpty);
      expect(assertion.counterHypotheses.length, 3);
      expect(assertion.isStatisticallySignificant, isTrue);
      expect(assertion.isFalsified, isFalse);
      expect(assertion.pValueNullRejection, lessThan(0.05));
      expect(assertion.cochraneRiskOfBias, CochraneRiskOfBiasLevel.low);
    });

    test('Validation catches missing counter-hypotheses (Anti-Premature Closure)', () {
      final invalidAssertion = GroundedClinicalAssertion(
        hypothesis: 'L4-L5 disc protrusion',
        icd10Code: 'M51.26',
        snomedCtId: '202794008',
        epistemicConfidence: 0.90,
        nullHypothesisH0: 'Incidental bulge',
        pValueNullRejection: 0.01,
        cochraneRiskOfBias: CochraneRiskOfBiasLevel.low,
        evidenceTier: EpistemicEvidenceTier.levelA,
        counterHypotheses: const ['Only 1 differential'],
        disconfirmingPhysicalExams: const ['Negative SLR'],
        redFlagExceptions: const ['Cauda equina'],
        attestationTimestamp: DateTime.now(),
      );

      final errors = invalidAssertion.validate();
      expect(errors, isNotEmpty);
      expect(errors.any((e) => e.contains('3 orthogonal counter-hypotheses')), isTrue);
    });

    test('Flags non-significant p-values as falsified / non-causal', () {
      final nonSigAssertion = GroundedClinicalAssertion(
        hypothesis: 'Experimental frequency therapy for lumbar radiculopathy',
        icd10Code: 'M51.26',
        snomedCtId: '202794008',
        epistemicConfidence: 0.40,
        nullHypothesisH0: 'Therapy outcome does not exceed placebo noise',
        pValueNullRejection: 0.22,
        cochraneRiskOfBias: CochraneRiskOfBiasLevel.high,
        evidenceTier: EpistemicEvidenceTier.levelD,
        counterHypotheses: const [
          'Diff 1',
          'Diff 2',
          'Diff 3'
        ],
        disconfirmingPhysicalExams: const ['No improvement in 14 days'],
        redFlagExceptions: const ['Progressive weakness'],
        attestationTimestamp: DateTime.now(),
      );

      expect(nonSigAssertion.isStatisticallySignificant, isFalse);
      expect(nonSigAssertion.isFalsified, isTrue);
    });

    test('AdaptiveVitalThresholds calibrates physiological vagal tone in athletic conditioning', () {
      final athleticProfile = AdaptiveVitalThresholds.calibrate(
        age: 38,
        restingHr: 48.0,
        hrvMs: 65.0,
      );

      expect(athleticProfile.isAthleticConditioning, isTrue);
      expect(athleticProfile.minHr, 42); // Allows resting HR down to 42 bpm
      expect(athleticProfile.clinicalNotes.any((n) => n.contains('athletic vagal tone')), isTrue);
    });

    test('AdaptiveVitalThresholds applies age-stratified targets in older adults', () {
      final geriatricProfile = AdaptiveVitalThresholds.calibrate(
        age: 72,
        restingHr: 72.0,
        hrvMs: 30.0,
      );

      expect(geriatricProfile.isAthleticConditioning, isFalse);
      expect(geriatricProfile.minSpO2, 93.0); // Calibrated to 93% for age > 70
      expect(geriatricProfile.maxCgmMgDl, 190.0); // Calibrated for age > 65
    });
  });
}
