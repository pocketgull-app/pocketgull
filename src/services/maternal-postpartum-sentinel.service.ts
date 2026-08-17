import { Injectable, signal, computed } from '@angular/core';

export type PostpartumRiskTier = 'LOW_STANDARD' | 'MODERATE_MONITOR' | 'HIGH_URGENT' | 'CRITICAL_EMERGENCY';

export interface IMaternalVitalsInput {
  systolicBp: number;
  diastolicBp: number;
  heartRate: number;
  spO2Percent: number;
  daysPostpartum: number; // 1 to 84 days (12 weeks / 4th trimester)
  symptoms: {
    severeHeadacheUnrelievedByMeds?: boolean;
    visualScotomaOrBlurring?: boolean;
    epigastricOrRightUpperQuadrantPain?: boolean;
    shortnessOfBreathOrOrthopnea?: boolean;
    suddenFaceHandEdema?: boolean;
    excessiveLochiaOrClots?: boolean;
    feverOrFoulDischarge?: boolean;
    extremeFatigueOrDizziness?: boolean;
  };
  raceEthnicity?: string;
  previousPreeclampsiaHistory?: boolean;
}

export interface IMaternalSafetyAssessment {
  assessmentId: string;
  timestamp: string;
  patientId: string;
  daysPostpartum: number;
  meanArterialPressure: number;
  riskTier: PostpartumRiskTier;
  flaggedConditions: string[];
  acogAimBundleRecommendations: string[];
  urgentActionRequired: boolean;
  disparityMitigationNotice: string;
  fhirObservationPayload: any;
}

// --- Edinburgh Postnatal Depression Scale (EPDS) ---
export interface IEpdsQuestion {
  id: number;
  prompt: string;
  options: { text: string; score: number }[];
}

export const EPDS_QUESTIONS: IEpdsQuestion[] = [
  {
    id: 1,
    prompt: 'I have been able to laugh and see the funny side of things:',
    options: [
      { text: 'As much as I always could', score: 0 },
      { text: 'Not quite so much now', score: 1 },
      { text: 'Definitely not so much now', score: 2 },
      { text: 'Not at all', score: 3 }
    ]
  },
  {
    id: 2,
    prompt: 'I have looked forward with enjoyment to things:',
    options: [
      { text: 'As much as I ever did', score: 0 },
      { text: 'Rather less than I used to', score: 1 },
      { text: 'Definitely less than I used to', score: 2 },
      { text: 'Hardly at all', score: 3 }
    ]
  },
  {
    id: 3,
    prompt: 'I have blamed myself unnecessarily when things went wrong:',
    options: [
      { text: 'Yes, most of the time', score: 3 },
      { text: 'Yes, some of the time', score: 2 },
      { text: 'Not very often', score: 1 },
      { text: 'No, never', score: 0 }
    ]
  },
  {
    id: 4,
    prompt: 'I have been anxious or worried for no good reason:',
    options: [
      { text: 'No, not at all', score: 0 },
      { text: 'Hardly ever', score: 1 },
      { text: 'Yes, sometimes', score: 2 },
      { text: 'Yes, very often', score: 3 }
    ]
  },
  {
    id: 5,
    prompt: 'I have felt scared or panicky for no very good reason:',
    options: [
      { text: 'Yes, quite a lot', score: 3 },
      { text: 'Yes, sometimes', score: 2 },
      { text: 'No, not much', score: 1 },
      { text: 'No, not at all', score: 0 }
    ]
  },
  {
    id: 6,
    prompt: 'Things have been getting on top of me:',
    options: [
      { text: 'Yes, most of the time I haven’t been able to cope at all', score: 3 },
      { text: 'Yes, sometimes I haven’t been coping as well as usual', score: 2 },
      { text: 'No, most of the time I have coped quite well', score: 1 },
      { text: 'No, I have been coping as well as ever', score: 0 }
    ]
  },
  {
    id: 7,
    prompt: 'I have been so unhappy that I have had difficulty sleeping:',
    options: [
      { text: 'Yes, most of the time', score: 3 },
      { text: 'Yes, sometimes', score: 2 },
      { text: 'Not very often', score: 1 },
      { text: 'No, not at all', score: 0 }
    ]
  },
  {
    id: 8,
    prompt: 'I have felt sad or miserable:',
    options: [
      { text: 'Yes, most of the time', score: 3 },
      { text: 'Yes, quite often', score: 2 },
      { text: 'Not very often', score: 1 },
      { text: 'No, not at all', score: 0 }
    ]
  },
  {
    id: 9,
    prompt: 'I have been so unhappy that I have been crying:',
    options: [
      { text: 'Yes, most of the time', score: 3 },
      { text: 'Yes, quite often', score: 2 },
      { text: 'Only occasionally', score: 1 },
      { text: 'No, never', score: 0 }
    ]
  },
  {
    id: 10,
    prompt: 'The thought of harming myself has occurred to me:',
    options: [
      { text: 'Yes, quite often', score: 3 },
      { text: 'Sometimes', score: 2 },
      { text: 'Hardly ever', score: 1 },
      { text: 'Never', score: 0 }
    ]
  }
];

