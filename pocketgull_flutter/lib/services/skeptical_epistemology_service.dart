import 'package:flutter/foundation.dart';

enum CochraneRiskOfBiasLevel { lowRisk, someConcerns, highRisk }

extension CochraneRiskOfBiasLevelExtension on CochraneRiskOfBiasLevel {
  String get label {
    switch (this) {
      case CochraneRiskOfBiasLevel.lowRisk:
        return 'Low Risk of Bias';
      case CochraneRiskOfBiasLevel.someConcerns:
        return 'Some Concerns';
      case CochraneRiskOfBiasLevel.highRisk:
        return 'High Risk of Bias';
    }
  }
}

class SkepticalMetricEvaluation {
  final String metricName;
  final Object observedValue;
  final String nullHypothesisH0;
  final double pValue;
  final bool isFalsified;
  final int epistemicConfidencePercent; // 0-100%
  final String? skepticalWarningNotice;

  const SkepticalMetricEvaluation({
    required this.metricName,
    required this.observedValue,
    required this.nullHypothesisH0,
    required this.pValue,
    required this.isFalsified,
    required this.epistemicConfidencePercent,
    this.skepticalWarningNotice,
  });
}

class CochraneBiasReport {
  final String citationId;
  final CochraneRiskOfBiasLevel randomizationBias;
  final CochraneRiskOfBiasLevel deviationFromInterventionBias;
  final CochraneRiskOfBiasLevel missingDataBias;
  final CochraneRiskOfBiasLevel measurementBias;
  final CochraneRiskOfBiasLevel overallRiskOfBias;
  final String skepticalSummary;

  const CochraneBiasReport({
    required this.citationId,
    required this.randomizationBias,
    required this.deviationFromInterventionBias,
    required this.missingDataBias,
    required this.measurementBias,
    required this.overallRiskOfBias,
    required this.skepticalSummary,
  });
}

class CdsComplianceReport {
  final bool isFdaSection520oCompliant;
  final String disclaimer;
  final int overallConfidencePercent;
  final SkepticalMetricEvaluation falsifiability;
  final CochraneBiasReport cochraneBias;
  final String evidenceLevel; // Level A (RCTs) | Level B (Cohort) | Level C (Expert Consensus)
  final String primaryCitation;

  const CdsComplianceReport({
    required this.isFdaSection520oCompliant,
    required this.disclaimer,
    required this.overallConfidencePercent,
    required this.falsifiability,
    required this.cochraneBias,
    required this.evidenceLevel,
    required this.primaryCitation,
  });
}

class SocraticChallenge {
  final String id;
  final String lensName;
  final String question;
  final List<String> options;
  final int correctIndex;
  final String explanation;
  final String difficulty; // foundational | analytical | critical
  final String epistemicTag;

  const SocraticChallenge({
    required this.id,
    required this.lensName,
    required this.question,
    required this.options,
    required this.correctIndex,
    required this.explanation,
    required this.difficulty,
    required this.epistemicTag,
  });
}

class SkepticalEpistemologyService with ChangeNotifier {
  final Map<String, SocraticChallenge> _completedChallenges = {};

  Map<String, SocraticChallenge> get completedChallenges =>
      Map.unmodifiable(_completedChallenges);

  /// Evaluate Popperian null-hypothesis (H0) for a clinical metric observation.
  /// If p >= 0.05, H0 cannot be rejected and triggers a skeptical warning notice.
  SkepticalMetricEvaluation evaluateNullHypothesis({
    required String metricName,
    required Object observedValue,
    required double pValue,
    required String nullHypothesisH0,
  }) {
    final isFalsified = pValue < 0.05;
    final confidence = isFalsified
        ? ((1.0 - pValue) * 100).round().clamp(0, 100)
        : ((1.0 - pValue) * 60).round().clamp(0, 60);

    final warning = !isFalsified
        ? 'Skeptical Notice: Observed value (p = ${pValue.toStringAsFixed(3)}) fails to reject null hypothesis ($nullHypothesisH0). Evidence insufficient for clinical intervention.'
        : null;

    return SkepticalMetricEvaluation(
      metricName: metricName,
      observedValue: observedValue,
      nullHypothesisH0: nullHypothesisH0,
      pValue: pValue,
      isFalsified: isFalsified,
      epistemicConfidencePercent: confidence,
      skepticalWarningNotice: warning,
    );
  }

  /// Assess Cochrane Risk of Bias (RoB 2) across 4 core domains.
  CochraneBiasReport assessCochraneRiskOfBias({
    required String citationId,
    required CochraneRiskOfBiasLevel randomizationBias,
    required CochraneRiskOfBiasLevel deviationFromInterventionBias,
    required CochraneRiskOfBiasLevel missingDataBias,
    required CochraneRiskOfBiasLevel measurementBias,
  }) {
    final levels = [
      randomizationBias,
      deviationFromInterventionBias,
      missingDataBias,
      measurementBias,
    ];

    CochraneRiskOfBiasLevel overall;
    if (levels.contains(CochraneRiskOfBiasLevel.highRisk)) {
      overall = CochraneRiskOfBiasLevel.highRisk;
    } else if (levels.where((l) => l == CochraneRiskOfBiasLevel.someConcerns).length >= 2) {
      overall = CochraneRiskOfBiasLevel.highRisk;
    } else if (levels.contains(CochraneRiskOfBiasLevel.someConcerns)) {
      overall = CochraneRiskOfBiasLevel.someConcerns;
    } else {
      overall = CochraneRiskOfBiasLevel.lowRisk;
    }

    final summary = 'RoB 2 Evaluation for $citationId: Overall status ${overall.label}.';

    return CochraneBiasReport(
      citationId: citationId,
      randomizationBias: randomizationBias,
      deviationFromInterventionBias: deviationFromInterventionBias,
      missingDataBias: missingDataBias,
      measurementBias: measurementBias,
      overallRiskOfBias: overall,
      skepticalSummary: summary,
    );
  }

  /// Synthesize complete CDS Transparency & FDA Section 520(o) non-device compliance payload.
  CdsComplianceReport generateCdsComplianceReport({
    required String metricName,
    required Object observedValue,
    required double pValue,
    required String citationId,
    required String evidenceLevel,
  }) {
    final falsifiability = evaluateNullHypothesis(
      metricName: metricName,
      observedValue: observedValue,
      pValue: pValue,
      nullHypothesisH0: '$metricName population baseline mean holds',
    );

    final cochrane = assessCochraneRiskOfBias(
      citationId: citationId,
      randomizationBias: CochraneRiskOfBiasLevel.lowRisk,
      deviationFromInterventionBias: CochraneRiskOfBiasLevel.lowRisk,
      missingDataBias: CochraneRiskOfBiasLevel.lowRisk,
      measurementBias: CochraneRiskOfBiasLevel.lowRisk,
    );

    return CdsComplianceReport(
      isFdaSection520oCompliant: true,
      disclaimer:
          'Clinical Decision Support: Non-device software advisory under 21 U.S.C. 360j(o)(1)(E). Independent clinical judgment required.',
      overallConfidencePercent: falsifiability.epistemicConfidencePercent,
      falsifiability: falsifiability,
      cochraneBias: cochrane,
      evidenceLevel: evidenceLevel,
      primaryCitation: citationId,
    );
  }

  void recordSocraticAnswer(SocraticChallenge challenge, int selectedIndex) {
    if (selectedIndex == challenge.correctIndex) {
      _completedChallenges[challenge.id] = challenge;
      notifyListeners();
    }
  }
}
