import { Injectable, signal, computed } from '@angular/core';

export type AkiStage =
  | 'Stage 0 (No AKI)'
  | 'KDIGO Stage 1'
  | 'KDIGO Stage 2'
  | 'KDIGO Stage 3 (Severe / RRT Risk)';

export type AkiEtiologyPhenotype =
  | 'Prerenal Azotemia (Hemodynamic Hypoperfusion)'
  | 'Intrinsic Acute Tubular Necrosis (ATN)'
  | 'Mixed / Diuretic-Confounded Hypoperfusion'
  | 'Homeostatic Glomerular Filtration';

export type FstResponseCategory =
  | 'FST Robust Responder (Intact Tubular Integrity)'
  | 'FST Borderline Responder'
  | 'FST Non-Responder (High RRT / Progression Hazard)'
  | 'FST Not Administered';

export type EgfrConfidenceTier =
  | 'Optimal Concordance'
  | 'Sarcopenia Discrepancy (eGFR_Cys < eGFR_Cr)'
  | 'Hypercatabolic Discrepancy (eGFR_Cr < eGFR_Cys)';

export interface IGlomerularFiltrationReport {
  egfrCreatinine: number;       // mL/min/1.73m2
  egfrCystatinC: number;        // mL/min/1.73m2
  egfrComposite: number;        // mL/min/1.73m2 (Gold Standard)
  ckdStage: 'G1' | 'G2' | 'G3a' | 'G3b' | 'G4' | 'G5';
  confidenceTier: EgfrConfidenceTier;
  sarcopeniaWarning: boolean;
}

export interface IKdigoAkiAssessment {
  currentStage: AkiStage;
  stageNumeric: number;         // 0, 1, 2, 3
  creatinineRatio: number;      // Current Cr / Baseline Cr
  creatinineDelta48h: number;   // Absolute Cr rise in 48h
  creatinineStage: number;      // 0 - 3
  urineOutputStage: number;     // 0 - 3
  isRrtIndicated: boolean;
  stagingRationale: string;
}

export interface IFstPredictionReport {
  category: FstResponseCategory;
  urineVolume2hMl: number;
  progressionToStage3RiskPercent: number;
  rrtNeedRiskPercent: number;
  clinicalActionDirective: string;
}

export interface IUrinaryExcretionPhenotype {
  feNaPercent: number | null;
  feUreaPercent: number | null;
  bunCreatinineRatio: number;
  etiology: AkiEtiologyPhenotype;
  tubularReabsorptionIntegrity: 'Preserved (Avid Na/Urea Reabsorption)' | 'Disrupted (Tubular Epithelial Necrosis)' | 'Indeterminate';
  diureticConfounderActive: boolean;
}

export interface IKdigoAkiCompositeReport {
  gfr: IGlomerularFiltrationReport;
  aki: IKdigoAkiAssessment;
  fst: IFstPredictionReport;
  excretion: IUrinaryExcretionPhenotype;
  clinicalSummary: string;
}

@Injectable({
  providedIn: 'root'
})
export class KdigoAkiPhenotyperService {
  // Patient Demographics
  readonly patientAge = signal<number>(65);
  readonly biologicalSex = signal<'female' | 'male'>('male');
  readonly weightKg = signal<number>(75);

  // Biochemical Biomarkers
  readonly serumCreatinine = signal<number>(1.8);        // mg/dL
  readonly baselineCreatinine = signal<number>(1.0);     // mg/dL
  readonly serumCystatinC = signal<number>(1.6);         // mg/L
  readonly serumSodiumMeqL = signal<number>(138);        // mEq/L
  readonly serumUreaNitrogenMgDl = signal<number>(42);   // BUN mg/dL

  // Urinary Parameters
  readonly urineOutputMlKgHr = signal<number>(0.4);      // mL/kg/h
  readonly oliguriaDurationHours = signal<number>(8);    // hours
  readonly urineSodiumMeqL = signal<number>(18);         // mEq/L
  readonly urineCreatinineMgDl = signal<number>(65);     // mg/dL
  readonly urineUreaNitrogenMgDl = signal<number>(280);  // mg/dL
  readonly urineOsmolality = signal<number>(480);        // mOsm/kg

