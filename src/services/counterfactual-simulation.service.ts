import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';

export interface ICounterfactualScenario {
  id: string;
  emoji: string;
  title: string;
  inquisitiveQuestion: string;
  causalRationale: string;
  deltas: {
    deltaHbA1c?: number;
    deltaSteps?: number;
    deltaSleep?: number;
    deltaHrv?: number;
    deltaSystolic?: number;
  };
}

export interface IGoalInversionPathway {
  id: string;
  title: string;
  paradigmFocus: 'Vascular' | 'Metabolic' | 'Autonomic / Lifestyle';
  description: string;
  expectedCvReduction: string;
  expectedSibiReduction: string;
  readinessQuestion: string;
  deltas: {
    deltaHbA1c: number;
    deltaSteps: number;
    deltaSleep: number;
    deltaHrv: number;
    deltaSystolic: number;
  };
}

export interface IMultiParadigmCheck {
  paradigm: 'Western Clinical' | 'Eastern TCM' | 'Ayurvedic Vedic';
  status: 'OPTIMAL' | 'ADVISORY' | 'WARNING';
  inquiry: string;
  biophysicalMechanism: string;
}

export interface IOarsReadinessPrompt {
  biomarkerKey: string;
  title: string;
  readinessRulerQuestion: string;
  decisionalBalanceQuestion: string;
  patientLiteracyTip: string;
}

@Injectable({
  providedIn: 'root'
})
export class CounterfactualSimulationService {
  private patientState?: PatientStateService | null;

  constructor(patientState?: PatientStateService) {
    if (patientState) {
      this.patientState = patientState;
    } else {
      try {
        this.patientState = inject(PatientStateService, { optional: true });
      } catch (e) {
        console.debug('[CounterfactualSimulation] PatientStateService DI fallback:', (e as Error)?.message);
        this.patientState = null;
      }
    }
  }

  // Delta Signals
  readonly deltaHbA1c = signal<number>(0);
  readonly deltaSteps = signal<number>(0);
  readonly deltaSleep = signal<number>(0);
  readonly deltaHrv = signal<number>(0);
  readonly deltaSystolic = signal<number>(0);

  // Active Goal Inversion Target
  readonly activeGoalTarget = signal<'none' | 'cv_risk_sub8' | 'sibi_sub3' | 'vagal_coherence'>('none');

  // Baseline extraction from PatientStateService
  readonly baselineHbA1c = computed<number>(() => {
    const vitals = this.patientState?.vitals();
    const cmp = vitals?.cmpLabs;
    const val = parseFloat(String(cmp?.hba1c || '6.8'));
    return isNaN(val) ? 6.8 : val;
  });

  readonly baselineSteps = computed<number>(() => {
    const vitals = this.patientState?.vitals();
    const val = parseFloat(String(vitals?.steps || '5400'));
    return isNaN(val) ? 5400 : val;
  });

  readonly baselineSleep = computed<number>(() => {
    const vitals = this.patientState?.vitals();
    const val = parseFloat(String(vitals?.sleepEfficiency || '72'));
    return isNaN(val) ? 72 : val;
  });

  readonly baselineHrv = computed<number>(() => {
    const vitals = this.patientState?.vitals();
    const val = parseFloat(String(vitals?.hrvRmssd || '34'));
    return isNaN(val) ? 34 : val;
  });

  readonly baselineSystolic = computed<number>(() => {
    const vitals = this.patientState?.vitals();
    const bp = String(vitals?.bp || '128/82');
    const sys = parseInt(bp.split('/')[0], 10);
    return isNaN(sys) ? 128 : sys;
  });

  // Simulated Values
  readonly simulatedHbA1c = computed<number>(() => {
    const target = this.baselineHbA1c() + this.deltaHbA1c();
    return +(Math.max(4.0, Math.min(14.0, target)).toFixed(1));
  });

  readonly simulatedSteps = computed<number>(() => {
    const target = this.baselineSteps() + this.deltaSteps();
    return Math.max(1000, Math.min(25000, Math.round(target)));
  });

  readonly simulatedSleep = computed<number>(() => {
    const target = this.baselineSleep() + this.deltaSleep();
    return Math.max(30, Math.min(100, Math.round(target)));
  });

  readonly simulatedHrv = computed<number>(() => {
    const target = this.baselineHrv() + this.deltaHrv();
    return Math.max(10, Math.min(150, Math.round(target)));
  });

