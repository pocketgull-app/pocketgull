import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';

export type ChildPughClass = 'Class A' | 'Class B' | 'Class C';
export type AscitesGrade = 'none' | 'mild' | 'moderate_severe';
export type EncephalopathyGrade = 'none' | 'grade_1_2' | 'grade_3_4';

export interface IHepaticDosingGuideline {
  drugName: string;
  drugClass: string;
  primaryMetabolismPathway: string;
  hepaticExtractionRatio: 'high' | 'intermediate' | 'low';
  actionRequired: 'standard' | 'dose_reduction' | 'interval_extension' | 'contraindicated';
  recommendedDosage: string;
  clinicalRationale: string;
  fdaBlackBoxWarning?: boolean;
  safeAnalgesicAlternative?: string;
}

export interface IChildPughBreakdown {
  bilirubinPoints: number;
  albuminPoints: number;
  inrPoints: number;
  ascitesPoints: number;
  encephalopathyPoints: number;
  totalScore: number;
  cirrhosisClass: ChildPughClass;
  oneYearSurvivalPercent: number;
  twoYearSurvivalPercent: number;
  perioperativeMortalityPercent: number;
}

export interface IMeldNaBreakdown {
  meldInitial: number;
  meldNa: number;
  cappedCr: number;
  cappedBili: number;
  cappedInr: number;
  cappedNa: number;
  dialysisAssigned: boolean;
  estimated90DayMortalityPercent: number;
  transplantListingPriority: 'Standard' | 'Urgent' | 'STAT Emergency MELD >= 35';
}

