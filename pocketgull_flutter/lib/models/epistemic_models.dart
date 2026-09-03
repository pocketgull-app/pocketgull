/// Pocket-Gull Flutter Epistemic & Anti-Confirmation Bias Models
///
/// Implements strict Popperian falsifiability and anti-premature closure
/// invariants on physical mobile hardware.
library;

enum CochraneRiskOfBiasLevel {
  low('Low Risk of Bias'),
  someConcerns('Some Concerns'),
  high('High Risk of Bias');

  final String label;
  const CochraneRiskOfBiasLevel(this.label);
}

enum EpistemicEvidenceTier {
  levelA('Level A (Replicated RCTs)'),
  levelB('Level B (Cohort / Preliminary RCT)'),
  levelC('Level C (Mechanistic Plausibility)'),
  levelD('Level D (Anecdotal / Unproven)');

  final String label;
  const EpistemicEvidenceTier(this.label);
}

class GroundedCitation {
  final String? pmcid;
  final List<String> meshTerms;
  final String? title;
  final String? fdaApplicationId;

  const GroundedCitation({
    this.pmcid,
    this.meshTerms = const [],
    this.title,
    this.fdaApplicationId,
  });

  Map<String, dynamic> toJson() => {
        if (pmcid != null) 'pmcid': pmcid,
        'meshTerms': meshTerms,
        if (title != null) 'title': title,
        if (fdaApplicationId != null) 'fdaApplicationId': fdaApplicationId,
      };

  factory GroundedCitation.fromJson(Map<String, dynamic> json) =>
      GroundedCitation(
        pmcid: json['pmcid'] as String?,
        meshTerms: (json['meshTerms'] as List<dynamic>?)
                ?.map((e) => e.toString())
                .toList() ??
            const [],
        title: json['title'] as String?,
        fdaApplicationId: json['fdaApplicationId'] as String?,
      );
}

class GroundedClinicalAssertion {
  final String hypothesis;
  final String icd10Code;
  final String snomedCtId;
  final double epistemicConfidence;
  final String nullHypothesisH0;
  final double pValueNullRejection;
  final CochraneRiskOfBiasLevel cochraneRiskOfBias;
  final EpistemicEvidenceTier evidenceTier;

  /// Anti-Confirmation Bias: Exactly 3 orthogonal counter-hypotheses
  final List<String> counterHypotheses;

  /// Bedside maneuvers that would falsify the primary hypothesis
  final List<String> disconfirmingPhysicalExams;

  /// Somatic red flags
  final List<String> redFlagExceptions;

  final List<GroundedCitation> statutoryCitations;
  final DateTime attestationTimestamp;

  const GroundedClinicalAssertion({
    required this.hypothesis,
    required this.icd10Code,
    required this.snomedCtId,
    required this.epistemicConfidence,
    required this.nullHypothesisH0,
    required this.pValueNullRejection,
    required this.cochraneRiskOfBias,
    required this.evidenceTier,
    required this.counterHypotheses,
    required this.disconfirmingPhysicalExams,
    required this.redFlagExceptions,
    this.statutoryCitations = const [],
    required this.attestationTimestamp,
  });

  bool get isStatisticallySignificant => pValueNullRejection < 0.05;

  bool get isFalsified =>
      !isStatisticallySignificant ||
      cochraneRiskOfBias == CochraneRiskOfBiasLevel.high;

  /// Validates the assertion against clinical governance rules
  List<String> validate() {
    final errors = <String>[];
    if (hypothesis.trim().length < 5) {
      errors.add('Hypothesis must be at least 5 characters');
    }
    if (epistemicConfidence < 0.0 || epistemicConfidence > 1.0) {
      errors.add('Epistemic confidence must be between 0.0 and 1.0');
    }
    if (counterHypotheses.length != 3) {
      errors.add('Must provide exactly 3 orthogonal counter-hypotheses');
    }
    if (disconfirmingPhysicalExams.isEmpty) {
      errors.add('Must provide at least one disconfirming physical exam maneuver');
    }
    return errors;
  }

  static GroundedClinicalAssertion defaultForPatient1() {
    return GroundedClinicalAssertion(
      hypothesis:
          'Lumbar intervertebral disc displacement (L4-L5 posterior protrusion)',
      icd10Code: 'M51.26',
      snomedCtId: '202794008',
      epistemicConfidence: 0.88,
      nullHypothesisH0:
          'Observed radicular symptoms and disc protrusion are incidental age-related variants without true nerve root impingement.',
      pValueNullRejection: 0.008,
      cochraneRiskOfBias: CochraneRiskOfBiasLevel.low,
      evidenceTier: EpistemicEvidenceTier.levelA,
      counterHypotheses: const [
        'Sacroiliac joint dysfunction with pseudoradicular referral',
        'Piriformis syndrome with sciatic nerve entrapment',
        'Thoracolumbar junction syndrome (Maigne syndrome) referred to lower lumbar spine'
      ],
      disconfirmingPhysicalExams: const [
        'Straight Leg Raise (Lasègue sign) negative at > 70 degrees',
        'Crossed Straight Leg Raise negative for contralateral radiculopathy',
        'Normal patellar and Achilles deep tendon reflexes (2+ bilaterally)'
      ],
      redFlagExceptions: const [
        'Cauda equina syndrome: new urinary retention or overflow incontinence',
        'Progressive motor deficit: rapid foot drop (L5 tibialis anterior weakness)',
        'Saddle anesthesia in S3-S5 distribution'
      ],
      statutoryCitations: const [
        GroundedCitation(
          pmcid: 'PMC4464797',
          meshTerms: [
            'Intervertebral Disc Displacement',
            'Magnetic Resonance Imaging',
            'Radiculopathy'
          ],
          title:
              'Systematic review of diagnostic accuracy of clinical tests for lumbar disc herniation',
        )
      ],
      attestationTimestamp: DateTime.now(),
    );
  }
}

/// Demographically and physiologically calibrated vital thresholds
/// to eliminate "Reference Man" baseline bias.
class AdaptiveVitalThresholds {
  final int minHr;
  final int maxHr;
  final double minSpO2;
  final double minCgmMgDl;
  final double maxCgmMgDl;
  final bool isAthleticConditioning;
  final List<String> clinicalNotes;

  const AdaptiveVitalThresholds({
    required this.minHr,
    required this.maxHr,
    required this.minSpO2,
    required this.minCgmMgDl,
    required this.maxCgmMgDl,
    required this.isAthleticConditioning,
    required this.clinicalNotes,
  });

  factory AdaptiveVitalThresholds.calibrate({
    required int age,
    required double restingHr,
    required double hrvMs,
  }) {
    final isAthletic = restingHr <= 55 && hrvMs >= 50;
    final minHr = isAthletic ? 42 : (age > 65 ? 48 : 50);
    final maxHr = age > 75 ? 95 : 100;
    final minSpO2 = age > 70 ? 93.0 : 95.0;
    const minCgm = 70.0;
    final maxCgm = age > 65 ? 190.0 : 180.0;

    final notes = <String>[];
    if (isAthletic) {
      notes.add(
        'Physiological athletic vagal tone detected: resting bradycardia is normal adaptation.',
      );
    }
    if (age > 65) {
      notes.add(
        'Age-adjusted geriatric glycemic and oxygenation targets applied.',
      );
    }

    return AdaptiveVitalThresholds(
      minHr: minHr,
      maxHr: maxHr,
      minSpO2: minSpO2,
      minCgmMgDl: minCgm,
      maxCgmMgDl: maxCgm,
      isAthleticConditioning: isAthletic,
      clinicalNotes: notes,
    );
  }
}