  readonly simulatedSystolic = computed<number>(() => {
    const target = this.baselineSystolic() + this.deltaSystolic();
    return Math.max(80, Math.min(210, Math.round(target)));
  });

  // Baseline & Simulated Risk Scores
  readonly baselineSibiScore = computed<number>(() => {
    const hba1c = this.baselineHbA1c();
    const hrv = this.baselineHrv();
    const sys = this.baselineSystolic();
    let sibi = 3.2;
    if (hba1c > 6.5) sibi += (hba1c - 6.5) * 1.4;
    if (hrv < 35) sibi += (35 - hrv) * 0.08;
    if (sys > 130) sibi += (sys - 130) * 0.06;
    return +(Math.min(10, Math.max(0.5, sibi)).toFixed(1));
  });

  readonly simulatedSibiScore = computed<number>(() => {
    const hba1c = this.simulatedHbA1c();
    const hrv = this.simulatedHrv();
    const sys = this.simulatedSystolic();
    let sibi = 3.2;
    if (hba1c > 6.5) sibi += (hba1c - 6.5) * 1.4;
    if (hrv < 35) sibi += (35 - hrv) * 0.08;
    if (sys > 130) sibi += (sys - 130) * 0.06;
    return +(Math.min(10, Math.max(0.5, sibi)).toFixed(1));
  });

  readonly baselineCvRisk = computed<number>(() => {
    const sys = this.baselineSystolic();
    const hba1c = this.baselineHbA1c();
    let risk = 8.5;
    if (sys > 120) risk += (sys - 120) * 0.25;
    if (hba1c > 6.0) risk += (hba1c - 6.0) * 2.2;
    return +(Math.min(50, Math.max(2.0, risk)).toFixed(1));
  });

  readonly simulatedCvRisk = computed<number>(() => {
    const sys = this.simulatedSystolic();
    const hba1c = this.simulatedHbA1c();
    let risk = 8.5;
    if (sys > 120) risk += (sys - 120) * 0.25;
    if (hba1c > 6.0) risk += (hba1c - 6.0) * 2.2;
    return +(Math.min(50, Math.max(2.0, risk)).toFixed(1));
  });

  // Overall Improvement Metrics
  readonly sibiDelta = computed<number>(() => {
    return +(this.simulatedSibiScore() - this.baselineSibiScore()).toFixed(1);
  });

  readonly cvRiskDelta = computed<number>(() => {
    return +(this.simulatedCvRisk() - this.baselineCvRisk()).toFixed(1);
  });

  readonly hasActiveSimulation = computed<boolean>(() => {
    return (
      this.deltaHbA1c() !== 0 ||
      this.deltaSteps() !== 0 ||
      this.deltaSleep() !== 0 ||
      this.deltaHrv() !== 0 ||
      this.deltaSystolic() !== 0
    );
  });

  // Inquisitive Socratic Scenarios
  readonly socraticScenarios: ICounterfactualScenario[] = [
    {
      id: 'scenario_shiftwork',
      emoji: '🌙',
      title: 'Circadian Disruption & Night Shift',
      inquisitiveQuestion: 'What if nocturnal HRV drops by 12 ms and sleep efficiency degrades by 15% due to rotating night shifts?',
      causalRationale: 'Simulates sympathetic overdrive, blunted nocturnal dipping, and elevated morning cortisol.',
      deltas: { deltaHrv: -12, deltaSleep: -15, deltaSystolic: 8 }
    },
    {
      id: 'scenario_metabolic_walk',
      emoji: '🥗',
      title: 'Low-GI Meal Sequencing + 3k Steps',
      inquisitiveQuestion: 'What if glycemic variability is attenuated by 1.0% HbA1c via postprandial walking (+3,000 steps)?',
      causalRationale: 'Non-pharmacological GLUT4 translocation reducing glycemic AUC without medication side-effects.',
      deltas: { deltaHbA1c: -1.0, deltaSteps: 3000, deltaHrv: 8 }
    },
    {
      id: 'scenario_vagal_breath',
      emoji: '🫁',
      title: 'Vagal Coherence Breathwork Protocol',
      inquisitiveQuestion: 'What if resonance-frequency breathing (0.1 Hz) boosts vagal tone (+18 ms RMSSD) and drops SBP by 8 mmHg?',
      causalRationale: 'Enhances baroreflex sensitivity and down-regulates systemic inflammatory cytokine cascade.',
      deltas: { deltaHrv: 18, deltaSleep: 12, deltaSystolic: -8 }
    },
    {
      id: 'scenario_aggressive_bp',
      emoji: '🩺',
      title: 'Intensive Pharmacological SBP Lowering',
      inquisitiveQuestion: 'What if systolic BP is aggressively lowered by 22 mmHg to reach SPRINT trial targets (<120 mmHg)?',
      causalRationale: 'Rapidly mitigates 10-year stroke and myocardial infarction risk at the potential expense of orthostatic tolerance.',
      deltas: { deltaSystolic: -22, deltaHrv: 4 }
    }
  ];

