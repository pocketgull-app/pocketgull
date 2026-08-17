import { Injectable, signal, computed } from '@angular/core';

export type FemaleCardiacSyndromeType = 'INOCA_MICROVASCULAR' | 'SCAD_DISSECTION' | 'MINOCA' | 'TAKOTSUBO_STRESS' | 'OBSTRUCTIVE_CAD' | 'NON_CARDIAC_EVALUATED';

export interface IFemaleCardiacPresentation {
  patientAge: number;
  gender: 'female' | 'male' | 'other';
  symptoms: {
    chestDiscomfortOrPressure?: boolean;
    jawNeckOrThroatPain?: boolean;
    interscapularOrBackPain?: boolean;
    epigastricBurningOrNausea?: boolean;
    unexplainedProfoundFatigue?: boolean;
    dyspneaOnMinimalExertion?: boolean;
    diaphoresisOrDizziness?: boolean;
    postpartumOrRecentParturition?: boolean; // SCAD risk
    severeEmotionalOrPhysicalStress?: boolean; // Takotsubo risk
  };
  highSensitivityTroponinI_ng_L?: number;
  restingEcgFindings?: string[];
  coronaryAngioObstructiveCadFound?: boolean; // false = non-obstructive
}

export interface IFemaleCardiacEvaluation {
  evaluationId: string;
  timestamp: string;
  suspectedSyndrome: FemaleCardiacSyndromeType;
  syndromeTitle: string;
  hsTroponinInterpretation: {
    measuredValue: number;
    femaleCutoffThreshold: number; // 16 ng/L
    maleCutoffThreshold: number; // 34 ng/L
    isElevatedByFemaleStandard: boolean;
    missedByMaleStandard: boolean; // True if between 16 and 34
  };
  misattributionWarning: string | null;
  clinicalActionPlan: string[];
  ahaGuidelinesCitation: string;
}

@Injectable({
  providedIn: 'root'
})
export class FemaleCardiacAtypicalScreeningService {
  readonly currentEvaluation = signal<IFemaleCardiacEvaluation | null>(null);

  // Sex-specific 99th percentile upper reference limits for hs-cTnI (ng/L)
  public readonly FEMALE_HS_TROPONIN_CUTOFF = 16.0;
  public readonly MALE_HS_TROPONIN_CUTOFF = 34.0;

