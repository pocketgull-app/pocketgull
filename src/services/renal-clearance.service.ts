import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';

export type CkdStage = 'G1' | 'G2' | 'G3a' | 'G3b' | 'G4' | 'G5';
export type AkiStage = 'No AKI' | 'KDIGO Stage 1' | 'KDIGO Stage 2' | 'KDIGO Stage 3';
export type BiologicalSex = 'female' | 'male';

export interface IRenalDosingGuideline {
  drugName: string;
  drugClass: string;
  primaryClearanceMechanism: string;
  renalClearancePercent: number;
  crClThreshold: number; // Cutoff for action in mL/min
  egfrThreshold: number; // Cutoff for action in mL/min/1.73m2
  actionRequired: 'standard' | 'dose_reduction' | 'interval_extension' | 'contraindicated';
  recommendedDosage: string;
  clinicalRationale: string;
  fdaBlackBoxWarning?: boolean;
}

export interface IRenalClearanceAssessment {
  timestamp: string;
  serumCreatinine: number; // mg/dL
  baselineCreatinine: number; // mg/dL
  egfrCkdEpi: number; // mL/min/1.73m2
  ckdStage: CkdStage;
  crClCockcroftGault: number; // mL/min
  crClNormalizedIbW: number; // mL/min (adjusted for obesity if BMI >= 30)
  akiStage: AkiStage;
  akiRiskFlag: boolean;
  urineOutputStatus: string;
  highRiskMedicationsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class RenalClearanceService {
  private patientState = (() => { try { return inject(PatientStateService); } catch { return null; } })();

  // Reactive clinical telemetry inputs
  readonly serumCreatinine = signal<number>(1.1); // mg/dL
  readonly baselineCreatinine = signal<number>(1.0); // mg/dL
  readonly patientAge = signal<number>(62); // years
  readonly biologicalSex = signal<BiologicalSex>('female');
  readonly weightKg = signal<number>(70); // kg
  readonly heightCm = signal<number>(165); // cm
  readonly urineOutputMlKgHr = signal<number>(0.8); // mL/kg/hr (normal >= 0.5)

  // Medication list for continuous renal drug safety audit
  readonly currentMedications = signal<string[]>([
    'Metformin',
    'Gabapentin',
    'Apixaban',
    'Empagliflozin',
    'Lisinopril'
  ]);

  constructor() {
    if (this.patientState) {
      const pAge = this.patientState.patientAge();
      if (pAge > 0) {
        this.patientAge.set(pAge);
      }
    }
  }

  // --- Mathematical Calculators (Pure Domain Methods) ---

  /**
   * CKD-EPI 2021 Race-Free Creatinine Equation (NKF & ASN Recommendation)
   * Ref: Inker LA, et al. NEJM 2021; 385:1737-1749.
   */
  public calculateCkdEpi2021(scr: number, age: number, sex: BiologicalSex): number {
    if (scr <= 0 || age <= 0) return 90;

    const isFemale = sex === 'female';
    const kappa = isFemale ? 0.7 : 0.9;
    const alpha = isFemale ? -0.241 : -0.302;
    const sexFactor = isFemale ? 1.012 : 1.0;

    const scrRatio = scr / kappa;
    const minVal = Math.min(scrRatio, 1.0);
    const maxVal = Math.max(scrRatio, 1.0);

    const egfr = 142 * Math.pow(minVal, alpha) * Math.pow(maxVal, -1.200) * Math.pow(0.9938, age) * sexFactor;
    return Math.round(egfr * 10) / 10;
  }

  /**
   * Translates eGFR into KDIGO CKD Classification Stage (G1 to G5)
   */
  public determineCkdStage(egfr: number): CkdStage {
    if (egfr >= 90) return 'G1';
    if (egfr >= 60) return 'G2';
    if (egfr >= 45) return 'G3a';
    if (egfr >= 30) return 'G3b';
    if (egfr >= 15) return 'G4';
    return 'G5';
  }

  /**
   * Cockcroft-Gault Creatinine Clearance (CrCl in mL/min) with Devine Ideal Body Weight (IBW)
   * and Adjusted Body Weight (AdjBW) for obesity (BMI >= 30 kg/m2).
   * Standard for FDA-Approved Prescribing Labels.
   */
  public calculateCockcroftGault(
    scr: number,
    age: number,
    weightKg: number,
    heightCm: number,
    sex: BiologicalSex
  ): { crClActual: number; crClAdjusted: number; ibwKg: number; isObese: boolean } {
    if (scr <= 0 || age <= 0 || weightKg <= 0 || heightCm <= 0) {
      return { crClActual: 90, crClAdjusted: 90, ibwKg: 65, isObese: false };
    }

    const heightInches = heightCm / 2.54;
    const isFemale = sex === 'female';
    const femaleFactor = isFemale ? 0.85 : 1.0;

    // Devine Ideal Body Weight
    const baseIbw = isFemale ? 45.5 : 50.0;
    const ibwKg = baseIbw + 2.3 * Math.max(0, heightInches - 60);

    // Calculate BMI
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    const isObese = bmi >= 30 || weightKg >= 1.3 * ibwKg;

    // Adjusted Body Weight for obesity (40% excess weight factor)
    const dosingWeightKg = isObese ? ibwKg + 0.4 * (weightKg - ibwKg) : weightKg;

    const crClActual = ((140 - age) * weightKg * femaleFactor) / (72 * scr);
    const crClAdjusted = ((140 - age) * dosingWeightKg * femaleFactor) / (72 * scr);

    return {
      crClActual: Math.round(crClActual * 10) / 10,
      crClAdjusted: Math.round(crClAdjusted * 10) / 10,
      ibwKg: Math.round(ibwKg * 10) / 10,
      isObese
    };
  }

  /**
   * KDIGO 2012 Clinical Practice Guideline for Acute Kidney Injury (AKI)
   * Evaluates serum creatinine kinetics and urine output.
   */
  public evaluateAkiStage(
    currentScr: number,
    baselineScr: number,
    urineOutputMlKgHr: number = 0.8
  ): { stage: AkiStage; isAki: boolean; rationale: string } {
    if (currentScr <= 0 || baselineScr <= 0) {
      return { stage: 'No AKI', isAki: false, rationale: 'Invalid baseline values.' };
    }

    const deltaScr = currentScr - baselineScr;
    const foldIncrease = currentScr / baselineScr;

    // KDIGO Stage 3
    if (foldIncrease >= 3.0 || currentScr >= 4.0 || urineOutputMlKgHr < 0.3) {
      return {
        stage: 'KDIGO Stage 3',
        isAki: true,
        rationale: `Serum creatinine elevated >= 3.0x baseline (${foldIncrease.toFixed(2)}x) or absolute Cr >= 4.0 mg/dL (${currentScr} mg/dL). High risk of dialysis initiation.`
      };
    }

    // KDIGO Stage 2
    if (foldIncrease >= 2.0) {
      return {
        stage: 'KDIGO Stage 2',
        isAki: true,
        rationale: `Serum creatinine 2.0 - 2.9x baseline (${foldIncrease.toFixed(2)}x). Significant nephron loss.`
      };
    }

    // KDIGO Stage 1
    if (deltaScr >= 0.3 || foldIncrease >= 1.5 || (urineOutputMlKgHr < 0.5 && urineOutputMlKgHr > 0)) {
      return {
        stage: 'KDIGO Stage 1',
        isAki: true,
        rationale: `Acute creatinine rise >= 0.3 mg/dL (+${deltaScr.toFixed(2)} mg/dL) or 1.5 - 1.9x baseline. Early renal stress.`
      };
    }

    return {
      stage: 'No AKI',
      isAki: false,
      rationale: 'Renal function stable within normal kinetic variance.'
    };
  }

  // --- Renal Medication Posology Engine ---

  /**
   * Curated Renal Pharmacokinetics Rule Base for High-Risk Renally Cleared Drugs
   */
  private static readonly RENAL_DRUG_DATABASE: Array<{
    name: string;
    class: string;
    renalClearancePercent: number;
    primaryClearanceMechanism: string;
    evaluate: (crCl: number, egfr: number) => {
      actionRequired: IRenalDosingGuideline['actionRequired'];
      recommendedDosage: string;
      clinicalRationale: string;
      fdaBlackBoxWarning?: boolean;
    };
  }> = [
    {
      name: 'Metformin',
      class: 'Biguanide Antidiabetic',
      renalClearancePercent: 90,
      primaryClearanceMechanism: 'Glomerular filtration & active tubular secretion (OCT2/MATE1)',
      evaluate: (crCl, egfr) => {
        if (egfr < 30) {
          return {
            actionRequired: 'contraindicated',
            recommendedDosage: 'DISCONTINUE METFORMIN IMMEDIATELY',
            clinicalRationale: 'CONTRAINDICATED (eGFR < 30 mL/min/1.73m2). Severe drug accumulation leads to inhibition of hepatic mitochondrial glycerol-3-phosphate dehydrogenase, triggering fatal lactic acidosis (50% mortality).',
            fdaBlackBoxWarning: true
          };
        }
        if (egfr < 45) {
          return {
            actionRequired: 'dose_reduction',
            recommendedDosage: 'Max 500 mg daily or 50% dose reduction. Do not initiate new therapy.',
            clinicalRationale: 'eGFR 30 - 44 mL/min/1.73m2. Reduced clearance elevates lactic acidosis hazard. Monitor renal panel every 3 months.'
          };
        }
        if (egfr < 60) {
          return {
            actionRequired: 'dose_reduction',
            recommendedDosage: 'Max 1000 mg daily in divided doses.',
            clinicalRationale: 'eGFR 45 - 59 mL/min/1.73m2. Modest dose cap recommended; monitor eGFR semi-annually.'
          };
        }
        return {
          actionRequired: 'standard',
          recommendedDosage: 'Standard clinical dosing (up to 2000-2550 mg daily).',
          clinicalRationale: 'Normal renal clearance (eGFR >= 60 mL/min/1.73m2).'
        };
      }
    },
    {
      name: 'Gabapentin',
      class: 'GABA Analog / Anticonvulsant / Neuropathic',
      renalClearancePercent: 100,
      primaryClearanceMechanism: 'Exclusively renal unchanged clearance via glomerular filtration',
      evaluate: (crCl, egfr) => {
        if (crCl < 15) {
          return {
            actionRequired: 'dose_reduction',
            recommendedDosage: '100 mg to 300 mg every other day or post-hemodialysis supplemental dose only.',
            clinicalRationale: 'CrCl < 15 mL/min. Extreme half-life prolongation (from 5-7h to >50h). Severe toxicity manifests as myoclonus, ataxia, and coma.'
          };
        }
        if (crCl < 30) {
          return {
            actionRequired: 'dose_reduction',
            recommendedDosage: 'Max 200 mg to 700 mg once daily at bedtime.',
            clinicalRationale: 'CrCl 15 - 29 mL/min. Titrate downward by 70% to prevent profound sedation and neurotoxicity.'
          };
        }
        if (crCl < 60) {
          return {
            actionRequired: 'dose_reduction',
            recommendedDosage: 'Max 400 mg to 1400 mg daily in two divided doses (BID).',
            clinicalRationale: 'CrCl 30 - 59 mL/min. 50% clearance reduction requires proportional dose adjustment.'
          };
        }
        return {
          actionRequired: 'standard',
          recommendedDosage: 'Standard dosing (900 mg to 3600 mg daily in 3 divided doses).',
          clinicalRationale: 'CrCl >= 60 mL/min: Normal renal clearance.'
        };
      }
    },
    {
      name: 'Apixaban',
      class: 'Direct Oral Anticoagulant (DOAC) / Factor Xa Inhibitor',
      renalClearancePercent: 27,
      primaryClearanceMechanism: 'Dual renal (27%) and biliary/intestinal excretion (73%)',
      evaluate: (crCl, egfr) => {
        if (crCl < 15) {
          return {
            actionRequired: 'contraindicated',
            recommendedDosage: 'Avoid use or require expert hematology/nephrology oversight.',
            clinicalRationale: 'CrCl < 15 mL/min. Lack of clinical trial data in non-dialysis ESRD. High risk of major hemorrhage.'
          };
        }
        if (crCl < 30 || egfr < 30) {
          return {
            actionRequired: 'dose_reduction',
            recommendedDosage: '2.5 mg BID (if meeting dose reduction criteria: Age >= 80, Weight <= 60kg, or Cr >= 1.5).',
            clinicalRationale: 'Moderate to severe renal impairment prolongs factor Xa inhibition; monitor anti-Xa levels if feasible.'
          };
        }
        return {
          actionRequired: 'standard',
          recommendedDosage: '5 mg orally twice daily (standard stroke prevention in non-valvular AF).',
          clinicalRationale: 'Normal/mild renal clearance (CrCl >= 30 mL/min).'
        };
      }
    },
    {
      name: 'Dabigatran',
      class: 'Direct Thrombin Inhibitor (DOAC)',
      renalClearancePercent: 80,
      primaryClearanceMechanism: 'Predominantly renal (80% unchanged elimination)',
      evaluate: (crCl, egfr) => {
        if (crCl < 15) {
          return {
            actionRequired: 'contraindicated',
            recommendedDosage: 'ABSOLUTELY CONTRAINDICATED (CrCl < 15 mL/min)',
            clinicalRationale: 'High renal elimination (80%). Severe clearance failure produces catastrophic, uncorrectable systemic bleeding.',
            fdaBlackBoxWarning: true
          };
        }
        if (crCl <= 30) {
          return {
            actionRequired: 'dose_reduction',
            recommendedDosage: '75 mg orally twice daily (50% reduction).',
            clinicalRationale: 'CrCl 15 - 30 mL/min: Severe accumulation risk. Monitor coagulation parameters closely.'
          };
        }
        return {
          actionRequired: 'standard',
          recommendedDosage: '150 mg orally twice daily.',
          clinicalRationale: 'CrCl > 30 mL/min: Standard dosing.'
        };
      }
    },
    {
      name: 'Empagliflozin',
      class: 'SGLT2 Inhibitor',
      renalClearancePercent: 54,
      primaryClearanceMechanism: 'Hepatic glucuronidation and renal excretion',
      evaluate: (crCl, egfr) => {
        if (egfr < 20) {
          return {
            actionRequired: 'contraindicated',
            recommendedDosage: 'Initiation not recommended (eGFR < 20 mL/min/1.73m2).',
            clinicalRationale: 'Glomerular filtration threshold below which glycemic efficacy is negligible; discontinue if hemodialysis is initiated.'
          };
        }
        if (egfr < 45) {
          return {
            actionRequired: 'dose_reduction',
            recommendedDosage: '10 mg once daily (maintain cardio-renal protection benefit).',
            clinicalRationale: 'eGFR 20 - 44 mL/min/1.73m2. Reduced glucosuric effect but maintains slowing of CKD progression and heart failure reduction.'
          };
        }
        return {
          actionRequired: 'standard',
          recommendedDosage: '10 mg to 25 mg once daily in the morning.',
          clinicalRationale: 'eGFR >= 45 mL/min/1.73m2: Full metabolic and nephroprotective efficacy.'
        };
      }
    },
    {
      name: 'Lisinopril',
      class: 'ACE Inhibitor / Renin-Angiotensin System Blocker',
      renalClearancePercent: 100,
      primaryClearanceMechanism: 'Exclusively renal elimination without hepatic metabolism',
      evaluate: (crCl, egfr) => {
        if (egfr < 30 || crCl < 30) {
          return {
            actionRequired: 'dose_reduction',
            recommendedDosage: 'Initial dose 2.5 mg to 5 mg once daily; titrate cautiously.',
            clinicalRationale: 'CrCl < 30 mL/min: ACE inhibition reduces efferent arteriolar tone, causing transient further eGFR drop and hyperkalemia risk.'
          };
        }
        return {
          actionRequired: 'standard',
          recommendedDosage: 'Standard dose 10 mg to 40 mg once daily.',
          clinicalRationale: 'Adequate renal clearance. Renoprotective in proteinuric CKD Stages 1-3.'
        };
      }
    }
  ];

  /**
   * Evaluates renal dosing guidelines for a specific medication.
   */
  public evaluateMedicationRenalDosing(
    medicationName: string,
    crCl?: number,
    egfr?: number
  ): IRenalDosingGuideline | null {
    const entry = RenalClearanceService.RENAL_DRUG_DATABASE.find(d =>
      d.name.toLowerCase() === medicationName.toLowerCase() ||
      medicationName.toLowerCase().includes(d.name.toLowerCase())
    );
    if (!entry) return null;

    const effectiveCrCl = crCl !== undefined ? crCl : this.crClCockcroftGault();
    const effectiveEgfr = egfr !== undefined ? egfr : this.egfrCkdEpi();

    const evaluation = entry.evaluate(effectiveCrCl, effectiveEgfr);

    return {
      drugName: entry.name,
      drugClass: entry.class,
      primaryClearanceMechanism: entry.primaryClearanceMechanism,
      renalClearancePercent: entry.renalClearancePercent,
      crClThreshold: 60,
      egfrThreshold: 60,
      actionRequired: evaluation.actionRequired,
      recommendedDosage: evaluation.recommendedDosage,
      clinicalRationale: evaluation.clinicalRationale,
      fdaBlackBoxWarning: evaluation.fdaBlackBoxWarning
    };
  }

  // --- Computed Reactive Telemetry Signals ---

  readonly egfrCkdEpi = computed<number>(() => {
    return this.calculateCkdEpi2021(
      this.serumCreatinine(),
      this.patientAge(),
      this.biologicalSex()
    );
  });

  readonly ckdStage = computed<CkdStage>(() => {
    return this.determineCkdStage(this.egfrCkdEpi());
  });

  readonly cockcroftGaultResult = computed(() => {
    return this.calculateCockcroftGault(
      this.serumCreatinine(),
      this.patientAge(),
      this.weightKg(),
      this.heightCm(),
      this.biologicalSex()
    );
  });

  readonly crClCockcroftGault = computed<number>(() => {
    const res = this.cockcroftGaultResult();
    return res.isObese ? res.crClAdjusted : res.crClActual;
  });

  readonly akiAssessment = computed(() => {
    return this.evaluateAkiStage(
      this.serumCreatinine(),
      this.baselineCreatinine(),
      this.urineOutputMlKgHr()
    );
  });

  readonly akiStage = computed<AkiStage>(() => {
    return this.akiAssessment().stage;
  });

  readonly akiRiskFlag = computed<boolean>(() => {
    return this.akiAssessment().isAki;
  });

  readonly dosingTitrations = computed<IRenalDosingGuideline[]>(() => {
    const meds = this.currentMedications();
    const crCl = this.crClCockcroftGault();
    const egfr = this.egfrCkdEpi();

    return meds
      .map(m => this.evaluateMedicationRenalDosing(m, crCl, egfr))
      .filter((g): g is IRenalDosingGuideline => g !== null);
  });

  readonly highRiskMedicationsCount = computed<number>(() => {
    return this.dosingTitrations().filter(t => t.actionRequired === 'contraindicated' || t.actionRequired === 'dose_reduction').length;
  });

  readonly fullAssessment = computed<IRenalClearanceAssessment>(() => {
    const cg = this.cockcroftGaultResult();
    const aki = this.akiAssessment();

    return {
      timestamp: new Date().toISOString(),
      serumCreatinine: this.serumCreatinine(),
      baselineCreatinine: this.baselineCreatinine(),
      egfrCkdEpi: this.egfrCkdEpi(),
      ckdStage: this.ckdStage(),
      crClCockcroftGault: cg.crClActual,
      crClNormalizedIbW: cg.crClAdjusted,
      akiStage: aki.stage,
      akiRiskFlag: aki.isAki,
      urineOutputStatus: `${this.urineOutputMlKgHr()} mL/kg/hr (${this.urineOutputMlKgHr() >= 0.5 ? 'Normal Diuresis' : 'Oliguria Alert'})`,
      highRiskMedicationsCount: this.highRiskMedicationsCount()
    };
  });

  // Mutator methods for interactive clinical simulation
  public setCreatinine(scr: number, baseline?: number) {
    this.serumCreatinine.set(Math.max(0.1, scr));
    if (baseline !== undefined) {
      this.baselineCreatinine.set(Math.max(0.1, baseline));
    }
  }

  public setDemographics(age: number, sex: BiologicalSex, weightKg: number, heightCm: number) {
    this.patientAge.set(age);
    this.biologicalSex.set(sex);
    this.weightKg.set(weightKg);
    this.heightCm.set(heightCm);
  }

  public addMedication(medName: string) {
    if (!this.currentMedications().includes(medName)) {
      this.currentMedications.update(list => [...list, medName]);
    }
  }

  public removeMedication(medName: string) {
    this.currentMedications.update(list => list.filter(m => m !== medName));
  }
}