  // Goal-Backward Pathways ("What Would It Take?")
  readonly goalInversionPathways: IGoalInversionPathway[] = [
    {
      id: 'pathway_vascular',
      title: 'Pathway A: Vascular Hemodynamics Target',
      paradigmFocus: 'Vascular',
      description: 'Focuses primarily on vascular resistance and endothelial shear stress reduction.',
      expectedCvReduction: '-3.8%',
      expectedSibiReduction: '-1.2 pts',
      readinessQuestion: 'Is the patient able to maintain dietary sodium restriction and daily 30-min brisk walking?',
      deltas: { deltaHbA1c: -0.2, deltaSteps: 2500, deltaSleep: 5, deltaHrv: 6, deltaSystolic: -16 }
    },
    {
      id: 'pathway_metabolic',
      title: 'Pathway B: Metabolic & Glycemic Optimization',
      paradigmFocus: 'Metabolic',
      description: 'Prioritizes insulin sensitivity, hepatic de novo lipogenesis reduction, and HbA1c normalization.',
      expectedCvReduction: '-3.2%',
      expectedSibiReduction: '-1.8 pts',
      readinessQuestion: 'Would the patient prefer continuous glucose biofeedback over adding a second oral antihypertensive?',
      deltas: { deltaHbA1c: -1.2, deltaSteps: 2000, deltaSleep: 8, deltaHrv: 8, deltaSystolic: -6 }
    },
    {
      id: 'pathway_autonomic',
      title: 'Pathway C: Autonomic Vagal & Restorative Sleep',
      paradigmFocus: 'Autonomic / Lifestyle',
      description: 'Targets parasympathetic reactivation, nocturnal glymphatic clearance, and HRV recovery.',
      expectedCvReduction: '-2.6%',
      expectedSibiReduction: '-1.6 pts',
      readinessQuestion: 'Can the patient commit to an evening screen curfew and 10 minutes of structured resonance breathing?',
      deltas: { deltaHbA1c: -0.4, deltaSteps: 1500, deltaSleep: 20, deltaHrv: 22, deltaSystolic: -10 }
    }
  ];

