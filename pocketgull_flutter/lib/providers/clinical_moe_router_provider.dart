import 'dart:math' as math;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/patient_types.dart';
import 'patient_provider.dart';

enum UiExpertCategory {
  spatialAnatomy,
  pharmacology,
  counterfactual,
  diagnosticRadar,
  ambientScribe,
  biophysicsGenomics,
  clinicalSynthesis,
}

class UiExpertDefinition {
  final String id;
  final String name;
  final String shortLabel;
  final String icon;
  final UiExpertCategory category;
  final String description;
  final List<String> relevanceKeywords;
  final List<String> associatedBodyParts;
  final bool requiresHighAcuity;
  final double defaultWeight;
  final double computeCostFlops;
  final int cognitiveComplexity; // 1 to 5
  final String telemetrySource;

  const UiExpertDefinition({
    required this.id,
    required this.name,
    required this.shortLabel,
    required this.icon,
    required this.category,
    required this.description,
    required this.relevanceKeywords,
    required this.associatedBodyParts,
    required this.requiresHighAcuity,
    required this.defaultWeight,
    required this.computeCostFlops,
    required this.cognitiveComplexity,
    required this.telemetrySource,
  });
}

class UiGatingScore {
  final UiExpertDefinition expert;
  final double weight; // Softmax normalized (0.0 to 1.0)
  final double rawScore;
  final String routingRationale;
  final bool isPrimary;
  final bool isSecondary;
  final bool isPrewarmCandidate;

  const UiGatingScore({
    required this.expert,
    required this.weight,
    required this.rawScore,
    required this.routingRationale,
    this.isPrimary = false,
    this.isSecondary = false,
    this.isPrewarmCandidate = false,
  });

  UiGatingScore copyWith({
    bool? isPrimary,
    bool? isSecondary,
    bool? isPrewarmCandidate,
  }) {
    return UiGatingScore(
      expert: expert,
      weight: weight,
      rawScore: rawScore,
      routingRationale: routingRationale,
      isPrimary: isPrimary ?? this.isPrimary,
      isSecondary: isSecondary ?? this.isSecondary,
      isPrewarmCandidate: isPrewarmCandidate ?? this.isPrewarmCandidate,
    );
  }
}

class CrossAttentionBridge {
  final String id;
  final String primaryExpertId;
  final String secondaryExpertId;
  final String title;
  final String mechanism;
  final String clinicalImplication;
  final String actionableVector;
  final String benchmarkMetric;

  const CrossAttentionBridge({
    required this.id,
    required this.primaryExpertId,
    required this.secondaryExpertId,
    required this.title,
    required this.mechanism,
    required this.clinicalImplication,
    required this.actionableVector,
    required this.benchmarkMetric,
  });
}