  // Furosemide Stress Test (FST)
  readonly fstAdministered = signal<boolean>(true);
  readonly fstUrineVolume2hMl = signal<number>(140);     // mL in 2 hours
  readonly isLoopDiureticActive = signal<boolean>(false);
  readonly isDialysisRequired = signal<boolean>(false);

  // 1. CKD-EPI 2021 Race-Free Glomerular Filtration Engine
  readonly gfrReport = computed<IGlomerularFiltrationReport>(() => {
    const age = this.patientAge();
    const sex = this.biologicalSex();
    const cr = Math.max(0.1, this.serumCreatinine());
    const cys = Math.max(0.1, this.serumCystatinC());

    // eGFR Creatinine (2021 race-free)
    const kCr = sex === 'female' ? 0.7 : 0.9;
    const aCr = sex === 'female' ? -0.241 : -0.302;
    const sexCrMult = sex === 'female' ? 1.012 : 1.0;
    const egfrCr = 142 *
      Math.pow(Math.min(cr / kCr, 1.0), aCr) *
      Math.pow(Math.max(cr / kCr, 1.0), -1.200) *
      Math.pow(0.9938, age) *
      sexCrMult;

    // eGFR Cystatin C (2021 race-free, Inker et al. NEJM 2021)
    const sexCysMult = sex === 'female' ? 0.932 : 1.0;
    const egfrCys = 133 *
      Math.pow(Math.min(cys / 0.8, 1.0), -0.499) *
      Math.pow(Math.max(cys / 0.8, 1.0), -1.328) *
      Math.pow(0.9961, age) *
      sexCysMult;

    // eGFR Composite Creatinine-Cystatin C (Inker et al. NEJM 2021)
    const compSexMult = sex === 'female' ? 0.963 : 1.0;
    const egfrComp = 135 *
      Math.pow(Math.min(cr / kCr, 1.0), sex === 'female' ? -0.219 : -0.144) *
      Math.pow(Math.max(cr / kCr, 1.0), -0.544) *
      Math.pow(Math.min(cys / 0.8, 1.0), -0.323) *
      Math.pow(Math.max(cys / 0.8, 1.0), -0.778) *
      Math.pow(0.9961, age) *
      compSexMult;

    const roundComp = Math.round(egfrComp);
    const roundCr = Math.round(egfrCr);
    const roundCys = Math.round(egfrCys);

    // Discrepancy analysis (KDIGO 2024 threshold: > 20 mL/min/1.73m2)
    let confidenceTier: EgfrConfidenceTier = 'Optimal Concordance';
    let sarcopeniaWarning = false;
    if (roundCr - roundCys > 20) {
      confidenceTier = 'Sarcopenia Discrepancy (eGFR_Cys < eGFR_Cr)';
      sarcopeniaWarning = true;
    } else if (roundCys - roundCr > 20) {
      confidenceTier = 'Hypercatabolic Discrepancy (eGFR_Cr < eGFR_Cys)';
    }

    let ckdStage: IGlomerularFiltrationReport['ckdStage'] = 'G1';
    if (roundComp < 15) ckdStage = 'G5';
    else if (roundComp < 30) ckdStage = 'G4';
    else if (roundComp < 45) ckdStage = 'G3b';
    else if (roundComp < 60) ckdStage = 'G3a';
    else if (roundComp < 90) ckdStage = 'G2';

    return {
      egfrCreatinine: roundCr,
      egfrCystatinC: roundCys,
      egfrComposite: roundComp,
      ckdStage,
      confidenceTier,
      sarcopeniaWarning
    };
  });

