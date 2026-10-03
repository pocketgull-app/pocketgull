/**
 * PocketGull Neurovascular Autonomic & Baroreflex Sensitivity Engine (Clinical Model P10)
 * 
 * Clinical Foundations:
 * 1. Heart Rate Variability (HRV) Task Force Spectral Decomposition:
 *    - High Frequency (HF: 0.15 - 0.40 Hz): Parasympathetic (vagal) efferent gating via Respiratory Sinus Arrhythmia (RSA).
 *    - Low Frequency (LF: 0.04 - 0.15 Hz): Mixed sympathetic and parasympathetic regulation, centered on 0.1 Hz baroreflex Mayer waves.
 *    - LF/HF Ratio: Classical sympathovagal balance index (normal resting 1.0 - 2.0; > 3.0 sympathetic dominance; < 0.5 vagal hyper-tone).
 *    - RMSSD: Direct time-domain surrogate of vagal chronotropic modulation.
 * 
 * 2. Baroreflex Sensitivity (BRS) Transfer Function:
 *    - Gain = Delta_RR / Delta_SBP (ms/mmHg).
 *    - Normal: >= 10 ms/mmHg. Depressed: < 6 ms/mmHg (strong cardiovascular and sudden cardiac death risk marker).
 * 
 * 3. Consensus Orthostatic Hemodynamic Classification:
 *    - Classic Orthostatic Hypotension (OH): Delta_SBP <= -20 mmHg or Delta_DBP <= -10 mmHg within 3 min standing.
 *    - Neurogenic OH (nOH): Delta_HR / |Delta_SBP| < 0.5 bpm/mmHg indicates efferent sympathetic baroreflex failure (Parkinsonian, MSA, PAF).
 *    - Postural Orthostatic Tachycardia Syndrome (POTS): Delta_HR >= 30 bpm sustained without significant hypotension.
 * 
 * 4. Compliance:
 *    - MSA §14.s.ix.6: Strictly biophysical autonomic neurocardiovascular modeling; zero emotion inferencing.
 *    - ISMP: Zero trailing zeros or naked decimals in clinical posology directives.
 */

import { Injectable, signal, computed } from '@angular/core';

export type OrthostaticPhenotype =
  | 'Hemodynamically Stable Orthostasis'
  | 'Neurogenic Orthostatic Hypotension (nOH)'
  | 'Non-Neurogenic Orthostatic Hypotension (Hypovolemic/Vasodilatory)'
  | 'Postural Orthostatic Tachycardia Syndrome (POTS)'
  | 'Vasovagal Cardioinhibitory / Depressor Pattern';

export type BrsClassification =
  | 'Normal High-Gain Baroreflex'
  | 'Borderline Blunted Baroreflex'
  | 'Depressed Baroreflex Failure';

export interface IHrvSpectralReport {
  hfPowerMs2: number;            // 0.15 - 0.40 Hz
  lfPowerMs2: number;            // 0.04 - 0.15 Hz
  vlfPowerMs2: number;           // 0.0033 - 0.04 Hz
  totalPowerMs2: number;
  lfHfRatio: number;
  normalizedHfNu: number;        // Normalized units (0 - 100)
  normalizedLfNu: number;        // Normalized units (0 - 100)
  rmssdMs: number;
  sdnnMs: number;
  autonomicState: 'Vagal Predominant' | 'Sympathovagal Equilibrium' | 'Sympathetic Hyperarousal / Vagal Withdrawal';
}

export interface IBaroreflexReport {
  brsGainMsMmHg: number;         // ms/mmHg
  classification: BrsClassification;
  cardiovascularRiskStratum: 'Low Risk' | 'Moderate Vulnerability' | 'Elevated Arrhythmogenic / Syncope Hazard';
  resonanceFrequencyBreathsPerMin: number;
}