const List<UiExpertDefinition> kFlutterRegisteredExperts = [
  UiExpertDefinition(
    id: 'dicom-radiology',
    name: '3D Multi-Frame DICOM Radiology Viewer',
    shortLabel: 'DICOM Radiology',
    icon: '🩻',
    category: UiExpertCategory.spatialAnatomy,
    description: 'RSNA Multi-frame MRI cine-loop, articular cartilage mapping, and tri-plane joint inspection.',
    relevanceKeywords: ['knee', 'joint', 'dicom', 'mri', 'radiology', 'meniscus', 'acl', 'cartilage', 'osteoarthritis', 'crepitus', 'femur'],
    associatedBodyParts: ['knee', 'leg', 'hip', 'joint'],
    requiresHighAcuity: false,
    defaultWeight: 0.25,
    computeCostFlops: 0.45,
    cognitiveComplexity: 4,
    telemetrySource: 'Impeller GPU Shader',
  ),
  UiExpertDefinition(
    id: 'body-viewer',
    name: 'Interactive Anatomical Digital Twin & HUD',
    shortLabel: 'Anatomical Twin',
    icon: '🧍',
    category: UiExpertCategory.spatialAnatomy,
    description: 'Procedural 3D anatomical skeletal overlay with localized symptom heatmaps.',
    relevanceKeywords: ['body', 'anatomy', 'spatial', 'skeleton', 'musculoskeletal', 'pain', 'spine', 'shoulder', 'back', 'neck'],
    associatedBodyParts: ['spine', 'shoulder', 'head', 'back', 'neck'],
    requiresHighAcuity: false,
    defaultWeight: 0.22,
    computeCostFlops: 0.35,
    cognitiveComplexity: 3,
    telemetrySource: 'Native OpenGL/Vulkan',
  ),
  UiExpertDefinition(
    id: 'cgm-telemetry',
    name: 'Continuous Glucose & Hemodynamic Telemetry',
    shortLabel: 'CGM & Vitals',
    icon: '⚡',
    category: UiExpertCategory.diagnosticRadar,
    description: 'Real-time Ambulatory Glucose Profile (AGP) and Time in Range (TIR) with on-device risk scoring.',
    relevanceKeywords: ['cgm', 'glucose', 'vitals', 'continuous', 'hrv', 'heart rate', 'spo2', 'bp', 'tachycardia', 'diabetes', 'metformin'],
    associatedBodyParts: ['heart', 'chest'],
    requiresHighAcuity: true,
    defaultWeight: 0.20,
    computeCostFlops: 0.15,
    cognitiveComplexity: 3,
    telemetrySource: 'On-Device TFLite',
  ),
  UiExpertDefinition(
    id: 'teledentistry-sibi',
    name: 'FDI Odontogram & Systemic SIBI Bridge',
    shortLabel: 'Teledentistry & SIBI',
    icon: '🦷',
    category: UiExpertCategory.diagnosticRadar,
    description: '32-tooth odontogram, periodontal pocket probing depths, and Systemic Inflammatory Burden Index.',
    relevanceKeywords: ['dental', 'tooth', 'teeth', 'periodontal', 'caries', 'oral', 'gingival', 'sibi', 'odontogram'],
    associatedBodyParts: ['mouth', 'jaw', 'teeth'],
    requiresHighAcuity: false,
    defaultWeight: 0.14,
    computeCostFlops: 0.08,
    cognitiveComplexity: 3,
    telemetrySource: 'Local Edge Wasm',
  ),
  UiExpertDefinition(
    id: 'sentinel-triage',
    name: 'Sentinel Emergency Acuity & Safety Guard',
    shortLabel: 'Sentinel Triage',
    icon: '🛡️',
    category: UiExpertCategory.diagnosticRadar,
    description: 'Acuity stratification (STAT / Urgent / Routine) enforcing zero false-negative clinical guardrails.',
    relevanceKeywords: ['emergency', 'stat', 'triage', 'acuity', 'alert', 'crisis', 'urgent', 'safety', 'warning'],
    associatedBodyParts: [],
    requiresHighAcuity: true,
    defaultWeight: 0.12,
    computeCostFlops: 0.05,
    cognitiveComplexity: 2,
    telemetrySource: 'On-Device Guard',
  ),
  UiExpertDefinition(
    id: 'ambient-scribe',
    name: 'Ambient Speech Scribe & Dictation HUD',
    shortLabel: 'Ambient Scribe',
    icon: '🎙️',
    category: UiExpertCategory.ambientScribe,
    description: 'Bi-directional voice streaming into structured FHIR R4 clinical observations.',
    relevanceKeywords: ['scribe', 'dictation', 'speech', 'voice', 'audio', 'conversation', 'soap', 'note', 'transcript'],
    associatedBodyParts: [],
    requiresHighAcuity: false,
    defaultWeight: 0.15,
    computeCostFlops: 0.18,
    cognitiveComplexity: 2,
    telemetrySource: 'Gemini Live API',
  ),
  UiExpertDefinition(
    id: 'analysis-report',
    name: 'Tri-Paradigm Stepped-Care Clinical Synthesis',
    shortLabel: 'Clinical Synthesis',
    icon: '📄',
    category: UiExpertCategory.clinicalSynthesis,
    description: 'Stepped-Care Tri-Paradigm (Western, Eastern TCM, Ayurvedic) unified care plan report.',
    relevanceKeywords: ['synthesis', 'care plan', 'report', 'western', 'eastern', 'ayurvedic', 'summary', 'holistic', 'overview'],
    associatedBodyParts: [],
    requiresHighAcuity: false,
    defaultWeight: 0.22,
    computeCostFlops: 0.35,
    cognitiveComplexity: 3,
    telemetrySource: 'Gemini 3.8 Flash',
  ),
];

