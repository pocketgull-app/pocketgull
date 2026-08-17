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

@Injectable({
  providedIn: 'root'
})
export class MaternalPostpartumSentinelService {
  readonly currentAssessment = signal<IMaternalSafetyAssessment | null>(null);
  readonly assessmentsHistory = signal<IMaternalSafetyAssessment[]>([]);

  readonly isUrgentAlertActive = computed(() => {
    const curr = this.currentAssessment();
    return curr?.urgentActionRequired ?? false;
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
}