export interface IEpdsAssessment {
  assessmentId: string;
  timestamp: string;
  totalScore: number; // 0 to 30
  riskTier: 'NORMAL' | 'MILD_MODERATE_DISTRESS' | 'PROBABLE_DEPRESSION';
  item10Positive: boolean; // Flagged if score > 0 on question 10
  crisisProtocolTriggered: boolean;
  clinicalRecommendations: string[];
  daysPostpartum: number;
}

// --- Doula Lactation & Feeding Mechanics (LATCH Score) ---
export interface ILatchScoreInput {
  latch: 0 | 1 | 2; // 0: Too sleepy/no latch, 1: Repeated attempts, 2: Grasps breast/tongue down
  audibleSwallowing: 0 | 1 | 2; // 0: None, 1: A few with stimulation, 2: Spontaneous and frequent
  typeOfNipple: 0 | 1 | 2; // 0: Inverted, 1: Flat, 2: Everted after stimulation
  comfort: 0 | 1 | 2; // 0: Severe pain/cracked, 1: Mild discomfort, 2: Soft/comfortable
  hold: 0 | 1 | 2; // 0: Full assist, 1: Minimal assist, 2: Independent
}

export interface ILactationAssessment {
  assessmentId: string;
  timestamp: string;
  totalLatchScore: number; // 0 to 10
  supportLevel: 'INDEPENDENT' | 'MODERATE_ASSISTANCE' | 'INTENSIVE_LACTATION_CONSULT';
  mastitisRisk: boolean;
  pluggedDuctWarning: boolean;
  galactagogueRecommendations: {
    herb: string;
    evidenceLevel: 'Level A' | 'Level B' | 'Level C';
    safetyNote: string;
  }[];
  doulaCareTips: string[];
}

// --- Infant Circadian Synchrony ---
export interface IInfantCircadianInput {
  dailyFeedingCount: number; // typical 8-12 per 24h
  longestSleepStretchHours: number; // e.g. 2.5 - 5h
  nightWakeningCount: number;
  maternalSleepHours: number;
}