const List<CrossAttentionBridge> kFlutterCrossBridges = [
  CrossAttentionBridge(
    id: 'bridge-dicom-cgm',
    primaryExpertId: 'dicom-radiology',
    secondaryExpertId: 'cgm-telemetry',
    title: 'Musculoskeletal Joint Load vs. Insulin Sensitivity Cross-Talk',
    mechanism: 'Impaired joint kinematics suppresses physical mobility, reducing skeletal muscle GLUT4 glucose disposal.',
    clinicalImplication: 'Simulated low-impact swimming protocol recovers +14% Time-in-Range (70-140 mg/dL) without joint shear.',
    actionableVector: 'Prescribe zero-gravity hydrotherapy + 0.1 Hz vagal recovery pacing.',
    benchmarkMetric: '+14% Glucose Time in Range',
  ),
  CrossAttentionBridge(
    id: 'bridge-teledentistry-cgm',
    primaryExpertId: 'teledentistry-sibi',
    secondaryExpertId: 'cgm-telemetry',
    title: 'Periodontal SIBI vs. Glycemic Volatility Cross-Talk',
    mechanism: 'Periodontal pocket depth >= 4mm bacteremia causes systemic TNF-alpha release, inducing hepatic insulin resistance.',
    clinicalImplication: 'Full-mouth ultrasonic debridement correlates with a 0.4% HbA1c reduction over 12 weeks.',
    actionableVector: 'Schedule ultrasonic scaling + prescribe chlorhexidine 0.12% oral rinse.',
    benchmarkMetric: '-0.4% Estimated HbA1c Reduction',
  ),
  CrossAttentionBridge(
    id: 'bridge-sentinel-scribe',
    primaryExpertId: 'sentinel-triage',
    secondaryExpertId: 'ambient-scribe',
    title: 'STAT Emergency Acuity to Real-Time Encounter Scribing',
    mechanism: 'High-acuity voice transcript tokens automatically populate the emergency transfer bundle.',
    clinicalImplication: 'Eliminates documentation delay during acute clinical deterioration or hospital divert.',
    actionableVector: 'Export cryptographically sealed FHIR R4 transfer summary with SHA-256 integrity digest.',
    benchmarkMetric: '<45s Emergency Intake Latency',
  ),
];

class ClinicalMoeState {
  final String activeScenario; // 'default', 'knee_oa', 'diabetic_neuropathy', 'acute_vitals'
  final String? pinnedExpertId;
  final String transcriptQuery;
  final int kValue;
  final List<UiGatingScore> scores;
  final UiGatingScore? primaryExpert;
  final UiGatingScore? secondaryExpert;
  final List<UiGatingScore> latentExperts;
  final CrossAttentionBridge? activeBridge;
  final int primaryViewportRatio; // 55 to 72%
  final int secondaryViewportRatio; // 28 to 45%
  final int noiseReductionPercent;
  final int cognitiveLoadScore; // 0 to 100

  const ClinicalMoeState({
    required this.activeScenario,
    required this.pinnedExpertId,
    required this.transcriptQuery,
    required this.kValue,
    required this.scores,
    required this.primaryExpert,
    required this.secondaryExpert,
    required this.latentExperts,
    required this.activeBridge,
    required this.primaryViewportRatio,
    required this.secondaryViewportRatio,
    required this.noiseReductionPercent,
    required this.cognitiveLoadScore,
  });

  factory ClinicalMoeState.initial() {
    return const ClinicalMoeState(
      activeScenario: 'default',
      pinnedExpertId: null,
      transcriptQuery: '',
      kValue: 2,
      scores: [],
      primaryExpert: null,
      secondaryExpert: null,
      latentExperts: [],
      activeBridge: null,
      primaryViewportRatio: 65,
      secondaryViewportRatio: 35,
      noiseReductionPercent: 71,
      cognitiveLoadScore: 42,
    );
  }
}

class ClinicalMoeRouterNotifier extends Notifier<ClinicalMoeState> {
  @override
  ClinicalMoeState build() {
    // Listen to patient state changes
    final patient = ref.watch(patientProvider);
    return _computeGatingDistribution(
      patient: patient,
      scenario: 'default',
      pinnedId: null,
      transcript: '',
      k: 2,
    );
  }

