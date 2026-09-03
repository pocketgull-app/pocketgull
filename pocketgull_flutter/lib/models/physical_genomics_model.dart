import 'package:equatable/equatable.dart';

/// Physical Genomics Multi-Task Model for Flutter Mobile Companion (Dart 3)
///
/// Encapsulates biophysical parameters, conformal uncertainty bounds,
/// and pharmacological rescue telemetry.

class PhysicalGenomicsRequest extends Equatable {
  final String patientId;
  final double ecmStiffnessKpa;
  final double actinTensionNn;
  final String epigeneticState;
  final double med1ConcUm;
  final double brd4ConcUm;
  final double polIiConcUm;
  final double cohesinSpeedKbS;
  final double ctcfPermeability;
  final bool hasCtcfMutation;
  final String crisprGuideRna;
  final String crisprTargetDna;
  final double superhelicalSigma;

  const PhysicalGenomicsRequest({
    this.patientId = 'SYN-PG-MOB-001',
    this.ecmStiffnessKpa = 8.5,
    this.actinTensionNn = 2.4,
    this.epigeneticState = 'HYPERACETYLATED_H3K27AC',
    this.med1ConcUm = 4.5,
    this.brd4ConcUm = 3.2,
    this.polIiConcUm = 1.8,
    this.cohesinSpeedKbS = 1.0,
    this.ctcfPermeability = 0.20,
    this.hasCtcfMutation = false,
    this.crisprGuideRna = 'GACUUGACAGUCUACGAUCG',
    this.crisprTargetDna = 'GACTTGACAGTCTACGATCG',
    this.superhelicalSigma = -0.06,
  });

  Map<String, dynamic> toJson() => {
    'patient_id': patientId,
    'ecm_stiffness_kpa': ecmStiffnessKpa,
    'actin_tension_nn': actinTensionNn,
    'epigenetic_state': epigeneticState,
    'med1_conc_um': med1ConcUm,
    'brd4_conc_um': brd4ConcUm,
    'pol_ii_conc_um': polIiConcUm,
    'cohesin_speed_kb_s': cohesinSpeedKbS,
    'ctcf_permeability': ctcfPermeability,
    'has_ctcf_mutation': hasCtcfMutation,
    'crispr_guide_rna': crisprGuideRna,
    'crispr_target_dna': crisprTargetDna,
    'superhelical_sigma': superhelicalSigma,
  };

  PhysicalGenomicsRequest copyWith({
    String? patientId,
    double? ecmStiffnessKpa,
    double? actinTensionNn,
    String? epigeneticState,
    double? med1ConcUm,
    double? brd4ConcUm,
    double? polIiConcUm,
    double? cohesinSpeedKbS,
    double? ctcfPermeability,
    bool? hasCtcfMutation,
    String? crisprGuideRna,
    String? crisprTargetDna,
    double? superhelicalSigma,
  }) {
    return PhysicalGenomicsRequest(
      patientId: patientId ?? this.patientId,
      ecmStiffnessKpa: ecmStiffnessKpa ?? this.ecmStiffnessKpa,
      actinTensionNn: actinTensionNn ?? this.actinTensionNn,
      epigeneticState: epigeneticState ?? this.epigeneticState,
      med1ConcUm: med1ConcUm ?? this.med1ConcUm,
      brd4ConcUm: brd4ConcUm ?? this.brd4ConcUm,
      polIiConcUm: polIiConcUm ?? this.polIiConcUm,
      cohesinSpeedKbS: cohesinSpeedKbS ?? this.cohesinSpeedKbS,
      ctcfPermeability: ctcfPermeability ?? this.ctcfPermeability,
      hasCtcfMutation: hasCtcfMutation ?? this.hasCtcfMutation,
      crisprGuideRna: crisprGuideRna ?? this.crisprGuideRna,
      crisprTargetDna: crisprTargetDna ?? this.crisprTargetDna,
      superhelicalSigma: superhelicalSigma ?? this.superhelicalSigma,
    );
  }

  @override
  List<Object?> get props => [
    patientId,
    ecmStiffnessKpa,
    actinTensionNn,
    epigeneticState,
    med1ConcUm,
    brd4ConcUm,
    polIiConcUm,
    cohesinSpeedKbS,
    ctcfPermeability,
    hasCtcfMutation,
    crisprGuideRna,
    crisprTargetDna,
    superhelicalSigma,
  ];
}

class ConformalIntervalModel extends Equatable {
  final double lower95;
  final double estimate;
  final double upper95;

  const ConformalIntervalModel({
    required this.lower95,
    required this.estimate,
    required this.upper95,
  });

  factory ConformalIntervalModel.fromJson(Map<String, dynamic> json) {
    return ConformalIntervalModel(
      lower95: (json['lower_95'] as num?)?.toDouble() ?? 0.0,
      estimate: (json['estimate'] as num?)?.toDouble() ?? 0.0,
      upper95: (json['upper_95'] as num?)?.toDouble() ?? 0.0,
    );
  }

  @override
  List<Object?> get props => [lower95, estimate, upper95];
}

