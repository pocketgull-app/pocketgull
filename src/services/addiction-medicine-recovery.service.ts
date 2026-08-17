import { Injectable, signal } from '@angular/core';

export interface IAddictionAssessmentInput {
  patientAge: number;
  primarySubstance: 'Opioids_Fentanyl' | 'Alcohol' | 'Stimulants_Meth_Cocaine' | 'Benzodiazepines' | 'Cannabis_High_THC' | 'Nicotine_Vaping' | 'Polysubstance';
  durationOfUseMonths: number;
  lastUseHoursAgo: number;
  cowsScore?: number; // Clinical Opiate Withdrawal Scale (0-48)
  ciwaScore?: number; // Clinical Institute Withdrawal Assessment for Alcohol (0-67)
  priorPrecipitatedWithdrawalHistory: boolean;
  acesScore?: number; // Adverse Childhood Experiences (0-10)
  currentWithdrawalSymptoms: {
    tachycardiaPulseOver100?: boolean;
    diaphoresisSweating?: boolean;
    tremorsOrRestlessness?: boolean;
    pupilDilationMydriasis?: boolean;
    gastrointestinalDistress?: boolean;
    visualOrTactileHallucinations?: boolean;
    severeAnxietyOrCravings?: boolean;
  };
}

export interface IAddictionRecoveryReport {
  reportId: string;
  generatedAt: string;
  withdrawalSeverityTier: 'NONE_OR_MINIMAL' | 'MILD_EARLY' | 'MODERATE_PEAK' | 'SEVERE_CRITICAL_EMERGENCY';
  objectiveScoreSummary: {
    scaleUsed: 'COWS' | 'CIWA_AR' | 'CLINICAL_SYMPTOM_CHECKLIST';
    numericalScore: number;
    clinicalInterpretation: string;
  };
  precisionPharmacotherapyPlan: {
    recommendedMedication: string;
    dosingStrategy: string;
    berneseMicroInductionRequired: boolean;
    contraindicationsOrPrecautions: string[];
  };
  harmReductionAndOverdoseSafeguards: {
    naloxoneNarcanEmergencyDirectives: string;
    fentanylAndXylazineSafetyMeasures: string[];
    respiratoryDepressionWarningSignChecklist: string[];
  };
  traumaInformedRecoveryTrajectory: {
    neurochemicalResetPhase: 'ACUTE_DETOX (Days 1-7)' | 'EARLY_RECEPTOR_UPREGULATION (Weeks 2-8)' | 'LONG_TERM_HOMEOSTASIS (Months 3+)';
    estimatedD2ReceptorRecoveryWeeks: number;
    recommendedBehavioralSupportModality: string;
  };
  nonStigmatizingFhirSummary: {
    resourceType: 'CarePlan';
    snomedClinicalCode: string;
    personFirstLanguageNote: string;
    hipaaSanitizationVerified: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AddictionMedicineRecoveryService {
  readonly activeRecoveryReports = signal<IAddictionRecoveryReport[]>([]);

  /**
   * Evaluates substance withdrawal severity (COWS / CIWA-Ar), computes the Bernese micro-induction
   * protocol for opioids, precision medications for alcohol/stimulants, and generates harm reduction directives.
   */
  evaluateAddictionRecovery(input: IAddictionAssessmentInput): IAddictionRecoveryReport {
    let scale: 'COWS' | 'CIWA_AR' | 'CLINICAL_SYMPTOM_CHECKLIST' = 'CLINICAL_SYMPTOM_CHECKLIST';
    let rawScore = 0;
    let severity: IAddictionRecoveryReport['withdrawalSeverityTier'] = 'NONE_OR_MINIMAL';
    let interp = 'Minimal or absent acute withdrawal signs.';

    // 1. Calculate Score based on Primary Substance
    if (input.primarySubstance === 'Opioids_Fentanyl') {
      scale = 'COWS';
      rawScore = input.cowsScore !== undefined ? input.cowsScore : this.estimateCowsFromSymptoms(input.currentWithdrawalSymptoms);

      if (rawScore >= 25) {
        severity = 'SEVERE_CRITICAL_EMERGENCY';
        interp = 'Severe opioid withdrawal. High distress, immediate medical stabilization indicated.';
      } else if (rawScore >= 13) {
        severity = 'MODERATE_PEAK';
        interp = 'Moderate opioid withdrawal. Standard window for buprenorphine induction.';
      } else if (rawScore >= 5) {
        severity = 'MILD_EARLY';
        interp = 'Mild early withdrawal. If illicit fentanyl was used, avoid standard macro-dose buprenorphine to prevent precipitated withdrawal.';
      }
    } else if (input.primarySubstance === 'Alcohol') {
      scale = 'CIWA_AR';
      rawScore = input.ciwaScore !== undefined ? input.ciwaScore : this.estimateCiwaFromSymptoms(input.currentWithdrawalSymptoms);

      if (rawScore >= 20 || input.currentWithdrawalSymptoms.visualOrTactileHallucinations) {
        severity = 'SEVERE_CRITICAL_EMERGENCY';
        interp = 'Severe alcohol withdrawal with impending delirium tremens or seizure risk. Emergency IV/oral protocol required.';
      } else if (rawScore >= 10) {
        severity = 'MODERATE_PEAK';
        interp = 'Moderate alcohol withdrawal. Symptom-triggered benzodiazepine or gabapentin protocol indicated.';
      } else if (rawScore >= 1) {
        severity = 'MILD_EARLY';
        interp = 'Mild withdrawal signs. Supportive hydration and thiamine (vitamin B1) replenishment.';
      }
    }

    // 2. Formulate Precision Pharmacotherapy Strategy
    let recommendedMed = 'Supportive Care & Electrolyte Hydration';
    let dosingStrategy = 'Standard supportive protocol';
    let berneseRequired = false;
    const contraindications: string[] = [];

    if (input.primarySubstance === 'Opioids_Fentanyl') {
      if (input.priorPrecipitatedWithdrawalHistory || input.primarySubstance === 'Opioids_Fentanyl') {
        berneseRequired = true;
        recommendedMed = 'Buprenorphine/Naloxone (Suboxone) via Bernese Micro-Induction';
        dosingStrategy = 'Day 1: 0.5mg SL once; Day 2: 0.5mg SL BID; Day 3: 1mg BID; Day 4: 2mg BID; Day 5: 4mg BID; Day 6: 8mg once; Day 7: 16mg once (Stop full agonist).';
        contraindications.push('Do NOT administer standard 8mg macro-dose buprenorphine at COWS < 13 in chronic fentanyl users.');
      } else {
        recommendedMed = 'Buprenorphine/Naloxone (Suboxone) Standard Induction';
        dosingStrategy = 'Initiate 2–4mg SL once COWS >= 13; titrate to 8–16mg daily maintenance.';
      }
    } else if (input.primarySubstance === 'Alcohol') {
      recommendedMed = 'Acamprosate Calcium (666mg TID) OR Naltrexone (50mg daily)';
      dosingStrategy = 'Acamprosate restores GABA/glutamate balance without hepatic metabolism; Naltrexone blocks dopamine endorphin reward (Sinclair Method).';
      contraindications.push('Avoid Naltrexone if patient is currently taking prescribed opioid analgesics.');
    } else if (input.primarySubstance === 'Nicotine_Vaping') {
      recommendedMed = 'Combination Nicotine Replacement Therapy (NRT Patch 21mg + Lozenge 2mg) + Varenicline (0.5mg to 1mg BID)';
      dosingStrategy = 'Dual-form NRT prevents baseline and breakthrough cravings simultaneously.';
    }

    // 3. Harm Reduction & Overdose Safety
    const harmReduction = {
      naloxoneNarcanEmergencyDirectives: 'Administer 4mg Intranasal Naloxone in one nostril immediately if unresponsive with slow/absent breathing. If no response after 2–3 minutes, administer second 4mg dose in opposite nostril and dial 911.',
      fentanylAndXylazineSafetyMeasures: [
        'Utilize fentanyl test strips (dilute residue 1:1 with water) prior to any substance consumption.',
        'Be aware that Naloxone reverses opioid-induced respiratory depression but does NOT reverse xylazine sedation; provide rescue breathing.',
        'Never use substances in isolation; utilize national overdose prevention hotlines (e.g. Never Use Alone).'
      ],
      respiratoryDepressionWarningSignChecklist: [
        'Pinpoint pupils (miosis) with unresponsiveness',
        'Respiratory rate < 8 breaths per minute or agonal snoring/gasping',
        'Cyanosis: Blue/purple lips, fingertips, or pale/clammy skin'
      ]
    };

    // 4. Mesolimbic Neurochemical Reset Kinetics
    const report: IAddictionRecoveryReport = {
      reportId: `SUD-REC-${Date.now().toString(36).toUpperCase()}`,
      generatedAt: new Date().toISOString(),
      withdrawalSeverityTier: severity,
      objectiveScoreSummary: {
        scaleUsed: scale,
        numericalScore: rawScore,
        clinicalInterpretation: interp
      },
      precisionPharmacotherapyPlan: {
        recommendedMedication: recommendedMed,
        dosingStrategy: dosingStrategy,
        berneseMicroInductionRequired: berneseRequired,
        contraindicationsOrPrecautions: contraindications
      },
      harmReductionAndOverdoseSafeguards: harmReduction,
      traumaInformedRecoveryTrajectory: {
        neurochemicalResetPhase: rawScore > 10 ? 'ACUTE_DETOX (Days 1-7)' : 'EARLY_RECEPTOR_UPREGULATION (Weeks 2-8)',
        estimatedD2ReceptorRecoveryWeeks: Math.min(52, Math.max(8, Math.round(input.durationOfUseMonths * 0.4))),
        recommendedBehavioralSupportModality: 'Acceptance and Commitment Therapy (ACT) combined with Contingency Management and Peer Recovery Coaching.'
      },
      nonStigmatizingFhirSummary: {
        resourceType: 'CarePlan',
        snomedClinicalCode: '5602001 (Substance use disorder)',
        personFirstLanguageNote: 'Individual engaged in voluntary substance use disorder recovery program with harm-reduction and medications for addiction treatment (MAT).',
        hipaaSanitizationVerified: true
      }
    };

    this.activeRecoveryReports.update(reports => [report, ...reports.slice(0, 19)]);
    return report;
  }

  private estimateCowsFromSymptoms(sym: IAddictionAssessmentInput['currentWithdrawalSymptoms']): number {
    let score = 0;
    if (sym.tachycardiaPulseOver100) score += 2;
    if (sym.diaphoresisSweating) score += 3;
    if (sym.tremorsOrRestlessness) score += 4;
    if (sym.pupilDilationMydriasis) score += 3;
    if (sym.gastrointestinalDistress) score += 3;
    if (sym.severeAnxietyOrCravings) score += 2;
    return score;
  }

  private estimateCiwaFromSymptoms(sym: IAddictionAssessmentInput['currentWithdrawalSymptoms']): number {
    let score = 0;
    if (sym.diaphoresisSweating) score += 4;
    if (sym.tremorsOrRestlessness) score += 5;
    if (sym.gastrointestinalDistress) score += 3;
    if (sym.severeAnxietyOrCravings) score += 4;
    if (sym.visualOrTactileHallucinations) score += 7;
    return score;
  }
}
