import '../models/patient.dart';
import '../models/triage_evaluation.dart';

class TriageEvaluator {
  static PatientTriageEvaluation evaluate(Patient patient) {
    final vitals = patient.state.vitals;
    final bp = (vitals['bp'] ?? '120/80').toString();
    final hrStr = (vitals['hr'] ?? '75').toString();
    final spO2Str = (vitals['spO2'] ?? '98').toString();
    final tempStr = (vitals['temp'] ?? '36.8').toString();

    final hr = int.tryParse(RegExp(r'\d+').stringMatch(hrStr) ?? '') ?? 75;
    final spO2 = int.tryParse(RegExp(r'\d+').stringMatch(spO2Str) ?? '') ?? 98;
    final temp = double.tryParse(RegExp(r'[\d.]+').stringMatch(tempStr) ?? '') ?? 36.8;

    final bpParts = bp.split('/');
    final systolic = int.tryParse(RegExp(r'\d+').stringMatch(bpParts.first) ?? '') ?? 120;
    final diastolic = bpParts.length > 1
        ? int.tryParse(RegExp(r'\d+').stringMatch(bpParts[1]) ?? '') ?? 80
        : 80;

    // Outlier Detection
    final criticalOutliers = <String>[];
    if (hr >= 120) criticalOutliers.add('Tachycardia ($hr bpm)');
    if (hr < 50) criticalOutliers.add('Bradycardia ($hr bpm)');
    if (spO2 <= 92) criticalOutliers.add('Hypoxemia ($spO2%)');
    if (systolic >= 160 || diastolic >= 100) criticalOutliers.add('Hypertensive Urgency ($bp)');
    if (systolic < 90) criticalOutliers.add('Hypotension ($bp)');
    if (temp >= 38.3) criticalOutliers.add('Pyrexia (${temp.toStringAsFixed(1)}°C)');
    if (temp < 35.5) criticalOutliers.add('Hypothermia (${temp.toStringAsFixed(1)}°C)');

    // NEWS2 Calculation
    int news2 = 0;
    // Respiration estimate from SpO2 and HR
    if (spO2 < 92) {
      news2 += 3;
    } else if (spO2 <= 93) {
      news2 += 2;
    } else if (spO2 <= 95) {
      news2 += 1;
    }

    // Systolic BP
    if (systolic <= 90) {
      news2 += 3;
    } else if (systolic <= 100) {
      news2 += 2;
    } else if (systolic <= 110) {
      news2 += 1;
    } else if (systolic >= 220) {
      news2 += 3;
    }

    // Pulse HR
    if (hr <= 40) {
      news2 += 3;
    } else if (hr <= 50) {
      news2 += 1;
    } else if (hr <= 90) {
      news2 += 0;
    } else if (hr <= 110) {
      news2 += 1;
    } else if (hr <= 130) {
      news2 += 2;
    } else {
      news2 += 3;
    }

    // Temp
    if (temp <= 35.0) {
      news2 += 3;
    } else if (temp <= 36.0) {
      news2 += 1;
    } else if (temp <= 38.0) {
      news2 += 0;
    } else if (temp <= 39.0) {
      news2 += 1;
    } else {
      news2 += 2;
    }

    // Conditions text
    final condText = patient.preexistingConditions.join(' ').toLowerCase();
    final issuesText = patient.state.issues.values.map((v) => v.toString()).join(' ').toLowerCase();
    final fullText = '$condText $issuesText ${patient.state.patientGoals.toLowerCase()}';

    // ESI Acuity Stratification
    EsiLevel esiLevel = EsiLevel.esi3Urgent;
    String rationale = 'Stable physiological profile with multi-resource functional medicine complexity.';
    int waitMinutes = 30;

    if (patient.id == 'emergency_casualty' ||
        spO2 < 86 ||
        (hr > 150 || hr < 38) ||
        systolic < 75) {
      esiLevel = EsiLevel.esi1Stat;
      news2 = (news2 < 8) ? 9 : news2;
      rationale = 'STAT Emergency: Hemodynamic instability or immediate life-saving resuscitation required.';
      waitMinutes = 0;
    } else if (news2 >= 7 ||
        spO2 <= 91 ||
        systolic >= 180 ||
        patient.id == 'p_srinivasa_ramanujan' ||
        fullText.contains('hemoptysis') ||
        fullText.contains('acute cardiac') ||
        fullText.contains('chest pain') ||
        fullText.contains('intractable pain')) {
      esiLevel = EsiLevel.esi2Emergent;
      rationale = 'High-Risk Emergent: Critical physiological outliers, high-risk pathology, or severe distress.';
      waitMinutes = 10;
    } else if (fullText.contains('multisystem') ||
        fullText.contains('chronic') ||
        patient.preexistingConditions.length >= 2 ||
        news2 >= 3) {
      esiLevel = EsiLevel.esi3Urgent;
      rationale = 'Urgent: Moderate physiological stability requiring multi-modal diagnostics and specialist review.';
      waitMinutes = 30;
    } else if (patient.preexistingConditions.length == 1) {
      esiLevel = EsiLevel.esi4LessUrgent;
      rationale = 'Less Urgent: Single-domain clinical focus or localized stable symptomatic presentation.';
      waitMinutes = 60;
    } else {
      esiLevel = EsiLevel.esi5NonUrgent;
      rationale = 'Non-Urgent: Routine baseline wellness, preventative follow-up, or wellness maintenance.';
      waitMinutes = 120;
    }

    // SMoE Top-2 Gated Slot Pre-Allocation
    final topExperts = _predictTopExperts(patient, fullText, hr, systolic, spO2);
    final synapse = _detectSynapse(patient, fullText, topExperts);

    // Companion / Accompanied Status
    AccompaniedStatus? accompaniedBy;
    if (patient.age < 18 || patient.id == 'p_poms_adolescent') {
      accompaniedBy = const AccompaniedStatus(
        role: 'PARENT',
        label: 'Mother (Legal Guardian Attested)',
      );
    } else if (patient.age >= 65 || patient.id == 'p003' || patient.id == 'p_loms_elder') {
      accompaniedBy = const AccompaniedStatus(
        role: 'SPOUSE',
        label: 'Spouse (Caregiver Proxy & HPOA)',
      );
    } else if (patient.id == 'p_frida_kahlo' || fullText.contains('trauma') || fullText.contains('intractable pain')) {
      accompaniedBy = const AccompaniedStatus(
        role: 'ADVOCATE',
        label: 'Family Caregiver & Mobility Aide',
      );
    }

    // ACA § 1557 Language Access
    LanguageAccessStatus languageAccess;
    if (patient.id == 'p_frida_kahlo') {
      languageAccess = const LanguageAccessStatus(
        preferredLanguage: 'Spanish (Español)',
        interpreterNeeded: true,
        modality: 'Certified Medical Interpreter',
      );
    } else if (patient.id == 'p_mara_santos') {
      languageAccess = const LanguageAccessStatus(
        preferredLanguage: 'Portuguese (Português)',
        interpreterNeeded: true,
        modality: 'Video Remote (VRI)',
      );
    } else if (patient.id == 'p_srinivasa_ramanujan') {
      languageAccess = const LanguageAccessStatus(
        preferredLanguage: 'Tamil (தமிழ்) / English',
        interpreterNeeded: false,
        modality: 'Bilingual Clinician',
      );
    } else if (patient.id == 'p_marie_curie') {
      languageAccess = const LanguageAccessStatus(
        preferredLanguage: 'French (Français) / Polish',
        interpreterNeeded: false,
        modality: 'Bilingual Clinician',
      );
    } else {
      languageAccess = const LanguageAccessStatus(
        preferredLanguage: 'English (US)',
        interpreterNeeded: false,
        modality: 'Bilingual Clinician',
      );
    }

    return PatientTriageEvaluation(
      patientId: patient.id,
      patientName: patient.name,
      age: patient.age,
      gender: patient.gender,
      esiLevel: esiLevel,
      news2Score: news2,
      vitalsSummary: VitalsSummary(
        bp: bp,
        hr: hrStr,
        spO2: spO2Str,
        temp: tempStr,
        criticalOutliers: criticalOutliers,
        hasCriticalOutlier: criticalOutliers.isNotEmpty,
      ),
      predictedTopExperts: topExperts,
      crossAttentionSynapse: synapse,
      priorityRationale: rationale,
      targetMaxWaitMinutes: waitMinutes,
      accompaniedBy: accompaniedBy,
      languageAccess: languageAccess,
    );
  }