export interface IOrthostaticReport {
  deltaHrBpm: number;
  deltaSbpMmhg: number;
  deltaDbpMmhg: number;
  hrToSbpRatio: number;          // Delta_HR / |Delta_SBP|
  phenotype: OrthostaticPhenotype;
  orthostaticHypotensionPresent: boolean;
  clinicalActionDirective: string;
}

export interface IAutonomicMasterReport {
  hrv: IHrvSpectralReport;
  brs: IBaroreflexReport;
  orthostatic: IOrthostaticReport;
  vagalToneScore: number;        // 0 - 100 composite index
  clinicalSummary: string;
}

@Injectable({
  providedIn: 'root'
})
export class AutonomicBaroreflexEngineService {
  // 1. HRV Telemetry Signals
  readonly rmssdMs = signal<number>(42);              // ms (normal 25 - 65)
  readonly sdnnMs = signal<number>(58);               // ms (normal 40 - 100)
  readonly hfPowerMs2 = signal<number>(680);          // ms^2 (0.15 - 0.40 Hz)
  readonly lfPowerMs2 = signal<number>(920);          // ms^2 (0.04 - 0.15 Hz)
  readonly vlfPowerMs2 = signal<number>(1150);        // ms^2 (0.0033 - 0.04 Hz)

  // 2. Baroreflex Sensitivity Signals
  readonly brsGainMsMmHg = signal<number>(14.2);      // ms/mmHg (normal >= 10)

  // 3. Orthostatic Postural Challenge Vitals (Supine vs Standing at 3 min)
  readonly supineHrBpm = signal<number>(68);
  readonly supineSbpMmhg = signal<number>(122);
  readonly supineDbpMmhg = signal<number>(76);

  readonly standingHrBpm = signal<number>(82);
  readonly standingSbpMmhg = signal<number>(118);
  readonly standingDbpMmhg = signal<number>(78);

  // 1. HRV Spectral Analysis Engine
  readonly hrvReport = computed<IHrvSpectralReport>(() => {
    const hf = Math.max(1, this.hfPowerMs2());
    const lf = Math.max(1, this.lfPowerMs2());
    const vlf = Math.max(1, this.vlfPowerMs2());
    const rmssd = this.rmssdMs();
    const sdnn = this.sdnnMs();

    const total = hf + lf + vlf;
    const lfHfRatio = Number((lf / hf).toFixed(2));
    const denom = Math.max(1, total - vlf);
    const normalizedHfNu = Number(((hf / denom) * 100).toFixed(1));
    const normalizedLfNu = Number(((lf / denom) * 100).toFixed(1));

    let autonomicState: IHrvSpectralReport['autonomicState'] = 'Sympathovagal Equilibrium';
    if (lfHfRatio > 2.5 || normalizedHfNu < 25) {
      autonomicState = 'Sympathetic Hyperarousal / Vagal Withdrawal';
    } else if (lfHfRatio < 0.8 || normalizedHfNu > 65) {
      autonomicState = 'Vagal Predominant';
    }

    return {
      hfPowerMs2: Math.round(hf),
      lfPowerMs2: Math.round(lf),
      vlfPowerMs2: Math.round(vlf),
      totalPowerMs2: Math.round(total),
      lfHfRatio,
      normalizedHfNu,
      normalizedLfNu,
      rmssdMs: Math.round(rmssd),
      sdnnMs: Math.round(sdnn),
      autonomicState
    };
  });

  // 2. Baroreflex Sensitivity (BRS) Engine
  readonly brsReport = computed<IBaroreflexReport>(() => {
    const gain = this.brsGainMsMmHg();

    let classification: BrsClassification = 'Normal High-Gain Baroreflex';
    let risk: IBaroreflexReport['cardiovascularRiskStratum'] = 'Low Risk';

    if (gain < 6.0) {
      classification = 'Depressed Baroreflex Failure';
      risk = 'Elevated Arrhythmogenic / Syncope Hazard';
    } else if (gain < 10.0) {
      classification = 'Borderline Blunted Baroreflex';
      risk = 'Moderate Vulnerability';
    }

    return {
      brsGainMsMmHg: Number(gain.toFixed(1)),
      classification,
      cardiovascularRiskStratum: risk,
      resonanceFrequencyBreathsPerMin: 6.0 // 0.1 Hz resonance frequency pacing
    };
  });