  // Multi-Paradigm Systemic Cross-Impact Probing
  readonly multiParadigmChecks = computed<IMultiParadigmCheck[]>(() => {
    const checks: IMultiParadigmCheck[] = [];
    const deltaSys = this.deltaSystolic();
    const deltaSteps = this.deltaSteps();
    const deltaHba1c = this.deltaHbA1c();
    const simulatedSys = this.simulatedSystolic();
    const simulatedHrv = this.simulatedHrv();

    // 1. Western Clinical Check
    if (deltaSys < -20 || simulatedSys < 105) {
      checks.push({
        paradigm: 'Western Clinical',
        status: 'WARNING',
        inquiry: '⚠️ Intensive SBP Lowering Check: Are we risking orthostatic hypotension or renal hypoperfusion?',
        biophysicalMechanism: `Simulating a ${deltaSys} mmHg reduction (target ${simulatedSys} mmHg). In patients >65y or with bilateral carotid stenosis, rapid diastolic drop may compromise coronary perfusion.`
      });
    } else if (deltaHba1c <= -1.0) {
      checks.push({
        paradigm: 'Western Clinical',
        status: 'OPTIMAL',
        inquiry: '✅ Robust Metabolic Target: Sustained microvascular and retinopathic risk reduction.',
        biophysicalMechanism: `A ${Math.abs(deltaHba1c)}% HbA1c drop reduces nephropathy progression risk by ~37% (UKPDS benchmark).`
      });
    } else {
      checks.push({
        paradigm: 'Western Clinical',
        status: 'OPTIMAL',
        inquiry: 'ℹ️ Hemodynamic Homeostasis: Biomarkers remain within safe physiological autoregulation windows.',
        biophysicalMechanism: 'Mean arterial pressure and cerebral perfusion pressure remain stable.'
      });
    }

    // 2. Eastern TCM Check
    if (deltaSteps >= 4000 && simulatedHrv < 30) {
      checks.push({
        paradigm: 'Eastern TCM',
        status: 'WARNING',
        inquiry: '☯️ Zang-Fu Yin-Yang Depletion Check: Will high-intensity exercise exhaust Kidney Yin or ignite Liver Fire?',
        biophysicalMechanism: 'High cardiovascular demand without commensurate nocturnal Yin nourishment causes internal Heat and Qi exhaustion.'
      });
    } else if (this.deltaHrv() >= 10) {
      checks.push({
        paradigm: 'Eastern TCM',
        status: 'OPTIMAL',
        inquiry: '☯️ Heart-Kidney Coherence (Shao Yin): Harmonizing Shen (Consciousness) and Jing (Essence).',
        biophysicalMechanism: 'Elevated HRV reflects balanced Qi circulation across Conception and Governing vessels (Ren & Du Mai).'
      });
    } else {
      checks.push({
        paradigm: 'Eastern TCM',
        status: 'ADVISORY',
        inquiry: '☯️ Spleen Qi & Dampness: Ensure dietary modifications support transformation (Yun Hua) of nutrients.',
        biophysicalMechanism: 'Avoid cold/raw foods during aggressive caloric transitions to prevent Spleen Yang deficiency.'
      });
    }

    // 3. Ayurvedic Vedic Check
    if (deltaHba1c <= -1.2 && this.deltaSleep() < 0) {
      checks.push({
        paradigm: 'Ayurvedic Vedic',
        status: 'WARNING',
        inquiry: '🪷 Vata Dosha Vitiation Check: Will aggressive caloric restriction aggravate Vata and destabilize sleep?',
        biophysicalMechanism: 'Excessive lightness (Laghu) and dryness (Ruksha) from strict fasting increase Prana Vata instability, exacerbating insomnia.'
      });
    } else if (this.deltaSleep() > 10 || this.deltaHrv() > 10) {
      checks.push({
        paradigm: 'Ayurvedic Vedic',
        status: 'OPTIMAL',
        inquiry: '🪷 Ojas Nourishment: Enhanced restorative sleep deepens vital immunity (Vyadhikshamatwa).',
        biophysicalMechanism: 'Parasympathetic vagal grounding nourishes Majja Dhatu (nervous system substrate) and stabilizes Pitta digestive Agni.'
      });
    } else {
      checks.push({
        paradigm: 'Ayurvedic Vedic',
        status: 'ADVISORY',
        inquiry: '🪷 Agni & Ama Balance: Pace lifestyle transitions to prevent accumulation of metabolic endotoxins (Ama).',
        biophysicalMechanism: 'Incorporate warming digestive spices (ginger, cumin) during physical activity escalation.'
      });
    }

    return checks;
  });

  // OARS Motivational Interviewing Prompts for Double-Click Flip
  readonly oarsPrompts: Record<string, IOarsReadinessPrompt> = {
    hba1c: {
      biomarkerKey: 'hba1c',
      title: 'Glycemic HbA1c Target Inquiry (OARS)',
      readinessRulerQuestion: 'On a scale of 1 to 10, how confident do you feel in swapping refined carbohydrates for high-fiber legumes over the next 4 weeks?',
      decisionalBalanceQuestion: 'What would be the most meaningful life benefit for you if your A1c dropped below 6.0% (e.g. sustained afternoon energy, avoiding new medications)?',
      patientLiteracyTip: 'HbA1c measures the 90-day sugar coating on red blood cells. Small daily swaps produce exponential compounding benefits.'
    },
    steps: {
      biomarkerKey: 'steps',
      title: 'Daily Movement & Physical Activity Inquiry (OARS)',
      readinessRulerQuestion: 'On a scale of 1 to 10, how achievable is anchoring a 15-minute walk immediately after lunch and dinner?',
      decisionalBalanceQuestion: 'What current barriers (weather, joint soreness, meetings) might stand in the way of adding 2,500 daily steps, and how can we design around them?',
      patientLiteracyTip: 'Steps do not have to occur all at once. Three 10-minute micro-walks yield equal vascular benefits to a single 30-minute session.'
    },
    hrv: {
      biomarkerKey: 'hrv',
      title: 'Autonomic Tone & HRV Inquiry (OARS)',
      readinessRulerQuestion: 'On a scale of 1 to 10, how feasible is practicing 5 minutes of 4-7-8 slow breathing before turning out the bedroom lights?',
      decisionalBalanceQuestion: 'What emotional or cognitive stress triggers tend to pull you into fight-or-flight mode during a typical workday?',
      patientLiteracyTip: 'Heart Rate Variability (HRV) measures the millimeter-level flexibility between heartbeats. Higher variability reflects resilient autonomic recovery.'
    },
    systolic: {
      biomarkerKey: 'systolic',
      title: 'Vascular Blood Pressure Target Inquiry (OARS)',
      readinessRulerQuestion: 'On a scale of 1 to 10, how consistent are you with taking prescribed morning medications and checking home BP cuffs?',
      decisionalBalanceQuestion: 'If we lower your systolic target by 15 mmHg, what potential trade-offs (e.g. lightheadedness upon standing) should we monitor together?',
      patientLiteracyTip: 'Systolic pressure is the force against artery walls when the heart contracts. Keeping it in the green zone protects kidneys and cognitive longevity.'
    }
  };

