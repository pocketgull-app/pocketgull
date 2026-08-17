import { Injectable, signal, computed } from '@angular/core';

export interface ITrialPhasePoint {
  day: number;
  phase: 'A1_Baseline' | 'B1_Intervention' | 'A2_Washout' | 'B2_Rechallenge';
  trueBiomarkerValue: number;
  measuredBiomarkerValue: number;
  posteriorProbabilityEfficacy: number;
  weightOfEvidenceDecibans: number; // Alan Turing's Deciban metric: 10 * log10(BayesFactor)
  isStatisticallySignificant: boolean;
}

export interface INOfOneSimulationResult {
  protocolId: string;
  drugCandidate: string;
  targetGene: string;
  totalDays: number;
  simulatedData: ITrialPhasePoint[];
  summaryMetrics: {
    baselineMean: number;
    interventionMean: number;
    washoutReversionPercent: number;
    finalBayesFactor: number;
    finalDecibans: number;
    finalProbabilityEfficacy: number; // 0.0 - 1.0
    isPopperianFalsified: boolean;
    clinicalVerdict: 'Highly Effective (Definitive N-of-1 Rescue)' | 'Equivocal (Extend Washout/Dose)' | 'Ineffective / Null Hypothesis Accepted';
  };
}

@Injectable({
  providedIn: 'root'
})
export class NOfOneBayesianSimulatorService {
  readonly isSimulating = signal<boolean>(false);
  readonly currentResult = signal<INOfOneSimulationResult | null>(null);

  /**
   * Runs a Monte Carlo Bayesian ABAB single-subject clinical trial simulation.
   * 
   * @param drugName Name of the candidate repurposed therapeutic agent
   * @param gene Target gene under study
   * @param trueEffectSize Target biomarker percentage improvement (e.g. 0.65 = 65% rescue)
   * @param noiseSd Standard deviation of random daily physiological variance (e.g. 0.10)
   * @param washoutHalfLifeDays Half-life of drug elimination in days (e.g. 3.5 days)
   */
  runSimulation(
    drugName: string = 'N-Acetylglucosamine',
    gene: string = 'NGLY1',
    trueEffectSize: number = 0.70,
    noiseSd: number = 0.08,
    washoutHalfLifeDays: number = 4.0
  ): INOfOneSimulationResult {
    this.isSimulating.set(true);

    const totalDays = 112; // 16 weeks (4 weeks per phase)
    const points: ITrialPhasePoint[] = [];

    const baselineTrue = 100.0;
    const targetInterventionTrue = baselineTrue * (1 - trueEffectSize);

    let cumulativeLogBayesFactor = 0;
    let currentDrugLevel = 0.0; // 0.0 to 1.0

    for (let day = 1; day <= totalDays; day++) {
      let phase: 'A1_Baseline' | 'B1_Intervention' | 'A2_Washout' | 'B2_Rechallenge';
      
      if (day <= 28) {
        phase = 'A1_Baseline';
        currentDrugLevel = 0.0;
      } else if (day <= 56) {
        phase = 'B1_Intervention';
        // Onset kinetics: asymptotically approaches 1.0 with tau ~ 5 days
        const phaseDay = day - 28;
        currentDrugLevel = 1.0 - Math.exp(-phaseDay / 5.0);
      } else if (day <= 84) {
        phase = 'A2_Washout';
        // Elimination kinetics
        const phaseDay = day - 56;
        currentDrugLevel = Math.exp(-phaseDay / washoutHalfLifeDays);
      } else {
        phase = 'B2_Rechallenge';
        // Re-challenge onset
        const phaseDay = day - 84;
        currentDrugLevel = 1.0 - (1.0 - Math.exp(-28 / washoutHalfLifeDays)) * Math.exp(-phaseDay / 4.0);
      }

      const trueVal = baselineTrue - (baselineTrue - targetInterventionTrue) * currentDrugLevel;
      // Box-Muller Gaussian random noise
      const u1 = Math.max(1e-6, Math.random());
      const u2 = Math.random();
      const gaussianNoise = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2) * (noiseSd * baselineTrue);
      
      const measuredVal = Math.max(5.0, trueVal + gaussianNoise);

      // Bayesian sequential updating: Likelihood ratio of (Intervention Effect vs Null)
      const effectWeight = Math.max(0, trueEffectSize);
      if (phase === 'B1_Intervention' || phase === 'B2_Rechallenge') {
        const delta = (baselineTrue - measuredVal) / (noiseSd * baselineTrue);
        const logLikelihoodRatio = delta * (effectWeight > 0.1 ? 0.18 : effectWeight * 0.18);
        cumulativeLogBayesFactor += logLikelihoodRatio;
      } else if (phase === 'A2_Washout') {
        // Evidence check for reversion
        const revertDelta = (measuredVal - targetInterventionTrue) / (noiseSd * baselineTrue);
        if (revertDelta > 0 && effectWeight > 0.1) {
          cumulativeLogBayesFactor += revertDelta * 0.08; // Confirms drug dependency
        }
      }

      const bf = Math.exp(Math.max(-50, Math.min(50, cumulativeLogBayesFactor)));
      // Turing Decibans: 10 * log10(BF)
      const decibans = 10 * (Math.log10(Math.max(1e-10, bf)));
      
      // Prior odds = 1:1 -> Posterior P = BF / (1 + BF)
      const posteriorProb = bf / (1.0 + bf);

      points.push({
        day,
        phase,
        trueBiomarkerValue: Math.round(trueVal * 10) / 10,
        measuredBiomarkerValue: Math.round(measuredVal * 10) / 10,
        posteriorProbabilityEfficacy: Math.min(0.999, Math.max(0.001, posteriorProb)),
        weightOfEvidenceDecibans: Math.round(decibans * 10) / 10,
        isStatisticallySignificant: decibans >= 10.0 // 10 decibans = 1 ban = 10:1 odds
      });
    }