  // 3. Orthostatic Hemodynamics & Postural Classification Engine
  readonly orthostaticReport = computed<IOrthostaticReport>(() => {
    const supHr = this.supineHrBpm();
    const supSbp = this.supineSbpMmhg();
    const supDbp = this.supineDbpMmhg();

    const standHr = this.standingHrBpm();
    const standSbp = this.standingSbpMmhg();
    const standDbp = this.standingDbpMmhg();

    const deltaHr = standHr - supHr;
    const deltaSbp = standSbp - supSbp;
    const deltaDbp = standDbp - supDbp;

    const absDeltaSbp = Math.abs(deltaSbp);
    const hrToSbpRatio = absDeltaSbp > 0 ? Number((deltaHr / absDeltaSbp).toFixed(2)) : 0;

    const isOh = deltaSbp <= -20 || deltaDbp <= -10;

    let phenotype: OrthostaticPhenotype = 'Hemodynamically Stable Orthostasis';
    let directive = 'Normal postural autonomic reflex. No hemodynamic restriction.';

    if (isOh) {
      // Differentiate Neurogenic vs Non-Neurogenic OH via Delta_HR / |Delta_SBP| ratio
      if (hrToSbpRatio < 0.5) {
        phenotype = 'Neurogenic Orthostatic Hypotension (nOH)';
        directive = 'Sympathetic baroreflex failure detected. Avoid vasodilators, consider abdominal binder, head-of-bed elevation 10 degrees, and midodrine/droxidopa titration.';
      } else {
        phenotype = 'Non-Neurogenic Orthostatic Hypotension (Hypovolemic/Vasodilatory)';
        directive = 'Intact compensatory baroreflex tachycardia. Assess volume depletion, dehydration, and review anti-hypertensive medication posology.';
      }
    } else if (deltaHr >= 30 && deltaSbp > -20) {
      phenotype = 'Postural Orthostatic Tachycardia Syndrome (POTS)';
      directive = 'Excessive orthostatic tachycardia without hypotension. Initiate oral rehydration (2 - 3 L/day, 8 - 10 g salt), waist-high compression, and reclined exercise pacing.';
    } else if (deltaHr < -5 && deltaSbp < -15) {
      phenotype = 'Vasovagal Cardioinhibitory / Depressor Pattern';
      directive = 'Paradoxical vagal cardioinhibition. Counsel on counter-pressure physical maneuvers (leg crossing, isometric fist clenching) at symptom onset.';
    }

    return {
      deltaHrBpm: deltaHr,
      deltaSbpMmhg: deltaSbp,
      deltaDbpMmhg: deltaDbp,
      hrToSbpRatio,
      phenotype,
      orthostaticHypotensionPresent: isOh,
      clinicalActionDirective: directive
    };
  });

  // 4. Composite Autonomic Summary
  readonly compositeReport = computed<IAutonomicMasterReport>(() => {
    const hrv = this.hrvReport();
    const brs = this.brsReport();
    const orth = this.orthostaticReport();

    // Vagal tone composite score: 0 to 100
    // Weighted combination of RMSSD (40%), normalized HF power (35%), and BRS gain (25%)
    const rmssdScore = Math.min(100, (hrv.rmssdMs / 60.0) * 100);
    const hfScore = Math.min(100, (hrv.normalizedHfNu / 60.0) * 100);
    const brsScore = Math.min(100, (brs.brsGainMsMmHg / 20.0) * 100);
    const vagalToneScore = Math.round(rmssdScore * 0.40 + hfScore * 0.35 + brsScore * 0.25);

    let clinicalSummary = `Autonomic profile: ${hrv.autonomicState} (Vagal Tone: ${vagalToneScore}/100, BRS: ${brs.brsGainMsMmHg} ms/mmHg). Postural phenotype: ${orth.phenotype}.`;

    return {
      hrv,
      brs,
      orthostatic: orth,
      vagalToneScore,
      clinicalSummary
    };
  });