  /**
   * Evaluates female atypical cardiovascular presentations and eliminates Yentl Syndrome misattribution.
   */
  public evaluateFemaleCardiovascularProfile(presentation: IFemaleCardiacPresentation): IFemaleCardiacEvaluation {
    const trop = presentation.highSensitivityTroponinI_ng_L ?? 0;
    const isFemaleElevated = trop >= this.FEMALE_HS_TROPONIN_CUTOFF;
    const missedByUnisex = trop >= this.FEMALE_HS_TROPONIN_CUTOFF && trop < this.MALE_HS_TROPONIN_CUTOFF;

    let suspected: FemaleCardiacSyndromeType = 'NON_CARDIAC_EVALUATED';
    let title = 'Non-Obstructive Low Cardiac Risk';
    const actions: string[] = [];
    let misattributionWarning: string | null = null;

    const hasAtypical = presentation.symptoms.jawNeckOrThroatPain ||
      presentation.symptoms.epigastricBurningOrNausea ||
      presentation.symptoms.unexplainedProfoundFatigue ||
      presentation.symptoms.interscapularOrBackPain;

    // 1. Spontaneous Coronary Artery Dissection (SCAD)
    if ((presentation.symptoms.postpartumOrRecentParturition || presentation.patientAge < 55) &&
        (presentation.symptoms.chestDiscomfortOrPressure || hasAtypical) &&
        (isFemaleElevated || (presentation.restingEcgFindings && presentation.restingEcgFindings.length > 0))) {
      suspected = 'SCAD_DISSECTION';
      title = 'Spontaneous Coronary Artery Dissection (SCAD) High Index of Suspicion';
      actions.push('Urgent Coronary Optical Coherence Tomography (OCT) or Intravascular Ultrasound (IVUS) to visualize intramural hematoma.');
      actions.push('Conservative medical management preferred over routine stenting (PCI) to avoid propagating intimal tears unless hemodynamic instability.');
      actions.push('Avoid aggressive systemic thrombolysis.');
    }
    // 2. Takotsubo (Stress) Cardiomyopathy
    else if (presentation.symptoms.severeEmotionalOrPhysicalStress && (presentation.symptoms.chestDiscomfortOrPressure || presentation.symptoms.dyspneaOnMinimalExertion) && isFemaleElevated) {
      suspected = 'TAKOTSUBO_STRESS';
      title = 'Takotsubo (Stress-Induced) Cardiomyopathy (Apical Ballooning Syndrome)';
      actions.push('Stat Transthoracic Echocardiogram (TTE) to confirm transient apical/mid-ventricular dyskinesis with basal hyperkinesis.');
      actions.push('Serial hs-cTnI and NT-proBNP monitoring; initiate guideline-directed ACEi/ARB and beta-blocker therapy.');
    }
    // 3. INOCA / MINOCA (Ischemia with Non-Obstructive Coronary Arteries)
    else if (presentation.coronaryAngioObstructiveCadFound === false && (isFemaleElevated || hasAtypical || presentation.symptoms.chestDiscomfortOrPressure)) {
      suspected = 'INOCA_MICROVASCULAR';
      title = 'Ischemia with Non-Obstructive Coronary Arteries (INOCA / Coronary Microvascular Dysfunction)';
      actions.push('Perform Invasive Coronary Function Testing (CFR and IMR) via acetylcholine spasm provocation.');
      actions.push('Initiate microvascular anti-anginal regimen: Calcium channel blockers (Diltiazem), Ranolazine, and High-intensity Statin.');
      actions.push('Enroll in specialized Women\'s Heart Health comprehensive rehabilitation.');
    }
    // 4. Standard Obstructive CAD
    else if (presentation.coronaryAngioObstructiveCadFound === true || (isFemaleElevated && presentation.symptoms.chestDiscomfortOrPressure)) {
      suspected = 'OBSTRUCTIVE_CAD';
      title = 'Acute Coronary Syndrome (Obstructive CAD)';
      actions.push('Stat coronary angiography, dual antiplatelet therapy (DAPT), and therapeutic anticoagulation.');
    } else {
      actions.push('Outpatient functional stress cardiac MRI or PET perfusion imaging if exertional symptoms persist.');
    }

    // Guardrail against psychogenic/anxiety misattribution
    if (hasAtypical && !presentation.symptoms.chestDiscomfortOrPressure) {
      misattributionWarning = 'YENTL SYNDROME PREVENTION GUARDRAIL: Female patient exhibits classic atypical coronary ischemia markers (epigastric burning, profound fatigue, jaw/neck pain). Mandating objective hs-cTnI and 12-lead ECG ruling prior to psychogenic (anxiety/GERD) classification.';
    }

    const evaluation: IFemaleCardiacEvaluation = {
      evaluationId: `FEM-CARD-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      suspectedSyndrome: suspected,
      syndromeTitle: title,
      hsTroponinInterpretation: {
        measuredValue: trop,
        femaleCutoffThreshold: this.FEMALE_HS_TROPONIN_CUTOFF,
        maleCutoffThreshold: this.MALE_HS_TROPONIN_CUTOFF,
        isElevatedByFemaleStandard: isFemaleElevated,
        missedByMaleStandard: missedByUnisex
      },
      misattributionWarning,
      clinicalActionPlan: actions,
      ahaGuidelinesCitation: 'AHA/ACC 2023 Guideline for Chronic Coronary Disease & 2021 AHA Statement on INOCA/MINOCA in Women'
    };

    this.currentEvaluation.set(evaluation);
    return evaluation;
  }
}