  static List<SmoeExpertSlot> _predictTopExperts(
    Patient patient,
    String fullText,
    int hr,
    int systolic,
    int spO2,
  ) {
    if (fullText.contains('spine') ||
        fullText.contains('pelvic') ||
        fullText.contains('fracture') ||
        fullText.contains('trauma') ||
        fullText.contains('joint') ||
        fullText.contains('ortho') ||
        fullText.contains('arthritis') ||
        fullText.contains('pain')) {
      return const [
        SmoeExpertSlot(
          category: 'musculoskeletal',
          name: 'Musculoskeletal & Biomechanical',
          icon: '🦴',
          probabilityPercent: 74,
        ),
        SmoeExpertSlot(
          category: 'neuroRegenerative',
          name: 'Neuro-Regenerative & Autonomic',
          icon: '🧠',
          probabilityPercent: 26,
        ),
      ];
    } else if (fullText.contains('eye') || fullText.contains('retina') || fullText.contains('optic') || fullText.contains('vision')) {
      return const [
        SmoeExpertSlot(
          category: 'ophthalmological',
          name: 'Ophthalmological & Microvascular',
          icon: '👁️',
          probabilityPercent: 86,
        ),
        SmoeExpertSlot(
          category: 'cardiometabolic',
          name: 'Cardiometabolic & Vascular',
          icon: '🫀',
          probabilityPercent: 14,
        ),
      ];
    } else if (fullText.contains('neuro') || fullText.contains('dementia') || fullText.contains('memory') || fullText.contains('brain')) {
      return const [
        SmoeExpertSlot(
          category: 'neuroRegenerative',
          name: 'Neuro-Regenerative & Autonomic',
          icon: '🧠',
          probabilityPercent: 82,
        ),
        SmoeExpertSlot(
          category: 'integrative',
          name: 'Integrative & Functional',
          icon: '🌿',
          probabilityPercent: 18,
        ),
      ];
    } else if (fullText.contains('cardio') || systolic >= 140 || hr >= 100) {
      return const [
        SmoeExpertSlot(
          category: 'cardiometabolic',
          name: 'Cardiometabolic & Vascular',
          icon: '🫀',
          probabilityPercent: 78,
        ),
        SmoeExpertSlot(
          category: 'immunometabolic',
          name: 'Immunometabolic & Cellular',
          icon: '🛡️',
          probabilityPercent: 22,
        ),
      ];
    }

    return const [
      SmoeExpertSlot(
        category: 'integrative',
        name: 'Integrative & Functional Medicine',
        icon: '🌿',
        probabilityPercent: 68,
      ),
      SmoeExpertSlot(
        category: 'immunometabolic',
        name: 'Immunometabolic & Cellular',
        icon: '🛡️',
        probabilityPercent: 32,
      ),
    ];
  }

  static CrossAttentionSynapse? _detectSynapse(
    Patient patient,
    String fullText,
    List<SmoeExpertSlot> experts,
  ) {
    if (fullText.contains('cardio') && (fullText.contains('eye') || fullText.contains('microvascular'))) {
      return const CrossAttentionSynapse(
        title: 'Microvascular Retinopathy Bridge',
        description: 'Endothelial shear stress maps directly to microvascular retinal perfusion index.',
        sourceExpert: 'Cardiometabolic',
        targetExpert: 'Ophthalmological',
      );
    } else if (fullText.contains('trauma') || fullText.contains('pain')) {
      return const CrossAttentionSynapse(
        title: 'Neuro-Biomechanic Pain Synapse',
        description: 'Coupling central spinal cord sensitization to peripheral musculoskeletal biomechanics.',
        sourceExpert: 'Musculoskeletal',
        targetExpert: 'Neuro-Regenerative',
      );
    }
    return null;
  }
}