  // Clinical Preset Scenarios
  public applyPreset(preset: 'homeostasis' | 'neurogenic_oh' | 'pots_syndrome' | 'diabetic_autonomic_neuropathy' | 'vagal_hypertonia'): void {
    switch (preset) {
      case 'homeostasis':
        this.rmssdMs.set(42);
        this.sdnnMs.set(58);
        this.hfPowerMs2.set(680);
        this.lfPowerMs2.set(920);
        this.vlfPowerMs2.set(1150);
        this.brsGainMsMmHg.set(14.2);
        this.supineHrBpm.set(68);
        this.supineSbpMmhg.set(122);
        this.supineDbpMmhg.set(76);
        this.standingHrBpm.set(80);
        this.standingSbpMmhg.set(118);
        this.standingDbpMmhg.set(78);
        break;

      case 'neurogenic_oh':
        // Pure Autonomic Failure / Parkinson's: severe SBP drop without compensatory HR rise
        this.rmssdMs.set(14);
        this.sdnnMs.set(22);
        this.hfPowerMs2.set(120);
        this.lfPowerMs2.set(180);
        this.vlfPowerMs2.set(340);
        this.brsGainMsMmHg.set(3.8); // Severely depressed BRS
        this.supineHrBpm.set(66);
        this.supineSbpMmhg.set(145);
        this.supineDbpMmhg.set(88);
        this.standingHrBpm.set(72);  // Only +6 bpm despite -35 mmHg drop (ratio 0.17 < 0.5)
        this.standingSbpMmhg.set(110);
        this.standingDbpMmhg.set(70);
        break;

      case 'pots_syndrome':
        // Postural tachycardia: HR jumps >= 30 bpm without meeting hypotension criteria
        this.rmssdMs.set(28);
        this.sdnnMs.set(45);
        this.hfPowerMs2.set(310);
        this.lfPowerMs2.set(1450);
        this.vlfPowerMs2.set(890);
        this.brsGainMsMmHg.set(11.5);
        this.supineHrBpm.set(70);
        this.supineSbpMmhg.set(116);
        this.supineDbpMmhg.set(74);
        this.standingHrBpm.set(108); // +38 bpm jump
        this.standingSbpMmhg.set(112);
        this.standingDbpMmhg.set(76);
        break;

      case 'diabetic_autonomic_neuropathy':
        // Cardiovascular Autonomic Neuropathy (CAN): fixed heart rate, profound vagal withdrawal
        this.rmssdMs.set(9);
        this.sdnnMs.set(15);
        this.hfPowerMs2.set(25);
        this.lfPowerMs2.set(110);
        this.vlfPowerMs2.set(210);
        this.brsGainMsMmHg.set(2.4);
        this.supineHrBpm.set(88);   // High resting HR due to loss of vagal brake
        this.supineSbpMmhg.set(138);
        this.supineDbpMmhg.set(84);
        this.standingHrBpm.set(92);  // Fixed rate
        this.standingSbpMmhg.set(108); // -30 mmHg drop
        this.standingDbpMmhg.set(68);
        break;

      case 'vagal_hypertonia':
        // Endurance athlete / high vagal tone
        this.rmssdMs.set(85);
        this.sdnnMs.set(98);
        this.hfPowerMs2.set(2400);
        this.lfPowerMs2.set(1200);
        this.vlfPowerMs2.set(950);
        this.brsGainMsMmHg.set(22.5);
        this.supineHrBpm.set(48);
        this.supineSbpMmhg.set(112);
        this.supineDbpMmhg.set(68);
        this.standingHrBpm.set(58);
        this.standingSbpMmhg.set(114);
        this.standingDbpMmhg.set(72);
        break;
    }
  }
}