  // Sensitivity & Equivalence Insights
  readonly sensitivityInsight = computed<string>(() => {
    const hrv = this.deltaHrv();
    const a1c = this.deltaHbA1c();
    const sys = this.deltaSystolic();

    if (hrv >= 15 && a1c === 0) {
      return '💡 Physiological Equivalence Insight: Your simulated +15 ms HRV vagal boost delivers ~72% of the Systemic Inflammatory Burden (SIBI) reduction of a full 1.0% HbA1c drop, without medication burden.';
    }
    if (sys <= -15 && hrv >= 10) {
      return '💡 Synergistic Vasovagal Insight: Combining -15 mmHg systolic reduction with +10 ms autonomic tone creates a multiplicative 10-year stroke risk attenuation exceeding single-agent monotherapy.';
    }
    return '💡 Counterfactual Principle: Small multi-system shifts across autonomic, metabolic, and hemodynamic axes frequently outperform aggressive single-variable pharmacology.';
  });

  // Actions
  applyScenario(scenario: ICounterfactualScenario): void {
    if (scenario.deltas.deltaHbA1c !== undefined) this.deltaHbA1c.set(scenario.deltas.deltaHbA1c);
    if (scenario.deltas.deltaSteps !== undefined) this.deltaSteps.set(scenario.deltas.deltaSteps);
    if (scenario.deltas.deltaSleep !== undefined) this.deltaSleep.set(scenario.deltas.deltaSleep);
    if (scenario.deltas.deltaHrv !== undefined) this.deltaHrv.set(scenario.deltas.deltaHrv);
    if (scenario.deltas.deltaSystolic !== undefined) this.deltaSystolic.set(scenario.deltas.deltaSystolic);
  }

  applyPathway(pathway: IGoalInversionPathway): void {
    this.deltaHbA1c.set(pathway.deltas.deltaHbA1c);
    this.deltaSteps.set(pathway.deltas.deltaSteps);
    this.deltaSleep.set(pathway.deltas.deltaSleep);
    this.deltaHrv.set(pathway.deltas.deltaHrv);
    this.deltaSystolic.set(pathway.deltas.deltaSystolic);
  }

  resetDeltas(): void {
    this.deltaHbA1c.set(0);
    this.deltaSteps.set(0);
    this.deltaSleep.set(0);
    this.deltaHrv.set(0);
    this.deltaSystolic.set(0);
    this.activeGoalTarget.set('none');
  }

  applySimulationToPatientState(): void {
    if (!this.patientState || !this.hasActiveSimulation()) return;

    const currentVitals = this.patientState.vitals();
    const sys = this.simulatedSystolic();
    const dia = 80;

    const currentCmp = currentVitals?.cmpLabs || {};
    this.patientState.vitals.set({
      ...currentVitals,
      steps: String(this.simulatedSteps()),
      sleepEfficiency: String(this.simulatedSleep()),
      hrvRmssd: String(this.simulatedHrv()),
      bp: `${sys}/${dia}`,
      cmpLabs: {
        ...currentCmp,
        hba1c: String(this.simulatedHbA1c())
      }
    });

    this.resetDeltas();
  }
}