  void loadDemoScenario(String scenario) {
    final patient = ref.read(patientProvider);
    state = _computeGatingDistribution(
      patient: patient,
      scenario: scenario,
      pinnedId: null,
      transcript: '',
      k: state.kValue,
    );
  }

  void setTranscriptQuery(String query) {
    final patient = ref.read(patientProvider);
    state = _computeGatingDistribution(
      patient: patient,
      scenario: state.activeScenario,
      pinnedId: state.pinnedExpertId,
      transcript: query,
      k: state.kValue,
    );
  }

  void setKValue(int k) {
    final clampedK = k.clamp(1, 3);
    final patient = ref.read(patientProvider);
    state = _computeGatingDistribution(
      patient: patient,
      scenario: state.activeScenario,
      pinnedId: state.pinnedExpertId,
      transcript: state.transcriptQuery,
      k: clampedK,
    );
  }

  void pinExpert(String? expertId) {
    final patient = ref.read(patientProvider);
    state = _computeGatingDistribution(
      patient: patient,
      scenario: state.activeScenario,
      pinnedId: expertId,
      transcript: state.transcriptQuery,
      k: state.kValue,
    );
  }

  void promoteLatentExpert(String expertId) {
    pinExpert(expertId);
  }

  void clearOverrides() {
    final patient = ref.read(patientProvider);
    state = _computeGatingDistribution(
      patient: patient,
      scenario: 'default',
      pinnedId: null,
      transcript: '',
      k: 2,
    );
  }