export interface ICircadianAssessment {
  circadianMaturityScore: number; // 0 to 100%
  maternalSleepFragmentationIndex: 'LOW' | 'MODERATE' | 'SEVERE';
  recommendations: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MaternalPostpartumSentinelService {
  readonly currentAssessment = signal<IMaternalSafetyAssessment | null>(null);
  readonly assessmentsHistory = signal<IMaternalSafetyAssessment[]>([]);

  readonly currentEpdsAssessment = signal<IEpdsAssessment | null>(null);
  readonly epdsHistory = signal<IEpdsAssessment[]>([]);

  readonly currentLactationAssessment = signal<ILactationAssessment | null>(null);
  readonly currentCircadianAssessment = signal<ICircadianAssessment | null>(null);

  readonly isUrgentAlertActive = computed(() => {
    const curr = this.currentAssessment();
    const epds = this.currentEpdsAssessment();
    return (curr?.urgentActionRequired ?? false) || (epds?.crisisProtocolTriggered ?? false);
  });

  /**
   * Calculates Mean Arterial Pressure: MAP = (2*DBP + SBP) / 3
   */
  public calculateMap(sbp: number, dbp: number): number {
    return Number(((2 * dbp + sbp) / 3).toFixed(1));
  }

  /**
   * Evaluates 4th-trimester maternal health telemetry under ACOG AIM guidelines.
   */
  public evaluatePostpartumMorbidity(input: IMaternalVitalsInput, patientId: string = 'p_postpartum_case'): IMaternalSafetyAssessment {
    const map = this.calculateMap(input.systolicBp, input.diastolicBp);
    const flaggedConditions: string[] = [];
    const recommendations: string[] = [];
    let urgent = false;
    let tier: PostpartumRiskTier = 'LOW_STANDARD';

    // 1. Postpartum Preeclampsia / Eclampsia Criteria (ACOG AIM Safety Bundle)
    const isSevereHypertension = input.systolicBp >= 160 || input.diastolicBp >= 110;
    const isMildHypertension = input.systolicBp >= 140 || input.diastolicBp >= 90;
    const hasNeuroSymptoms = input.symptoms.severeHeadacheUnrelievedByMeds || input.symptoms.visualScotomaOrBlurring;
    const hasHepaticSymptoms = input.symptoms.epigastricOrRightUpperQuadrantPain;

    if (isSevereHypertension || (isMildHypertension && (hasNeuroSymptoms || hasHepaticSymptoms))) {
      flaggedConditions.push('Late Postpartum Preeclampsia with Severe Features (ACOG AIM Protocol)');
      recommendations.push('Immediate IV Antihypertensive therapy (Labetalol 20mg IV or Hydralazine 10mg IV) within 30-60 minutes to prevent cerebrovascular stroke.');
      recommendations.push('Initiate Magnesium Sulfate (4-6g IV loading dose over 20 min, followed by 1-2g/hr maintenance for 24h) for seizure prophylaxis.');
      recommendations.push('Stat diagnostic panel: CBC (platelet count < 100k), CMP (AST/ALT elevation, creatinine > 1.1 mg/dL), and urine protein-to-creatinine ratio (UPCR).');
      tier = 'CRITICAL_EMERGENCY';
      urgent = true;
    } else if (isMildHypertension || hasNeuroSymptoms || input.symptoms.suddenFaceHandEdema) {
      flaggedConditions.push('Postpartum Gestational Hypertension / Pre-eclampsia Warning Signs');
      recommendations.push('Urgent same-day clinical evaluation, repeat BP in 15 minutes, and 24-48h remote telemetry monitoring.');
      tier = 'HIGH_URGENT';
      urgent = true;
    }

    // 2. Peripartum Cardiomyopathy (PPCM)
    if (input.symptoms.shortnessOfBreathOrOrthopnea || (input.heartRate > 110 && input.spO2Percent < 95)) {
      flaggedConditions.push('Peripartum Cardiomyopathy (PPCM) Alert');
      recommendations.push('Stat Transthoracic Echocardiogram (TTE) to evaluate Left Ventricular Ejection Fraction (LVEF < 45%).');
      recommendations.push('Check serum NT-proBNP and high-sensitivity Troponin.');
      recommendations.push('Initiate supplemental oxygen; avoid aggressive fluid loading pending cardiac clearance.');
      if (tier !== 'CRITICAL_EMERGENCY') tier = 'HIGH_URGENT';
      urgent = true;
    }

    // 3. Secondary Postpartum Hemorrhage (PPH)
    if (input.symptoms.excessiveLochiaOrClots) {
      flaggedConditions.push('Secondary Postpartum Hemorrhage (Retained Placental Fragments / Subinvolution)');
      recommendations.push('Pelvic ultrasound to rule out retained products of conception (RPOC).');
      recommendations.push('Check complete blood count (Hgb/Hct) and type & screen.');
      if (tier !== 'CRITICAL_EMERGENCY') tier = 'HIGH_URGENT';
      urgent = true;
    }

    // 4. Postpartum Endometritis / Sepsis
    if (input.symptoms.feverOrFoulDischarge) {
      flaggedConditions.push('Puerperal Sepsis / Postpartum Endometritis');
      recommendations.push('Stat blood and cervical cultures, IV broad-spectrum antibiotics (Clindamycin + Gentamicin).');
      if (tier !== 'CRITICAL_EMERGENCY') tier = 'HIGH_URGENT';
      urgent = true;
    }

    if (flaggedConditions.length === 0) {
      tier = 'LOW_STANDARD';
      recommendations.push('Routine 4th-trimester postpartum recovery plan; continue pelvic floor rehabilitation and iron/folate repletion.');
      recommendations.push('Schedule standard 2-week and 6-week postpartum maternal check-ins.');
    }

    const assessment: IMaternalSafetyAssessment = {
      assessmentId: `MOM-SENTINEL-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      patientId,
      daysPostpartum: input.daysPostpartum,
      meanArterialPressure: map,
      riskTier: tier,
      flaggedConditions,
      acogAimBundleRecommendations: recommendations,
      urgentActionRequired: urgent,
      disparityMitigationNotice: 'ACOG AIM Equity Protocol Active: Mandating identical objective diagnostic and escalation criteria regardless of insurance status, eliminating racial disparities in postpartum maternal mortality.',
      fhirObservationPayload: {
        resourceType: 'Observation',
        status: 'final',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }] }],
        code: { coding: [{ system: 'http://loinc.org', code: '8478-0', display: 'Mean Blood Pressure' }] },
        subject: { reference: `Patient/${patientId}` },
        effectiveDateTime: new Date().toISOString(),
        valueQuantity: { value: map, unit: 'mm[Hg]', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' }
      }
    };

    this.currentAssessment.set(assessment);
    this.assessmentsHistory.update(prev => [assessment, ...prev]);
    return assessment;
  }

  /**
   * Evaluates Edinburgh Postnatal Depression Scale (EPDS) 10-item questionnaire.
   * Total score: 0 to 30.
   * Cutoffs:
   *   - < 10: Normal / Low Risk
   *   - 10 - 12: Mild to Moderate Distress
   *   - >= 13: Probable Postpartum Depression
   *   - Item 10 > 0: Immediate Crisis Safety Protocol Triggered
   */
  public evaluateEpds(responses: number[], daysPostpartum: number = 14): IEpdsAssessment {
    const totalScore = responses.reduce((acc, curr) => acc + (curr || 0), 0);
    const item10Score = responses[9] || 0; // 10th question is index 9
    const item10Positive = item10Score > 0;
    const crisisProtocolTriggered = item10Positive;

    let riskTier: 'NORMAL' | 'MILD_MODERATE_DISTRESS' | 'PROBABLE_DEPRESSION' = 'NORMAL';
    const recs: string[] = [];

    if (item10Positive) {
      recs.push('CRISIS INTERVENTION: Immediate safety plan activation and referral to 988 Suicide & Crisis Lifeline / Perinatal Crisis Support.');
      recs.push('Do not leave patient unmonitored; evaluate for inpatient perinatal psychiatric stabilization if active intent.');
    }

    if (totalScore >= 13) {
      riskTier = 'PROBABLE_DEPRESSION';
      recs.push('Urgent referral to Reproductive Psychiatrist / Perinatal Mental Health Specialist.');
      recs.push('Initiate evidence-based psychotherapy (Interpersonal Therapy / CBT) and evaluate SSRI pharmacotherapy (Sertraline / Escitalopram).');
      recs.push('Schedule weekly clinical check-ins and involve designated partner/family support advocates.');
    } else if (totalScore >= 10) {
      riskTier = 'MILD_MODERATE_DISTRESS';
      recs.push('Recommend postpartum peer support groups, sleep restoration counseling, and doula respite care.');
      recs.push('Repeat EPDS in 14 days to monitor trajectory.');
    } else {
      riskTier = 'NORMAL';
      recs.push('Reassure patient; continue routine perinatal wellness tracking and 6-week rescreening.');
    }

    const assessment: IEpdsAssessment = {
      assessmentId: `EPDS-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      totalScore,
      riskTier,
      item10Positive,
      crisisProtocolTriggered,
      clinicalRecommendations: recs,
      daysPostpartum
    };

    this.currentEpdsAssessment.set(assessment);
    this.epdsHistory.update(prev => [assessment, ...prev]);
    return assessment;
  }

  /**
   * Evaluates LATCH Lactation mechanics and Doula support indicators.
   * Score 0-10 (2 points each for Latch, Audible Swallow, Nipple Type, Comfort, Hold).
   */
  public evaluateLactation(
    input: ILatchScoreInput,
    symptoms?: { localizedBreastErythema?: boolean; fever?: boolean; wedgeShapedPain?: boolean }
  ): ILactationAssessment {
    const totalLatchScore = input.latch + input.audibleSwallowing + input.typeOfNipple + input.comfort + input.hold;
    
    let supportLevel: 'INDEPENDENT' | 'MODERATE_ASSISTANCE' | 'INTENSIVE_LACTATION_CONSULT' = 'INDEPENDENT';
    if (totalLatchScore < 6) {
      supportLevel = 'INTENSIVE_LACTATION_CONSULT';
    } else if (totalLatchScore <= 8) {
      supportLevel = 'MODERATE_ASSISTANCE';
    }

    const mastitisRisk = Boolean(symptoms?.localizedBreastErythema && symptoms?.fever);
    const pluggedDuctWarning = Boolean(symptoms?.wedgeShapedPain && !symptoms?.fever);

    const doulaTips: string[] = [];
    if (totalLatchScore < 7) {
      doulaTips.push('Position infant in asymmetrical latch (chin embedded in lower breast, nose free).');
      doulaTips.push('Apply warm compresses prior to nursing and gentle breast gymnastics to encourage letdown.');
    } else {
      doulaTips.push('Excellent latch mechanics; maintain skin-to-skin contact for prolactin surge stimulation.');
    }

    if (mastitisRisk) {
      doulaTips.push('WARNING: Acute Mastitis suspected. Consult physician for antibiotic therapy (Dicloxacillin/Cephalexin) and continue feeding on affected side.');
    } else if (pluggedDuctWarning) {
      doulaTips.push('Plugged milk duct: Apply sunflower lecithin (1200mg QID), gentle lymphatic drainage toward axilla, avoid deep tissue massage.');
    }

    const assessment: ILactationAssessment = {
      assessmentId: `LATCH-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      totalLatchScore,
      supportLevel,
      mastitisRisk,
      pluggedDuctWarning,
      galactagogueRecommendations: [
        { herb: 'Moringa Oleifera (Malunggay)', evidenceLevel: 'Level A', safetyNote: 'Proven to significantly increase prolactin and milk volume by Day 3-5 postpartum.' },
        { herb: 'Galega Officinalis (Goat’s Rue)', evidenceLevel: 'Level B', safetyNote: 'Supports development of mammary glandular tissue in IGT / hypoplasia.' },
        { herb: 'Trigonella Foenum-Graecum (Fenugreek)', evidenceLevel: 'Level B', safetyNote: 'Monitor for maternal hypoglycemia and GI upset; avoid in thyroid disorders.' }
      ],
      doulaCareTips: doulaTips
    };

    this.currentLactationAssessment.set(assessment);
    return assessment;
  }

  /**
   * Evaluates Infant-Maternal Circadian Synchrony & Sleep Fragmentation Index.
   */
  public evaluateCircadianSynchrony(input: IInfantCircadianInput): ICircadianAssessment {
    let maturityScore = 40;
    if (input.longestSleepStretchHours >= 4) maturityScore += 30;
    else if (input.longestSleepStretchHours >= 3) maturityScore += 15;

    if (input.dailyFeedingCount >= 8 && input.dailyFeedingCount <= 12) maturityScore += 20;
    if (input.nightWakeningCount <= 3) maturityScore += 10;

    let fragmentation: 'LOW' | 'MODERATE' | 'SEVERE' = 'MODERATE';
    if (input.maternalSleepHours < 4.5 || input.nightWakeningCount >= 5) {
      fragmentation = 'SEVERE';
    } else if (input.maternalSleepHours >= 6.5 && input.nightWakeningCount <= 2) {
      fragmentation = 'LOW';
    }

    const recs: string[] = [];
    if (fragmentation === 'SEVERE') {
      recs.push('Doula Night Support: Implement split partner shifts to guarantee at least one 4-hour consolidated sleep block for maternal REM restoration.');
      recs.push('Expose infant to natural morning sunlight (8:00 - 9:30 AM) to entrain suprachiasmatic nucleus circadian clock.');
    } else {
      recs.push('Healthy circadian trajectory; maintain dim amber lighting (<2000K) during night nursing to protect melatonin synthesis.');
    }

    const assessment: ICircadianAssessment = {
      circadianMaturityScore: Math.min(100, maturityScore),
      maternalSleepFragmentationIndex: fragmentation,
      recommendations: recs
    };

    this.currentCircadianAssessment.set(assessment);
    return assessment;
  }

  /**
   * Generates a FHIR R4 Bundle for 4th-Trimester Maternal Health, EPDS, and LATCH.
   */
  public generateFhirMaternalBundle(patientId: string = 'p_maternal_001'): string {
    const vitals = this.currentAssessment();
    const epds = this.currentEpdsAssessment();
    const latch = this.currentLactationAssessment();
    const timestamp = new Date().toISOString();

    const entries: any[] = [];

    // 1. Blood Pressure / MAP Observation (LOINC 85354-9 / 8478-0)
    if (vitals) {
      entries.push({
        resource: {
          resourceType: 'Observation',
          id: `obs-map-${Date.now()}`,
          status: 'final',
          category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }] }],
          code: { coding: [{ system: 'http://loinc.org', code: '8478-0', display: 'Mean blood pressure' }] },
          subject: { reference: `Patient/${patientId}` },
          effectiveDateTime: timestamp,
          valueQuantity: { value: vitals.meanArterialPressure, unit: 'mm[Hg]', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' },
          interpretation: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: vitals.riskTier === 'CRITICAL_EMERGENCY' ? 'HH' : vitals.riskTier === 'HIGH_URGENT' ? 'H' : 'N' }] }]
        }
      });
    }

    // 2. EPDS Observation (LOINC 89209-1)
    if (epds) {
      entries.push({
        resource: {
          resourceType: 'Observation',
          id: `obs-epds-${Date.now()}`,
          status: 'final',
          category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'survey' }] }],
          code: { coding: [{ system: 'http://loinc.org', code: '89209-1', display: 'Edinburgh Postnatal Depression Scale total score' }] },
          subject: { reference: `Patient/${patientId}` },
          effectiveDateTime: timestamp,
          valueInteger: epds.totalScore,
          interpretation: [{
            text: epds.riskTier === 'PROBABLE_DEPRESSION' ? 'High Risk for Perinatal Depression' : epds.riskTier === 'MILD_MODERATE_DISTRESS' ? 'Mild/Moderate Distress' : 'Low Risk'
          }]
        }
      });
    }

    // 3. LATCH Observation (LOINC 92801-0)
    if (latch) {
      entries.push({
        resource: {
          resourceType: 'Observation',
          id: `obs-latch-${Date.now()}`,
          status: 'final',
          code: { coding: [{ system: 'http://loinc.org', code: '92801-0', display: 'LATCH breastfeeding assessment score' }] },
          subject: { reference: `Patient/${patientId}` },
          effectiveDateTime: timestamp,
          valueInteger: latch.totalLatchScore,
          interpretation: [{ text: latch.supportLevel }]
        }
      });
    }

    const bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      timestamp,
      entry: entries
    };

    return JSON.stringify(bundle, null, 2);
  }
}