  // 2. KDIGO AKI Staging Matrix
  readonly akiAssessment = computed<IKdigoAkiAssessment>(() => {
    const curCr = this.serumCreatinine();
    const baseCr = Math.max(0.1, this.baselineCreatinine());
    const uo = this.urineOutputMlKgHr();
    const oliguriaHrs = this.oliguriaDurationHours();
    const dialysis = this.isDialysisRequired();

    const crRatio = Number((curCr / baseCr).toFixed(2));
    const crDelta48h = Number(Math.max(0, curCr - baseCr).toFixed(2));

    // Creatinine Staging
    let crStage = 0;
    if (dialysis || crRatio >= 3.0 || (curCr >= 4.0 && crDelta48h >= 0.5)) {
      crStage = 3;
    } else if (crRatio >= 2.0) {
      crStage = 2;
    } else if (crDelta48h >= 0.3 || crRatio >= 1.5) {
      crStage = 1;
    }

    // Urine Output Staging
    let uoStage = 0;
    if (uo < 0.3 && oliguriaHrs >= 24) {
      uoStage = 3;
    } else if (uo < 0.5 && oliguriaHrs >= 12) {
      uoStage = 2;
    } else if (uo < 0.5 && oliguriaHrs >= 6) {
      uoStage = 1;
    }

    const netStageNum = Math.max(crStage, uoStage);
    let currentStage: AkiStage = 'Stage 0 (No AKI)';
    if (netStageNum === 3) currentStage = 'KDIGO Stage 3 (Severe / RRT Risk)';
    else if (netStageNum === 2) currentStage = 'KDIGO Stage 2';
    else if (netStageNum === 1) currentStage = 'KDIGO Stage 1';

    let stagingRationale = 'Serum creatinine and urine output within physiological baseline.';
    if (netStageNum === 3) {
      stagingRationale = `Critical Stage 3: ${dialysis ? 'RRT Required' : crRatio >= 3.0 ? 'Creatinine >= 3.0x baseline' : 'Persistent severe oliguria/anuria'}`;
    } else if (netStageNum === 2) {
      stagingRationale = `Moderate Stage 2: ${crStage === 2 ? 'Creatinine 2.0 - 2.9x baseline' : 'Oliguria < 0.5 mL/kg/h for >= 12 hours'}`;
    } else if (netStageNum === 1) {
      stagingRationale = `Early Stage 1: ${crDelta48h >= 0.3 ? 'Creatinine jump >= 0.3 mg/dL in 48h' : 'Oliguria < 0.5 mL/kg/h for >= 6 hours'}`;
    }

    return {
      currentStage,
      stageNumeric: netStageNum,
      creatinineRatio: crRatio,
      creatinineDelta48h: crDelta48h,
      creatinineStage: crStage,
      urineOutputStage: uoStage,
      isRrtIndicated: netStageNum === 3 || dialysis,
      stagingRationale
    };
  });

  // 3. Furosemide Stress Test (FST) Challenge Engine
  readonly fstReport = computed<IFstPredictionReport>(() => {
    if (!this.fstAdministered()) {
      return {
        category: 'FST Not Administered',
        urineVolume2hMl: 0,
        progressionToStage3RiskPercent: 15,
        rrtNeedRiskPercent: 5,
        clinicalActionDirective: 'FST protocol indicated if Stage 1/2 AKI without hypovolemia.'
      };
    }

    const vol = this.fstUrineVolume2hMl();
    if (vol < 200) {
      return {
        category: 'FST Non-Responder (High RRT / Progression Hazard)',
        urineVolume2hMl: vol,
        progressionToStage3RiskPercent: 82,
        rrtNeedRiskPercent: 68,
        clinicalActionDirective: 'High probability of RRT requirement. Prepare vascular access and nephrology consult. Avoid fluid overload.'
      };
    } else if (vol <= 350) {
      return {
        category: 'FST Borderline Responder',
        urineVolume2hMl: vol,
        progressionToStage3RiskPercent: 35,
        rrtNeedRiskPercent: 20,
        clinicalActionDirective: 'Borderline tubular reserve. Close hourly urine output monitoring and nephrotoxic drug avoidance.'
      };
    } else {
      return {
        category: 'FST Robust Responder (Intact Tubular Integrity)',
        urineVolume2hMl: vol,
        progressionToStage3RiskPercent: 8,
        rrtNeedRiskPercent: 3,
        clinicalActionDirective: 'Favorable intrinsic tubular response. Low progression risk. Continue supportive hemodynamic optimization.'
      };
    }
  });