  ClinicalMoeState _computeGatingDistribution({
    required PatientState patient,
    required String scenario,
    required String? pinnedId,
    required String transcript,
    required int k,
  }) {
    final cleanTranscript = transcript.toLowerCase().trim();
    final issues = patient.issues;
    final activeBodyPartIds = issues.keys.map((k) => k.toLowerCase()).toList();

    // Extract description keywords
    final descriptions = <String>[];
    issues.forEach((part, issueList) {
      for (final issue in issueList) {
        descriptions.add(issue.description.toLowerCase());
        descriptions.add(issue.name.toLowerCase());
        descriptions.addAll(issue.symptoms.map((s) => s.toLowerCase()));
      }
    });
    final combinedIssueText = descriptions.join(' ');

    // Score all experts
    final rawList = <({UiExpertDefinition expert, double rawScore, String rationale})>[];

    for (final expert in kFlutterRegisteredExperts) {
      double score = expert.defaultWeight;
      final rationaleParts = <String>[];

      // 1. Scenario Presets
      if (scenario == 'knee_oa' && expert.id == 'dicom-radiology') {
        score += 3.5;
        rationaleParts.add('Active RSNA Knee OA scenario selected');
      } else if (scenario == 'knee_oa' && expert.id == 'cgm-telemetry') {
        score += 1.8;
        rationaleParts.add('Co-activated Metabolic Insulin Sensitivity');
      } else if (scenario == 'diabetic_neuropathy' && expert.id == 'cgm-telemetry') {
        score += 3.2;
        rationaleParts.add('Active Diabetic Neuropathy TIR scenario');
      } else if (scenario == 'diabetic_neuropathy' && expert.id == 'teledentistry-sibi') {
        score += 2.1;
        rationaleParts.add('Co-activated Periodontal SIBI Bridge');
      } else if (scenario == 'acute_vitals' && expert.id == 'sentinel-triage') {
        score += 3.4;
        rationaleParts.add('Active Sentinel Triage flare scenario');
      } else if (scenario == 'acute_vitals' && expert.id == 'ambient-scribe') {
        score += 2.0;
        rationaleParts.add('Co-activated Emergency encounter scribe');
      }

      // 2. Transcript match
      if (cleanTranscript.isNotEmpty) {
        int hits = 0;
        for (final kw in expert.relevanceKeywords) {
          if (cleanTranscript.contains(kw)) {
            hits++;
          }
        }
        if (hits > 0) {
          score += math.min(2.5, hits * 0.75);
          rationaleParts.add('Conversational cue match ($hits keywords)');
        }
      }

      // 3. Body part localization
      final hasBodyMatch = expert.associatedBodyParts.any((bp) => activeBodyPartIds.contains(bp));
      if (hasBodyMatch) {
        score += 2.0;
        rationaleParts.add('Symptom localized to ${expert.associatedBodyParts.join(", ")}');
      }

      // 4. Clinical issue description keyword matches
      int issueHits = 0;
      for (final kw in expert.relevanceKeywords) {
        if (combinedIssueText.contains(kw)) {
          issueHits++;
        }
      }
      if (issueHits > 0) {
        score += math.min(2.0, issueHits * 0.5);
        rationaleParts.add('EHR symptom description match ($issueHits)');
      }

      // 5. Manual Pinning Override
      if (pinnedId == expert.id) {
        score += 12.0;
        rationaleParts.insert(0, 'Clinician Manual Pin Override');
      }

      rawList.add((
        expert: expert,
        rawScore: math.max(0.01, score),
        rationale: rationaleParts.isNotEmpty ? rationaleParts.join('; ') : 'Baseline clinical prior',
      ));
    }

    // Softmax normalization with temperature T = 0.85
    const temperature = 0.85;
    final maxZ = rawList.map((r) => r.rawScore / temperature).reduce(math.max);
    final expList = rawList.map((r) {
      final expZ = math.exp((r.rawScore / temperature) - maxZ);
      return (expert: r.expert, rawScore: r.rawScore, rationale: r.rationale, expZ: expZ);
    }).toList();

    final sumExp = expList.fold<double>(0.0, (acc, r) => acc + r.expZ);

    final scored = expList.map((r) {
      final weight = (r.expZ / sumExp * 1000).round() / 1000;
      return UiGatingScore(
        expert: r.expert,
        rawScore: (r.rawScore * 100).round() / 100,
        weight: weight,
        routingRationale: r.rationale,
        isPrimary: false,
        isSecondary: false,
        isPrewarmCandidate: weight >= 0.14,
      );
    }).toList();

    // Sort descending by weight
    scored.sort((a, b) => b.weight.compareTo(a.weight));

    UiGatingScore? primary;
    UiGatingScore? secondary;

    if (scored.isNotEmpty) {
      primary = scored[0].copyWith(isPrimary: true);
      scored[0] = primary;
    }
    if (scored.length > 1) {
      secondary = scored[1].copyWith(isSecondary: true);
      scored[1] = secondary;
    }

    final latent = scored.length > k ? scored.sublist(k) : <UiGatingScore>[];

    // Detect Cross-Attention Bridge
    CrossAttentionBridge? activeBridge;
    if (primary != null && secondary != null) {
      for (final bridge in kFlutterCrossBridges) {
        if ((bridge.primaryExpertId == primary.expert.id && bridge.secondaryExpertId == secondary.expert.id) ||
            (bridge.primaryExpertId == secondary.expert.id && bridge.secondaryExpertId == primary.expert.id)) {
          activeBridge = bridge;
          break;
        }
      }
    }

    // Proportional Viewport Clamping (55% to 72%)
    int primaryRatio = 65;
    if (primary != null && secondary != null) {
      final total = primary.weight + secondary.weight;
      if (total > 0) {
        final norm = primary.weight / total;
        primaryRatio = (norm * 100).round().clamp(55, 72);
      }
    }
    final secondaryRatio = 100 - primaryRatio;

    // Noise Reduction & Cognitive Load
    final noiseReduction = ((1.0 - (k / kFlutterRegisteredExperts.length)) * 100).round();
    final pScore = primary != null ? primary.expert.cognitiveComplexity * 10 : 0;
    final sScore = secondary != null ? secondary.expert.cognitiveComplexity * 10 : 0;
    final cognitiveLoad = ((pScore + sScore) * 0.6).round().clamp(0, 100);

    return ClinicalMoeState(
      activeScenario: scenario,
      pinnedExpertId: pinnedId,
      transcriptQuery: transcript,
      kValue: k,
      scores: scored,
      primaryExpert: primary,
      secondaryExpert: secondary,
      latentExperts: latent,
      activeBridge: activeBridge,
      primaryViewportRatio: primaryRatio,
      secondaryViewportRatio: secondaryRatio,
      noiseReductionPercent: noiseReduction,
      cognitiveLoadScore: cognitiveLoad,
    );
  }
}

final clinicalMoeRouterProvider = NotifierProvider<ClinicalMoeRouterNotifier, ClinicalMoeState>(
  ClinicalMoeRouterNotifier.new,
);