export interface IHepaticClearanceAssessment {
  timestamp: string;
  totalBilirubin: number;
  serumAlbumin: number;
  inr: number;
  serumCreatinine: number;
  serumSodium: number;
  dialysisInPastWeek: boolean;
  ascites: AscitesGrade;
  encephalopathy: EncephalopathyGrade;
  childPugh: IChildPughBreakdown;
  meldNa: IMeldNaBreakdown;
  decompensatedFlag: boolean;
  hepatorenalSyndromeRisk: boolean;
  highRiskMedicationsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class HepaticClearanceService {
  private patientState = (() => { try { return inject(PatientStateService); } catch { return null; } })();

  // Reactive clinical telemetry inputs
  readonly totalBilirubin = signal<number>(1.2); // mg/dL (normal 0.2 - 1.2)
  readonly serumAlbumin = signal<number>(3.8); // g/dL (normal 3.5 - 5.0)
  readonly inr = signal<number>(1.1); // normal 0.9 - 1.1
  readonly serumCreatinine = signal<number>(1.0); // mg/dL (normal 0.6 - 1.2)
  readonly serumSodium = signal<number>(138); // mEq/L (normal 135 - 145)
  readonly dialysisInPastWeek = signal<boolean>(false);
  readonly ascites = signal<AscitesGrade>('none');
  readonly encephalopathy = signal<EncephalopathyGrade>('none');

  // Medication list for continuous hepatic drug safety audit
  readonly currentMedications = signal<string[]>([
    'Acetaminophen',
    'Morphine',
    'Diazepam',
    'Atorvastatin',
    'Propranolol',
    'Pantoprazole',
    'Ibuprofen'
  ]);

  constructor() {
    // Optional integration with PatientStateService if available
    if (this.patientState) {
      // Reserved for syncing clinical vitals or selected conditions
    }
  }

  // --- Pure Domain Mathematical Calculators ---

  /**
   * Child-Pugh (Pugh-Turcotte) Score & Classification
   * Ref: Pugh RN, et al. Br J Surg 1973; 60:646-649.
   */
  public calculateChildPugh(
    bilirubin: number,
    albumin: number,
    inr: number,
    ascites: AscitesGrade,
    encephalopathy: EncephalopathyGrade,
    isCholestatic: boolean = false
  ): IChildPughBreakdown {
    // 1. Bilirubin Points
    let bilirubinPoints = 1;
    if (isCholestatic) {
      if (bilirubin > 10.0) bilirubinPoints = 3;
      else if (bilirubin >= 4.0) bilirubinPoints = 2;
    } else {
      if (bilirubin > 3.0) bilirubinPoints = 3;
      else if (bilirubin >= 2.0) bilirubinPoints = 2;
    }

    // 2. Albumin Points
    let albuminPoints = 1;
    if (albumin < 2.8) albuminPoints = 3;
    else if (albumin <= 3.5) albuminPoints = 2;

    // 3. INR Points
    let inrPoints = 1;
    if (inr > 2.3) inrPoints = 3;
    else if (inr >= 1.7) inrPoints = 2;

    // 4. Ascites Points
    let ascitesPoints = 1;
    if (ascites === 'moderate_severe') ascitesPoints = 3;
    else if (ascites === 'mild') ascitesPoints = 2;

    // 5. Encephalopathy Points (West Haven)
    let encephalopathyPoints = 1;
    if (encephalopathy === 'grade_3_4') encephalopathyPoints = 3;
    else if (encephalopathy === 'grade_1_2') encephalopathyPoints = 2;

    const totalScore = bilirubinPoints + albuminPoints + inrPoints + ascitesPoints + encephalopathyPoints;

    let cirrhosisClass: ChildPughClass = 'Class A';
    let oneYearSurvivalPercent = 100;
    let twoYearSurvivalPercent = 85;
    let perioperativeMortalityPercent = 10;

    if (totalScore >= 10) {
      cirrhosisClass = 'Class C';
      oneYearSurvivalPercent = 45;
      twoYearSurvivalPercent = 35;
      perioperativeMortalityPercent = 76;
    } else if (totalScore >= 7) {
      cirrhosisClass = 'Class B';
      oneYearSurvivalPercent = 80;
      twoYearSurvivalPercent = 60;
      perioperativeMortalityPercent = 30;
    }

    return {
      bilirubinPoints,
      albuminPoints,
      inrPoints,
      ascitesPoints,
      encephalopathyPoints,
      totalScore,
      cirrhosisClass,
      oneYearSurvivalPercent,
      twoYearSurvivalPercent,
      perioperativeMortalityPercent
    };
  }

  /**
   * MELD-Na (UNOS 2016 Specification)
   * Ref: Kim WR, et al. NEJM 2008; 359:1015-1021.
   * UNOS Policy 9.1: MELD Score Calculation (effective Jan 2016).
   */
  public calculateMeldNa(
    creatinine: number,
    bilirubin: number,
    inr: number,
    sodium: number,
    dialysisInPastWeek: boolean
  ): IMeldNaBreakdown {
    // UNOS Bound Rules:
    // If dialyzed twice in prior 7 days OR 24hr CVVH, Cr = 4.0
    const dialyzed = dialysisInPastWeek;
    let cappedCr = dialyzed ? 4.0 : Math.max(1.0, Math.min(4.0, creatinine));
    const cappedBili = Math.max(1.0, bilirubin);
    const cappedInr = Math.max(1.0, inr);
    const cappedNa = Math.max(125, Math.min(137, sodium));

    // Original MELD equation:
    // 9.57 * ln(Cr) + 3.78 * ln(Bili) + 11.20 * ln(INR) + 6.43
    const meldRaw = 9.57 * Math.log(cappedCr) + 3.78 * Math.log(cappedBili) + 11.20 * Math.log(cappedInr) + 6.43;
    const meldInitial = Math.round(meldRaw * 10) / 10;

    let meldNa = meldInitial;
    if (meldInitial > 11) {
      const naAdjustment = (137 - cappedNa);
      const meldNaCalculated = meldInitial + 1.32 * naAdjustment - (0.033 * meldInitial * naAdjustment);
      meldNa = Math.round(meldNaCalculated * 10) / 10;
    }

    // UNOS caps MELD-Na at 40 and floor at 6
    meldNa = Math.max(6, Math.min(40, meldNa));

    // 90-Day Mortality Prognosis
    let estimated90DayMortalityPercent = 1.9;
    if (meldNa >= 40) estimated90DayMortalityPercent = 71.3;
    else if (meldNa >= 30) estimated90DayMortalityPercent = 52.6;
    else if (meldNa >= 20) estimated90DayMortalityPercent = 19.6;
    else if (meldNa >= 10) estimated90DayMortalityPercent = 6.0;

    let transplantListingPriority: IMeldNaBreakdown['transplantListingPriority'] = 'Standard';
    if (meldNa >= 35) transplantListingPriority = 'STAT Emergency MELD >= 35';
    else if (meldNa >= 25) transplantListingPriority = 'Urgent';

    return {
      meldInitial,
      meldNa: Math.round(meldNa),
      cappedCr,
      cappedBili,
      cappedInr,
      cappedNa,
      dialysisAssigned: dialyzed,
      estimated90DayMortalityPercent,
      transplantListingPriority
    };
  }

  // --- Hepatic Posology & Dosing Titration Engine ---

  private static readonly HEPATIC_DRUG_DATABASE: Array<{
    name: string;
    class: string;
    primaryMetabolismPathway: string;
    hepaticExtractionRatio: 'high' | 'intermediate' | 'low';
    evaluate: (childPugh: IChildPughBreakdown, meld: IMeldNaBreakdown) => {
      actionRequired: IHepaticDosingGuideline['actionRequired'];
      recommendedDosage: string;
      clinicalRationale: string;
      fdaBlackBoxWarning?: boolean;
      safeAnalgesicAlternative?: string;
    };
  }> = [
    {
      name: 'Acetaminophen',
      class: 'Analgesic & Antipyretic',
      primaryMetabolismPathway: 'Hepatic Glucuronidation (60%) & Sulfation (35%); CYP2E1 (5% to NAPQI)',
      hepaticExtractionRatio: 'low',
      evaluate: (cp) => {
        if (cp.cirrhosisClass === 'Class C') {
          return {
            actionRequired: 'dose_reduction',
            recommendedDosage: 'Max 1000 mg to 1500 mg daily in divided doses (e.g. 500 mg q8h PRN) or avoid.',
            clinicalRationale: 'Decompensated cirrhosis (Class C). Glutathione reserves severely depleted; caution advised to prevent NAPQI accumulation. Still vastly safer than NSAIDs.',
            safeAnalgesicAlternative: 'Acetaminophen remains the oral non-opioid of choice over NSAIDs; avoid completely in active acute alcoholic hepatitis.'
          };
        }
        if (cp.cirrhosisClass === 'Class B') {
          return {
            actionRequired: 'dose_reduction',
            recommendedDosage: 'Max 2000 mg daily (e.g. 500 mg q6-8h PRN).',
            clinicalRationale: 'Compromised hepatic clearance (Class B). Limit daily intake to 2g to preserve glutathione pools. First-line analgesic: does NOT induce renal failure or gastrointestinal variceal bleeds.'
          };
        }
        return {
          actionRequired: 'standard',
          recommendedDosage: 'Standard dosing: Max 2000 mg to 3000 mg daily in chronic liver disease.',
          clinicalRationale: 'Well-compensated cirrhosis (Class A). Safe first-line analgesic; avoids NSAID-induced nephrotoxicity.'
        };
      }
    },
    {
      name: 'Ibuprofen',
      class: 'Non-Steroidal Anti-Inflammatory Drug (NSAID)',
      primaryMetabolismPathway: 'CYP2C9 oxidation & acyl-glucuronidation',
      hepaticExtractionRatio: 'low',
      evaluate: () => {
        return {
          actionRequired: 'contraindicated',
          recommendedDosage: 'ABSOLUTE CONTRAINDICATION ACROSS ALL CIRRHOSIS STAGES',
          clinicalRationale: 'NSAIDs inhibit renal vasodilatory prostaglandins (PGE2/PGI2), triggering rapid renal vasoconstriction, precipitating Hepatorenal Syndrome Type 1 (HRS-AKI), refractory ascites, and deadly esophagogastric variceal hemorrhage.',
          fdaBlackBoxWarning: true,
          safeAnalgesicAlternative: 'Use Acetaminophen (max 2g/day) or topical lidocaine/capsaicin.'
        };
      }
    },
    {
      name: 'Naproxen',
      class: 'Non-Steroidal Anti-Inflammatory Drug (NSAID)',
      primaryMetabolismPathway: 'CYP1A2 / CYP2C9 demethylation',
      hepaticExtractionRatio: 'low',
      evaluate: () => {
        return {
          actionRequired: 'contraindicated',
          recommendedDosage: 'ABSOLUTE CONTRAINDICATION ACROSS ALL CIRRHOSIS STAGES',
          clinicalRationale: 'Profound risk of Hepatorenal Syndrome and catastrophic upper GI bleeding. Highly protein-bound (>99%); hypoalbuminemia drastically increases free drug fraction.',
          fdaBlackBoxWarning: true,
          safeAnalgesicAlternative: 'Use Acetaminophen (max 2g/day).'
        };
      }
    },
    {
      name: 'Morphine',
      class: 'Opioid Analgesic',
      primaryMetabolismPathway: 'Extensive Hepatic First-Pass UGT2B7 Glucuronidation (M3G, M6G)',
      hepaticExtractionRatio: 'high',
      evaluate: (cp) => {
        if (cp.cirrhosisClass === 'Class C') {
          return {
            actionRequired: 'contraindicated',
            recommendedDosage: 'CONTRAINDICATED IN DECOMPENSATED CIRRHOSIS',
            clinicalRationale: 'High hepatic extraction drug (EH > 0.7). Portosystemic shunting bypasses first-pass clearance, causing 400% surge in systemic bioavailability. Elimination half-life prolonged 3-fold. Precipitates intractable Hepatic Encephalopathy and fatal sedation.',
            fdaBlackBoxWarning: true
          };
        }
        if (cp.cirrhosisClass === 'Class B') {
          return {
            actionRequired: 'dose_reduction',
            recommendedDosage: 'Reduce initial dose by 50% to 75% and extend interval to q8-12h PRN with naloxone at bedside.',
            clinicalRationale: 'Impaired intrinsic clearance and portosystemic shunts elevate peak plasma levels. Monitor closely for West Haven encephalopathy signs.'
          };
        }
        return {
          actionRequired: 'dose_reduction',
          recommendedDosage: 'Reduce dose by 50% or extend dosing interval (q6-8h).',
          clinicalRationale: 'Compensated cirrhosis (Class A). Subclinical portosystemic collaterals increase bioavailability.'
        };
      }
    },
    {
      name: 'Diazepam',
      class: 'Long-Acting Benzodiazepine',
      primaryMetabolismPathway: 'Phase-I CYP3A4 / CYP2C19 Oxidation to active desmethyldiazepam',
      hepaticExtractionRatio: 'low',
      evaluate: (cp) => {
        if (cp.cirrhosisClass === 'Class B' || cp.cirrhosisClass === 'Class C') {
          return {
            actionRequired: 'contraindicated',
            recommendedDosage: 'CONTRAINDICATED IN MODERATE-SEVERE CIRRHOSIS',
            clinicalRationale: 'Hepatic microsomal CYP oxidation is severely suppressed in cirrhosis. Diazepam elimination half-life extends from 30h to >120h, leading to active metabolite accumulation and severe hepatic coma.',
            fdaBlackBoxWarning: true,
            safeAnalgesicAlternative: 'If anxiolysis or AWS required, use "LOT" benzodiazepines (Lorazepam or Oxazepam) which bypass CYP enzymes via direct glucuronidation.'
          };
        }
        return {
          actionRequired: 'dose_reduction',
          recommendedDosage: 'Avoid or reduce dose by 75%; monitor cognitive mental status.',
          clinicalRationale: 'Phase-I oxidative clearance already compromised in Class A. LOT agents strongly preferred.'
        };
      }
    },
    {
      name: 'Lorazepam',
      class: 'Intermediate Benzodiazepine (LOT Group)',
      primaryMetabolismPathway: 'Direct Phase-II Glucuronidation (UGT2B7) to inactive glucuronide',
      hepaticExtractionRatio: 'low',
      evaluate: (cp) => {
        if (cp.cirrhosisClass === 'Class C') {
          return {
            actionRequired: 'dose_reduction',
            recommendedDosage: '0.25 mg to 0.5 mg PO/IV PRN with strict sedation scoring.',
            clinicalRationale: 'Phase-II glucuronidation is relatively preserved compared to CYP oxidation. However, increased brain GABA-A receptor sensitivity in liver failure increases sedation risk.'
          };
        }
        return {
          actionRequired: 'standard',
          recommendedDosage: '0.5 mg to 1 mg q8-12h PRN (50% standard initial dose).',
          clinicalRationale: 'Direct Phase-II glucuronidation with no active oxidative metabolites makes Lorazepam the benzodiazepine of choice for alcohol withdrawal syndrome in chronic liver disease.'
        };
      }
    },
    {
      name: 'Atorvastatin',
      class: 'HMG-CoA Reductase Inhibitor',
      primaryMetabolismPathway: 'CYP3A4 oxidation & biliary excretion (>98%)',
      hepaticExtractionRatio: 'intermediate',
      evaluate: (cp) => {
        if (cp.cirrhosisClass === 'Class C') {
          return {
            actionRequired: 'contraindicated',
            recommendedDosage: 'DISCONTINUE IN DECOMPENSATED CIRRHOSIS (CLASS C)',
            clinicalRationale: 'Biliary clearance failure and extreme hypoalbuminemia lead to systemic accumulation and rhabdomyolysis.',
            fdaBlackBoxWarning: true
          };
        }
        if (cp.cirrhosisClass === 'Class B') {
          return {
            actionRequired: 'dose_reduction',
            recommendedDosage: 'Initiate at 10 mg daily; check ALT/AST at 4 and 12 weeks.',
            clinicalRationale: 'Cardiovascular and portal vein thrombosis protection documented in trials, but clearance is diminished. Titrate cautiously.'
          };
        }
        return {
          actionRequired: 'standard',
          recommendedDosage: '10 mg to 20 mg daily. Safe and clinically recommended.',
          clinicalRationale: 'Landmark cirrhosis studies (BLEED, LiverHope) establish statins reduce sinusoidal resistance, hepatic venous pressure gradient (HVPG), and HCC risk in compensated cirrhosis (Class A).'
        };
      }
    },
    {
      name: 'Propranolol',
      class: 'Non-Selective Beta-Blocker (Variceal Bleed Prophylaxis)',
      primaryMetabolismPathway: 'CYP2D6, CYP1A2, and glucuronidation',
      hepaticExtractionRatio: 'high',
      evaluate: (cp, meld) => {
        if (meld.meldNa >= 30 || cp.cirrhosisClass === 'Class C') {
          return {
            actionRequired: 'interval_extension',
            recommendedDosage: 'Caution: evaluate "Window Hypothesis". Discontinue if SBP < 90 mmHg or in refractory ascites.',
            clinicalRationale: 'Non-selective beta blockers lower portal pressure in early cirrhosis, but in advanced decompensation (end-stage ascites, HRS), they compromise cardiac output and renal perfusion, worsening mortality.',
            fdaBlackBoxWarning: false
          };
        }
        return {
          actionRequired: 'standard',
          recommendedDosage: '20 mg PO BID; titrate to resting heart rate 55-60 bpm.',
          clinicalRationale: 'First-line primary and secondary prevention of esophageal variceal hemorrhage by reducing portal inflow (beta-1 cardiac output reduction + beta-2 splanchnic vasoconstriction).'
        };
      }
    },
    {
      name: 'Pantoprazole',
      class: 'Proton Pump Inhibitor (PPI)',
      primaryMetabolismPathway: 'CYP2C19 oxidation followed by sulfate conjugation',
      hepaticExtractionRatio: 'low',
      evaluate: (cp) => {
        if (cp.cirrhosisClass === 'Class B' || cp.cirrhosisClass === 'Class C') {
          return {
            actionRequired: 'dose_reduction',
            recommendedDosage: 'Deprescribe if no objective indication; if required, max 20 mg daily.',
            clinicalRationale: 'PPI-induced hypochlorhydria promotes Small Intestinal Bacterial Overgrowth (SIBO), dysbiosis, and bacterial translocation. Robust evidence identifies unindicated PPIs as major risk factors for Spontaneous Bacterial Peritonitis (SBP) and Hepatic Encephalopathy in cirrhosis.'
          };
        }
        return {
          actionRequired: 'standard',
          recommendedDosage: '20 mg to 40 mg daily; review indication every 8 weeks.',
          clinicalRationale: 'Compensated liver disease. Recommend deprescribing audit to eliminate unjustified chronic use.'
        };
      }
    }
  ];

  /**
   * Evaluates hepatic dosing titration for a single drug given Child-Pugh and MELD
   */
  public evaluateMedicationHepaticDosing(
    drugName: string,
    childPugh?: IChildPughBreakdown,
    meld?: IMeldNaBreakdown
  ): IHepaticDosingGuideline | null {
    const entry = HepaticClearanceService.HEPATIC_DRUG_DATABASE.find(
      d => d.name.toLowerCase() === drugName.toLowerCase()
    );

    if (!entry) return null;

    const cp = childPugh ?? this.childPugh();
    const m = meld ?? this.meldNa();

    const evaluation = entry.evaluate(cp, m);

    return {
      drugName: entry.name,
      drugClass: entry.class,
      primaryMetabolismPathway: entry.primaryMetabolismPathway,
      hepaticExtractionRatio: entry.hepaticExtractionRatio,
      actionRequired: evaluation.actionRequired,
      recommendedDosage: evaluation.recommendedDosage,
      clinicalRationale: evaluation.clinicalRationale,
      fdaBlackBoxWarning: evaluation.fdaBlackBoxWarning,
      safeAnalgesicAlternative: evaluation.safeAnalgesicAlternative
    };
  }

  // --- Computed Reactive Telemetry Signals ---

  readonly childPugh = computed<IChildPughBreakdown>(() => {
    return this.calculateChildPugh(
      this.totalBilirubin(),
      this.serumAlbumin(),
      this.inr(),
      this.ascites(),
      this.encephalopathy()
    );
  });

  readonly childPughScore = computed<number>(() => {
    return this.childPugh().totalScore;
  });

  readonly childPughClass = computed<ChildPughClass>(() => {
    return this.childPugh().cirrhosisClass;
  });

  readonly meldNa = computed<IMeldNaBreakdown>(() => {
    return this.calculateMeldNa(
      this.serumCreatinine(),
      this.totalBilirubin(),
      this.inr(),
      this.serumSodium(),
      this.dialysisInPastWeek()
    );
  });

  readonly meldNaScore = computed<number>(() => {
    return this.meldNa().meldNa;
  });

  readonly decompensatedFlag = computed<boolean>(() => {
    return (
      this.childPughClass() === 'Class C' ||
      this.ascites() === 'moderate_severe' ||
      this.encephalopathy() === 'grade_3_4' ||
      this.meldNaScore() >= 20
    );
  });

  readonly hepatorenalSyndromeRisk = computed<boolean>(() => {
    return (
      this.serumCreatinine() >= 1.5 &&
      (this.ascites() !== 'none' || this.totalBilirubin() > 3.0)
    );
  });

  readonly dosingTitrations = computed<IHepaticDosingGuideline[]>(() => {
    const meds = this.currentMedications();
    const cp = this.childPugh();
    const meld = this.meldNa();

    return meds
      .map(m => this.evaluateMedicationHepaticDosing(m, cp, meld))
      .filter((g): g is IHepaticDosingGuideline => g !== null);
  });

  readonly highRiskMedicationsCount = computed<number>(() => {
    return this.dosingTitrations().filter(
      t => t.actionRequired === 'contraindicated' || t.actionRequired === 'dose_reduction'
    ).length;
  });

  readonly fullAssessment = computed<IHepaticClearanceAssessment>(() => {
    return {
      timestamp: new Date().toISOString(),
      totalBilirubin: this.totalBilirubin(),
      serumAlbumin: this.serumAlbumin(),
      inr: this.inr(),
      serumCreatinine: this.serumCreatinine(),
      serumSodium: this.serumSodium(),
      dialysisInPastWeek: this.dialysisInPastWeek(),
      ascites: this.ascites(),
      encephalopathy: this.encephalopathy(),
      childPugh: this.childPugh(),
      meldNa: this.meldNa(),
      decompensatedFlag: this.decompensatedFlag(),
      hepatorenalSyndromeRisk: this.hepatorenalSyndromeRisk(),
      highRiskMedicationsCount: this.highRiskMedicationsCount()
    };
  });

  // --- Mutator & Clinical Simulation Methods ---

  public setLabs(
    bilirubin: number,
    albumin: number,
    inr: number,
    creatinine: number,
    sodium: number,
    dialysis: boolean = false
  ) {
    this.totalBilirubin.set(Math.max(0.1, bilirubin));
    this.serumAlbumin.set(Math.max(1.0, albumin));
    this.inr.set(Math.max(0.5, inr));
    this.serumCreatinine.set(Math.max(0.1, creatinine));
    this.serumSodium.set(Math.max(110, Math.min(160, sodium)));
    this.dialysisInPastWeek.set(dialysis);
  }

  public setClinicalSigns(ascites: AscitesGrade, encephalopathy: EncephalopathyGrade) {
    this.ascites.set(ascites);
    this.encephalopathy.set(encephalopathy);
  }

  public addMedication(medName: string) {
    if (!this.currentMedications().includes(medName)) {
      this.currentMedications.update(list => [...list, medName]);
    }
  }

  public removeMedication(medName: string) {
    this.currentMedications.update(list => list.filter(m => m !== medName));
  }

  public simulateScenario(
    scenario: 'compensated_class_a' | 'decompensated_class_c' | 'hepatorenal_syndrome' | 'opioid_encephalopathy_risk'
  ) {
    switch (scenario) {
      case 'compensated_class_a':
        this.setLabs(1.1, 4.0, 1.1, 0.9, 138, false);
        this.setClinicalSigns('none', 'none');
        break;

      case 'decompensated_class_c':
        this.setLabs(4.5, 2.4, 2.6, 2.2, 128, false);
        this.setClinicalSigns('moderate_severe', 'grade_3_4');
        break;

      case 'hepatorenal_syndrome':
        this.setLabs(3.8, 2.6, 2.1, 2.8, 126, false);
        this.setClinicalSigns('moderate_severe', 'grade_1_2');
        break;

      case 'opioid_encephalopathy_risk':
        this.setLabs(2.8, 3.1, 1.8, 1.2, 134, false);
        this.setClinicalSigns('mild', 'grade_1_2');
        break;
    }
  }
}
