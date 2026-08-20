import { Injectable, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { IPatient } from './patient.types';

export interface IDifferentialCandidate {
  id: string;
  conditionName: string;
  category: 'High-Acuity Secondary' | 'Occult Metabolic' | 'Rare Autoimmune' | 'Structural / Vascular';
  preTestProbabilityPct: number; // Prior P(D)
  likelihoodRatioPositive: number; // LR+
  likelihoodRatioNegative: number; // LR-
  postTestProbabilityPct: number; // Posterior P(D|T)
  socraticRulingOutQuestion: string;
  goldStandardTest: string;
  targetClinicalCutoff: string;
  redFlagFeatures: string[];
}

export interface IDxRadarReport {
  patientId: string;
  chiefSyndrome: string;
  timestamp: string;
  topCannotMissDifferentials: IDifferentialCandidate[];
  popperianNullHypothesis: string;
  diagnosticActionChecklist: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DifferentialDiagnosisRadarService {
  private patientState: PatientStateService | null = null;

  constructor() {
    try {
      this.patientState = inject(PatientStateService, { optional: true });
    } catch {
      this.patientState = null;
    }
  }

  /**
   * Computes Bayesian Post-Test Probability using Odds and Likelihood Ratios
   * Prior Odds = Prior / (1 - Prior)
   * Post Odds = Prior Odds * LR
   * Post Probability = Post Odds / (1 + Post Odds)
   */
  public calculateBayesianPostTest(preTestProbPct: number, lr: number): number {
    const prior = Math.max(0.001, Math.min(0.999, preTestProbPct / 100.0));
    const priorOdds = prior / (1.0 - prior);
    const postOdds = priorOdds * lr;
    const postProb = postOdds / (1.0 + postOdds);
    return +(postProb * 100).toFixed(1);
  }

  /**
   * Generates Socratic Don't Miss Differential Radar evaluation
   */
  public evaluateDifferentials(patient: IPatient): IDxRadarReport {
    const conds = (patient.preexistingConditions || []).join(' ').toLowerCase();
    const vitals: Record<string, any> = patient.vitals || {};
    const bpStr = String(vitals['bp'] || '120/80');
    const sys = parseInt(bpStr.split('/')[0], 10) || 120;

    let chiefSyndrome = 'Essential Hypertension & Metabolic Syndrome';
    let candidates: IDifferentialCandidate[] = [];

    if (conds.includes('postpartum') || patient.id === 'p007') {
      chiefSyndrome = '4th-Trimester Postpartum Fatigue & Mood Lability';
      candidates = [
        {
          id: 'dx-pp-01',
          conditionName: 'Postpartum Thyroiditis (Hashitoxicosis Phase)',
          category: 'High-Acuity Secondary',
          preTestProbabilityPct: 8.0,
          likelihoodRatioPositive: 8.5,
          likelihoodRatioNegative: 0.15,
          postTestProbabilityPct: this.calculateBayesianPostTest(8.0, 8.5),
          socraticRulingOutQuestion: 'Have we ruled out transient thyroiditis before attributing anxiety and palpitations purely to sleep deprivation?',
          goldStandardTest: 'Serum TSH, Free T4, and Anti-TPO Antibodies',
          targetClinicalCutoff: 'TSH < 0.35 mIU/L or Anti-TPO > 35 IU/mL',
          redFlagFeatures: ['Unexplained palpitations', 'Heat intolerance', 'Sudden milk supply drop']
        },
        {
          id: 'dx-pp-02',
          conditionName: 'Late-Onset Postpartum Preeclampsia',
          category: 'High-Acuity Secondary',
          preTestProbabilityPct: 4.0,
          likelihoodRatioPositive: 12.0,
          likelihoodRatioNegative: 0.1,
          postTestProbabilityPct: this.calculateBayesianPostTest(4.0, 12.0),
          socraticRulingOutQuestion: 'Are headache and visual floaters accompanied by epigastric pain or subclinical proteinuria?',
          goldStandardTest: 'Spot Urine Protein/Creatinine Ratio + CMP Liver Enzymes',
          targetClinicalCutoff: 'UPCR >= 0.3 mg/mg or AST/ALT > 2x normal',
          redFlagFeatures: ['Scotomas / visual blur', 'Severe frontal headache', 'Right upper quadrant pain']
        },
        {
          id: 'dx-pp-03',
          conditionName: 'Peripartum Cardiomyopathy (PPCM)',
          category: 'Structural / Vascular',
          preTestProbabilityPct: 1.5,
          likelihoodRatioPositive: 15.0,
          likelihoodRatioNegative: 0.05,
          postTestProbabilityPct: this.calculateBayesianPostTest(1.5, 15.0),
          socraticRulingOutQuestion: 'Is maternal fatigue accompanied by orthopnea or paroxysmal nocturnal dyspnea?',
          goldStandardTest: 'Serum NT-proBNP + Transthoracic Echocardiogram (TTE)',
          targetClinicalCutoff: 'NT-proBNP > 300 pg/mL or LVEF < 45%',
          redFlagFeatures: ['Inability to lie flat', 'Bilateral pedal edema', 'Nocturnal cough']
        }
      ];
    } else {
      // Default: Refractory / Essential Hypertension and Cardiovascular Strain
      chiefSyndrome = sys >= 140 ? 'Refractory Stage 2 Systemic Hypertension' : 'Cardiometabolic Risk Profiling';
      candidates = [
        {
          id: 'dx-htn-01',
          conditionName: 'Primary Hyperaldosteronism (Conn Syndrome)',
          category: 'High-Acuity Secondary',
          preTestProbabilityPct: 10.0,
          likelihoodRatioPositive: 7.2,
          likelihoodRatioNegative: 0.12,
          postTestProbabilityPct: this.calculateBayesianPostTest(10.0, 7.2),
          socraticRulingOutQuestion: 'Did we check plasma aldosterone-to-renin ratio before assuming essential HTN in resistant elevation?',
          goldStandardTest: 'Morning Plasma Aldosterone Concentration / Plasma Renin Activity (ARR)',
          targetClinicalCutoff: 'ARR > 20 with Aldosterone >= 15 ng/dL',
          redFlagFeatures: ['Hypokalemia (spontaneous or thiazide-induced)', 'BP refractory to 3+ drugs', 'Muscle cramping']
        },
        {
          id: 'dx-htn-02',
          conditionName: 'Renal Artery Stenosis (Atherosclerotic RAS)',
          category: 'Structural / Vascular',
          preTestProbabilityPct: 7.0,
          likelihoodRatioPositive: 9.0,
          likelihoodRatioNegative: 0.15,
          postTestProbabilityPct: this.calculateBayesianPostTest(7.0, 9.0),
          socraticRulingOutQuestion: 'Did serum creatinine rise >30% after initiating Lisinopril/ACE inhibitor therapy?',
          goldStandardTest: 'Renal Duplex Doppler Ultrasound or MR Angiography',
          targetClinicalCutoff: 'Peak Systolic Velocity > 200 cm/s with Renal-Aortic Ratio > 3.5',
          redFlagFeatures: ['Abdominal bruit', 'Flash pulmonary edema', 'Acute worsening of renal function on ACEi']
        },
        {
          id: 'dx-htn-03',
          conditionName: 'Pheochromocytoma & Paraganglioma (PPGL)',
          category: 'High-Acuity Secondary',
          preTestProbabilityPct: 1.0,
          likelihoodRatioPositive: 22.0,
          likelihoodRatioNegative: 0.02,
          postTestProbabilityPct: this.calculateBayesianPostTest(1.0, 22.0),
          socraticRulingOutQuestion: 'Are hypertensive spikes accompanied by the classic triad of paroxysmal headache, sweating, and tachycardia?',
          goldStandardTest: 'Plasma Free Metanephrines or 24-hr Fractionated Urinary Metanephrines',
          targetClinicalCutoff: 'Normetanephrine > 4x upper reference limit',
          redFlagFeatures: ['Classic Triad: Headache + Sweating + Tachycardia', 'Paroxysmal episodic surges', 'Pallor during spikes']
        },
        {
          id: 'dx-htn-04',
          conditionName: 'Obstructive Sleep Apnea (Severe Hypoxic OSA)',
          category: 'Occult Metabolic',
          preTestProbabilityPct: 40.0,
          likelihoodRatioPositive: 3.5,
          likelihoodRatioNegative: 0.25,
          postTestProbabilityPct: this.calculateBayesianPostTest(40.0, 3.5),
          socraticRulingOutQuestion: 'Does the patient exhibit non-dipping nocturnal BP patterns with morning brain fog and daytime somnolence?',
          goldStandardTest: 'Home Sleep Apnea Test (HSAT) / Type III Polysomnography',
          targetClinicalCutoff: 'Apnea-Hypopnea Index (AHI) >= 15 events/hr',
          redFlagFeatures: ['Non-dipping nocturnal blood pressure', 'Loud habitual snoring', 'STOP-BANG score >= 4']
        }
      ];
    }

    const popperianNullHypothesis = 'H₀: The observed symptoms represent standard primary essential disease without secondary organic pathology (p >= 0.05). Must be falsified by gold-standard diagnostic exclusion.';

    const diagnosticActionChecklist = candidates.map(c => 
      `Order: ${c.goldStandardTest} (Rule-out for ${c.conditionName})`
    );

    return {
      patientId: patient.id || 'p001',
      chiefSyndrome,
      timestamp: new Date().toISOString(),
      topCannotMissDifferentials: candidates,
      popperianNullHypothesis,
      diagnosticActionChecklist
    };
  }
}