    // Compute Summary Metrics
    const a1Points = points.filter(p => p.phase === 'A1_Baseline');
    const b1Points = points.filter(p => p.phase === 'B1_Intervention');
    const a2Points = points.filter(p => p.phase === 'A2_Washout');
    const b2Points = points.filter(p => p.phase === 'B2_Rechallenge');

    const baselineMean = a1Points.reduce((acc, p) => acc + p.measuredBiomarkerValue, 0) / a1Points.length;
    const interventionMean = b2Points.reduce((acc, p) => acc + p.measuredBiomarkerValue, 0) / b2Points.length;
    const washoutPeak = Math.max(...a2Points.map(p => p.measuredBiomarkerValue));
    
    const washoutReversionPercent = Math.min(100, Math.max(0, ((washoutPeak - interventionMean) / (baselineMean - interventionMean)) * 100));

    const finalPoint = points[points.length - 1];
    const finalDecibans = finalPoint.weightOfEvidenceDecibans;
    const finalProb = finalPoint.posteriorProbabilityEfficacy;
    const isFalsified = finalDecibans < 3.0; // Less than 2:1 odds -> null hypothesis not rejected

    let verdict: 'Highly Effective (Definitive N-of-1 Rescue)' | 'Equivocal (Extend Washout/Dose)' | 'Ineffective / Null Hypothesis Accepted';
    if (finalDecibans >= 20.0 && finalProb >= 0.95) {
      verdict = 'Highly Effective (Definitive N-of-1 Rescue)';
    } else if (finalDecibans >= 10.0) {
      verdict = 'Equivocal (Extend Washout/Dose)';
    } else {
      verdict = 'Ineffective / Null Hypothesis Accepted';
    }

    const result: INOfOneSimulationResult = {
      protocolId: `N-OF-1-SIM-${gene}-${Math.floor(Math.random() * 9000 + 1000)}`,
      drugCandidate: drugName,
      targetGene: gene,
      totalDays,
      simulatedData: points,
      summaryMetrics: {
        baselineMean: Math.round(baselineMean * 10) / 10,
        interventionMean: Math.round(interventionMean * 10) / 10,
        washoutReversionPercent: Math.round(washoutReversionPercent * 10) / 10,
        finalBayesFactor: Math.round(Math.pow(10, finalDecibans / 10) * 100) / 100,
        finalDecibans: Math.round(finalDecibans * 10) / 10,
        finalProbabilityEfficacy: Math.round(finalProb * 1000) / 1000,
        isPopperianFalsified: isFalsified,
        clinicalVerdict: verdict
      }
    };

    this.currentResult.set(result);
    this.isSimulating.set(false);
    return result;
  }
}