  // 4. Fractional Excretion & Etiological Phenotyping Engine
  readonly excretionPhenotype = computed<IUrinaryExcretionPhenotype>(() => {
    const sCr = this.serumCreatinine();
    const uCr = this.urineCreatinineMgDl();
    const sNa = this.serumSodiumMeqL();
    const uNa = this.urineSodiumMeqL();
    const bun = this.serumUreaNitrogenMgDl();
    const uUrea = this.urineUreaNitrogenMgDl();
    const uOsm = this.urineOsmolality();
    const isDiuretic = this.isLoopDiureticActive();

    // Fractional Excretion of Sodium (FE_Na): (uNa * sCr) / (sNa * uCr) * 100
    let feNa: number | null = null;
    if (sNa > 0 && uCr > 0) {
      feNa = Number(((uNa * sCr) / (sNa * uCr) * 100).toFixed(2));
    }

    // Fractional Excretion of Urea (FE_Urea): (uUrea * sCr) / (bun * uCr) * 100
    let feUrea: number | null = null;
    if (bun > 0 && uCr > 0) {
      feUrea = Number(((uUrea * sCr) / (bun * uCr) * 100).toFixed(1));
    }

    const bunCrRatio = Number((bun / Math.max(0.1, sCr)).toFixed(1));

    // Etiological synthesis
    let etiology: AkiEtiologyPhenotype = 'Homeostatic Glomerular Filtration';
    let tubularIntegrity: IUrinaryExcretionPhenotype['tubularReabsorptionIntegrity'] = 'Preserved (Avid Na/Urea Reabsorption)';

    const isAkiPresent = this.akiAssessment().stageNumeric > 0;

    if (!isAkiPresent) {
      etiology = 'Homeostatic Glomerular Filtration';
      tubularIntegrity = 'Preserved (Avid Na/Urea Reabsorption)';
    } else if (isDiuretic) {
      // Loop diuretics invalidate FE_Na (elevate urinary Na). Rely on FE_Urea.
      if (feUrea !== null && feUrea < 35) {
        etiology = 'Prerenal Azotemia (Hemodynamic Hypoperfusion)';
        tubularIntegrity = 'Preserved (Avid Na/Urea Reabsorption)';
      } else if (feUrea !== null && feUrea > 50) {
        etiology = 'Intrinsic Acute Tubular Necrosis (ATN)';
        tubularIntegrity = 'Disrupted (Tubular Epithelial Necrosis)';
      } else {
        etiology = 'Mixed / Diuretic-Confounded Hypoperfusion';
        tubularIntegrity = 'Indeterminate';
      }
    } else {
      // Check ATN first: impaired tubular handling (FE_Na > 2% or FE_Urea > 50% or isosthenuria with elevated FE_Na)
      if ((feNa !== null && feNa > 2.0) || (feUrea !== null && feUrea > 50) || (uOsm < 350 && feNa !== null && feNa > 1.5)) {
        etiology = 'Intrinsic Acute Tubular Necrosis (ATN)';
        tubularIntegrity = 'Disrupted (Tubular Epithelial Necrosis)';
      } else if ((feNa !== null && feNa < 1.0) || (feUrea !== null && feUrea < 35) || uOsm > 500 || bunCrRatio > 20) {
        etiology = 'Prerenal Azotemia (Hemodynamic Hypoperfusion)';
        tubularIntegrity = 'Preserved (Avid Na/Urea Reabsorption)';
      } else {
        etiology = 'Mixed / Diuretic-Confounded Hypoperfusion';
        tubularIntegrity = 'Indeterminate';
      }
    }

    return {
      feNaPercent: feNa,
      feUreaPercent: feUrea,
      bunCreatinineRatio: bunCrRatio,
      etiology,
      tubularReabsorptionIntegrity: tubularIntegrity,
      diureticConfounderActive: isDiuretic
    };
  });

  // 5. Consolidated Master Clinical Report
  readonly compositeReport = computed<IKdigoAkiCompositeReport>(() => {
    const gfr = this.gfrReport();
    const aki = this.akiAssessment();
    const fst = this.fstReport();
    const excretion = this.excretionPhenotype();

    let clinicalSummary = `Patient exhibits ${aki.currentStage} with ${excretion.etiology}. `;
    if (gfr.sarcopeniaWarning) {
      clinicalSummary += 'Caution: Serum creatinine overestimates true renal reserve due to sarcopenia (Cystatin C eGFR is significantly lower). ';
    }
    if (fst.category.includes('Non-Responder')) {
      clinicalSummary += 'Urgent: FST non-responder indicates severe tubular dysfunction with high likelihood of RRT requirement.';
    }

    return {
      gfr,
      aki,
      fst,
      excretion,
      clinicalSummary
    };
  });