class PhysicalGenomicsPrediction extends Equatable {
  final String patientId;
  final String timestampUtc;
  final double tadInsulationScore;
  final double fractalGlobuleGamma;
  final double meanLoopSpanKb;
  final int activeLoopsCount;
  final bool isPhaseSeparated;
  final double dropletRadiusNm;
  final double polIiEnrichmentFold;
  final double cSatThresholdUm;
  final double rLoopNetDeltaGKcalMol;
  final double cleavageProbability;
  final int mismatchCount;
  final bool seedMismatchDetected;
  final double outerTurnUnwrappingForcePn;
  final double innerCoreRuptureForcePn;
  final double lincForcePn;
  final double nuclearPoreDiameterNm;
  final double yapTazNuclearRatio;
  final String transcriptionalMechanostate;
  final Map<String, ConformalIntervalModel> conformalIntervals;
  final String cryptographicSha256Attestation;

  const PhysicalGenomicsPrediction({
    required this.patientId,
    required this.timestampUtc,
    required this.tadInsulationScore,
    required this.fractalGlobuleGamma,
    required this.meanLoopSpanKb,
    required this.activeLoopsCount,
    required this.isPhaseSeparated,
    required this.dropletRadiusNm,
    required this.polIiEnrichmentFold,
    required this.cSatThresholdUm,
    required this.rLoopNetDeltaGKcalMol,
    required this.cleavageProbability,
    required this.mismatchCount,
    required this.seedMismatchDetected,
    required this.outerTurnUnwrappingForcePn,
    required this.innerCoreRuptureForcePn,
    required this.lincForcePn,
    required this.nuclearPoreDiameterNm,
    required this.yapTazNuclearRatio,
    required this.transcriptionalMechanostate,
    required this.conformalIntervals,
    required this.cryptographicSha256Attestation,
  });

  factory PhysicalGenomicsPrediction.fromJson(Map<String, dynamic> json) {
    final conformal = <String, ConformalIntervalModel>{};
    if (json['conformal_intervals'] is Map<String, dynamic>) {
      (json['conformal_intervals'] as Map<String, dynamic>).forEach((k, v) {
        if (v is Map<String, dynamic>) {
          conformal[k] = ConformalIntervalModel.fromJson(v);
        }
      });
    }

    return PhysicalGenomicsPrediction(
      patientId: json['patient_id'] as String? ?? 'ANON',
      timestampUtc: json['timestamp_utc'] as String? ?? '',
      tadInsulationScore: (json['tad_insulation_score'] as num?)?.toDouble() ?? 0.82,
      fractalGlobuleGamma: (json['fractal_globule_gamma'] as num?)?.toDouble() ?? 1.02,
      meanLoopSpanKb: (json['mean_loop_span_kb'] as num?)?.toDouble() ?? 500.0,
      activeLoopsCount: json['active_loops_count'] as int? ?? 3,
      isPhaseSeparated: json['is_phase_separated'] as bool? ?? false,
      dropletRadiusNm: (json['droplet_radius_nm'] as num?)?.toDouble() ?? 0.0,
      polIiEnrichmentFold: (json['pol_ii_enrichment_fold'] as num?)?.toDouble() ?? 1.0,
      cSatThresholdUm: (json['c_sat_threshold_um'] as num?)?.toDouble() ?? 4.2,
      rLoopNetDeltaGKcalMol: (json['r_loop_net_delta_g_kcal_mol'] as num?)?.toDouble() ?? -16.4,
      cleavageProbability: (json['cleavage_probability'] as num?)?.toDouble() ?? 0.88,
      mismatchCount: json['mismatch_count'] as int? ?? 0,
      seedMismatchDetected: json['seed_mismatch_detected'] as bool? ?? false,
      outerTurnUnwrappingForcePn: (json['outer_turn_unwrapping_force_pn'] as num?)?.toDouble() ?? 5.2,
      innerCoreRuptureForcePn: (json['inner_core_rupture_force_pn'] as num?)?.toDouble() ?? 14.8,
      lincForcePn: (json['linc_force_pn'] as num?)?.toDouble() ?? 10.5,
      nuclearPoreDiameterNm: (json['nuclear_pore_diameter_nm'] as num?)?.toDouble() ?? 11.4,
      yapTazNuclearRatio: (json['yap_taz_nuclear_ratio'] as num?)?.toDouble() ?? 1.85,
      transcriptionalMechanostate: json['transcriptional_mechanostate'] as String? ?? 'COMPLIANT_HOMEOSTATIC',
      conformalIntervals: conformal,
      cryptographicSha256Attestation: json['cryptographic_sha256_attestation'] as String? ?? '',
    );
  }

  @override
  List<Object?> get props => [
    patientId,
    timestampUtc,
    tadInsulationScore,
    fractalGlobuleGamma,
    meanLoopSpanKb,
    activeLoopsCount,
    isPhaseSeparated,
    dropletRadiusNm,
    polIiEnrichmentFold,
    cSatThresholdUm,
    rLoopNetDeltaGKcalMol,
    cleavageProbability,
    mismatchCount,
    seedMismatchDetected,
    outerTurnUnwrappingForcePn,
    innerCoreRuptureForcePn,
    lincForcePn,
    nuclearPoreDiameterNm,
    yapTazNuclearRatio,
    transcriptionalMechanostate,
    conformalIntervals,
    cryptographicSha256Attestation,
  ];
}