  // Helper Methods for Clinical Scenarios
  public applyPreset(preset: 'homeostasis' | 'prerenal_dehydration' | 'atn_septic_shock' | 'sarcopenic_elderly' | 'fst_non_responder'): void {
    switch (preset) {
      case 'homeostasis':
        this.patientAge.set(52);
        this.biologicalSex.set('female');
        this.serumCreatinine.set(0.85);
        this.baselineCreatinine.set(0.80);
        this.serumCystatinC.set(0.82);
        this.serumSodiumMeqL.set(140);
        this.serumUreaNitrogenMgDl.set(14);
        this.urineOutputMlKgHr.set(1.1);
        this.oliguriaDurationHours.set(0);
        this.urineSodiumMeqL.set(35);
        this.urineCreatinineMgDl.set(90);
        this.urineUreaNitrogenMgDl.set(450);
        this.urineOsmolality.set(650);
        this.fstAdministered.set(false);
        this.isLoopDiureticActive.set(false);
        this.isDialysisRequired.set(false);
        break;

      case 'prerenal_dehydration':
        this.patientAge.set(68);
        this.biologicalSex.set('male');
        this.serumCreatinine.set(1.6);
        this.baselineCreatinine.set(1.0);
        this.serumCystatinC.set(1.4);
        this.serumSodiumMeqL.set(142);
        this.serumUreaNitrogenMgDl.set(38);
        this.urineOutputMlKgHr.set(0.35);
        this.oliguriaDurationHours.set(8);
        this.urineSodiumMeqL.set(12); // Avid Na retention
        this.urineCreatinineMgDl.set(110);
        this.urineUreaNitrogenMgDl.set(420);
        this.urineOsmolality.set(620);
        this.fstAdministered.set(true);
        this.fstUrineVolume2hMl.set(420); // Responded to loop
        this.isLoopDiureticActive.set(false);
        this.isDialysisRequired.set(false);
        break;

      case 'atn_septic_shock':
        this.patientAge.set(72);
        this.biologicalSex.set('male');
        this.serumCreatinine.set(2.8);
        this.baselineCreatinine.set(1.1);
        this.serumCystatinC.set(2.6);
        this.serumSodiumMeqL.set(136);
        this.serumUreaNitrogenMgDl.set(58);
        this.urineOutputMlKgHr.set(0.2);
        this.oliguriaDurationHours.set(16);
        this.urineSodiumMeqL.set(48); // Inability to concentrate Na
        this.urineCreatinineMgDl.set(35);
        this.urineUreaNitrogenMgDl.set(160);
        this.urineOsmolality.set(290); // Isosthenuria
        this.fstAdministered.set(true);
        this.fstUrineVolume2hMl.set(85); // Failed FST challenge
        this.isLoopDiureticActive.set(false);
        this.isDialysisRequired.set(false);
        break;

      case 'sarcopenic_elderly':
        this.patientAge.set(84);
        this.biologicalSex.set('female');
        this.serumCreatinine.set(0.75); // Deceptively low due to muscle loss
        this.baselineCreatinine.set(0.70);
        this.serumCystatinC.set(1.75); // True GFR marker severely elevated
        this.serumSodiumMeqL.set(137);
        this.serumUreaNitrogenMgDl.set(28);
        this.urineOutputMlKgHr.set(0.7);
        this.oliguriaDurationHours.set(0);
        this.urineSodiumMeqL.set(30);
        this.urineCreatinineMgDl.set(45);
        this.urineUreaNitrogenMgDl.set(300);
        this.urineOsmolality.set(450);
        this.fstAdministered.set(false);
        this.isLoopDiureticActive.set(false);
        this.isDialysisRequired.set(false);
        break;

      case 'fst_non_responder':
        this.patientAge.set(65);
        this.biologicalSex.set('male');
        this.serumCreatinine.set(3.4);
        this.baselineCreatinine.set(1.0);
        this.serumCystatinC.set(3.2);
        this.serumSodiumMeqL.set(134);
        this.serumUreaNitrogenMgDl.set(72);
        this.urineOutputMlKgHr.set(0.15);
        this.oliguriaDurationHours.set(26);
        this.urineSodiumMeqL.set(52);
        this.urineCreatinineMgDl.set(28);
        this.urineUreaNitrogenMgDl.set(140);
        this.urineOsmolality.set(280);
        this.fstAdministered.set(true);
        this.fstUrineVolume2hMl.set(60);
        this.isLoopDiureticActive.set(true);
        this.isDialysisRequired.set(false);
        break;
    }
  }
}
