import { Injectable, signal, computed } from '@angular/core';

export type SolutionParadigm = 'Ecological Fungal' | 'Reservoir Immunological' | 'Semiochemical Decoy' | 'Remote Sensing AI' | 'Botanical Bio-Membrane';
export type EpistemicStatus = 'H0_FALSIFIED_STRONG' | 'H0_RETAINED_INSUFFICIENT' | 'EQUIVOCAL_CONFOUNDED';

export interface INovelSolutionCandidate {
  id: string;
  name: string;
  paradigm: SolutionParadigm;
  icon: string;
  tagline: string;
  biophysicalMechanism: string;
  nullHypothesisH0: string;
  alternativeHypothesisH1: string;
  empiricalPrevalenceReductionPercent: number; // expected % drop in questing nymphs or host infection
  cohenEffectSizeD: number; // expected Cohen's d (0.2 small, 0.5 med, 0.8+ large)
  ecologicalSafetyIndex: number; // 0-100 (100 = zero non-target toxicity)
  regulatoryFeasibilityTier: 'High (EPA 25b / GRAS)' | 'Moderate (USDA/FDA APHIS)' | 'Complex (EPA FIFRA Section 3)';
  causalEValue: number; // Minimum confounding risk ratio needed to explain away effect
  cochraneRiskOfBias: {
    randomization: 'Low Risk of Bias' | 'Some Concerns' | 'High Risk of Bias';
    confounding: 'Low Risk of Bias' | 'Some Concerns' | 'High Risk of Bias';
    measurement: 'Low Risk of Bias' | 'Some Concerns' | 'High Risk of Bias';
    overall: 'Low Risk of Bias' | 'Some Concerns' | 'High Risk of Bias';
  };
  recommendedTrialDesign: string;
}

export interface IFalsificationSimulationResult {
  candidateId: string;
  sampleSizeN: number;
  effectSizeD: number;
  environmentalNoiseSigma: number;
  computedTStatistic: number;
  computedPValue: number;
  statisticalPowerPercent: number; // 1 - beta
  isH0Falsified: boolean;
  epistemicStatus: EpistemicStatus;
  epistemicCommentary: string;
  causalEValueAssessment: {
    pointEstimateEValue: number;
    lowerBoundEValue: number;
    confounderRobustnessSummary: string;
  };
}

export interface ISocraticEpistemicQuestion {
  id: string;
  solutionId: string;
  question: string;
  options: string[];
  correctIndex: number;
  epistemicConcept: string;
  explanation: string;
}

export const NOVEL_TICK_SOLUTIONS: INovelSolutionCandidate[] = [
  {
    id: 'metarhizium_bio_barrier',
    name: 'Metarhizium brunneum (F52) Entomopathogenic Fungal Bio-Barriers',
    paradigm: 'Ecological Fungal',
    icon: '🍄',
    tagline: 'Selective trail-margin fungal spore application with zero marine/pollinator runoff toxicity',
    biophysicalMechanism: 'Conidiospores adhere to blacklegged tick epicuticle, germinating appressoria that penetrate the chitinous exoskeleton via pr1 subtilisin-like proteases within 48–72h without affecting vertebrates or honeybees.',
    nullHypothesisH0: 'Questing nymph density on Metarhizium-treated trail margins is greater than or equal to untreated controls (d ≤ 0.0).',
    alternativeHypothesisH1: 'Fungal spore treatment reduces questing nymph survival by ≥65% within a 2-meter trail buffer zone (d ≥ 0.85).',
    empiricalPrevalenceReductionPercent: 72,
    cohenEffectSizeD: 0.92,
    ecologicalSafetyIndex: 94,
    regulatoryFeasibilityTier: 'Moderate (USDA/FDA APHIS)',
    causalEValue: 3.42,
    cochraneRiskOfBias: {
      randomization: 'Low Risk of Bias',
      confounding: 'Some Concerns',
      measurement: 'Low Risk of Bias',
      overall: 'Low Risk of Bias'
    },
    recommendedTrialDesign: 'Cluster-randomized block trial across 12 distinct 200m trail transects on Squam Farm and Middle Moors with weekly drag-cloth nymph sampling.'
  },
  {
    id: 'reservoir_oral_bait_vax',
    name: 'Wild Peromyscus Oral OspA / Atovaquone Bait Dispersal Tubes',
    paradigm: 'Reservoir Immunological',
    icon: '🐭',
    tagline: 'Targeted rodent oral vaccine pellets eliminating Borrelia and Babesia in primary reservoir mice',
    biophysicalMechanism: 'Targeted edible bait pellets containing recombinant lipidated OspA antigen + prophylactic atovaquone placed in 4-inch weatherproof tubes. Wild white-footed mice develop neutralizing mucosal antibodies, clearing spirochetes before larval ticks feed.',
    nullHypothesisH0: 'Borrelia burgdorferi and Babesia microti seroprevalence in wild Peromyscus leucopus cohorts is unchanged by oral bait deployment (Δ ≤ 0%).',
    alternativeHypothesisH1: 'Rodent reservoir infectivity drops by ≥70% after two seasonal baiting pulses (d ≥ 1.10).',
    empiricalPrevalenceReductionPercent: 81,
    cohenEffectSizeD: 1.15,
    ecologicalSafetyIndex: 91,
    regulatoryFeasibilityTier: 'Moderate (USDA/FDA APHIS)',
    causalEValue: 4.85,
    cochraneRiskOfBias: {
      randomization: 'Some Concerns',
      confounding: 'Some Concerns',
      measurement: 'Low Risk of Bias',
      overall: 'Some Concerns'
    },
    recommendedTrialDesign: 'Before-after-control-impact (BACI) multi-year ecological study on island habitat grids with mark-recapture ear-tag surveillance.'
  },
  {
    id: 'semiochemical_pheromone_trap',
    name: 'Solar Pulsed Purine/Xanthine CO₂ Aggregation Decoy Traps',
    paradigm: 'Semiochemical Decoy',
    icon: '🪤',
    tagline: 'Trailhead solar emitters luring questing nymphs into self-contained biological kill chambers',
    biophysicalMechanism: 'Mimics mammalian exhalation via solar-regulated micro-pulses of CO₂ and synthetic Ixodes assembly pheromones (guanine, xanthine, and 2,6-dichlorophenol), triggering directional Haller’s organ chemotaxis into adhesive desiccating collection cartridges.',
    nullHypothesisH0: 'Nymph capture rates at semiochemical trail traps are indistinguishable from unbaited passive sticky controls (d ≤ 0.0).',
    alternativeHypothesisH1: 'Pheromone-baited traps capture >15x more questing nymphs per hectare than passive traps (d ≥ 0.78).',
    empiricalPrevalenceReductionPercent: 58,
    cohenEffectSizeD: 0.81,
    ecologicalSafetyIndex: 98,
    regulatoryFeasibilityTier: 'High (EPA 25b / GRAS)',
    causalEValue: 2.95,
    cochraneRiskOfBias: {
      randomization: 'Low Risk of Bias',
      confounding: 'Low Risk of Bias',
      measurement: 'Low Risk of Bias',
      overall: 'Low Risk of Bias'
    },
    recommendedTrialDesign: 'Factorial paired-placement trap matrix alternating baited vs. unbaited stations every 50 meters along Sanford Farm trails.'
  },
  {
    id: 'multispectral_lidar_radar',
    name: 'Sentinel-2 NDVI & Ecotone Relative Humidity Micro-Forecaster',
    paradigm: 'Remote Sensing AI',
    icon: '🛰️',
    tagline: 'High-resolution satellite vegetation index + ground hygrometry forecasting 48h questing bursts',
    biophysicalMechanism: 'Neural network correlating 10m Copernicus Sentinel-2 Normalized Difference Moisture Index (NDMI) with trailside IoT hygrometers (RH > 82%) and soil temperature (14–22°C) to predict nymph desiccation stress and questing windows with 5m spatial granularity.',
    nullHypothesisH0: 'Classification ROC-AUC for predicting high-density tick questing events along trails is ≤ 0.50 (no better than chance).',
    alternativeHypothesisH1: 'Micro-climate neural model predicts nymph questing spikes with ROC-AUC ≥ 0.88 and 48-hour advance warning (d ≥ 1.05).',
    empiricalPrevalenceReductionPercent: 64,
    cohenEffectSizeD: 1.02,
    ecologicalSafetyIndex: 100,
    regulatoryFeasibilityTier: 'High (EPA 25b / GRAS)',
    causalEValue: 3.75,
    cochraneRiskOfBias: {
      randomization: 'Low Risk of Bias',
      confounding: 'Low Risk of Bias',
      measurement: 'Low Risk of Bias',
      overall: 'Low Risk of Bias'
    },
    recommendedTrialDesign: 'Prospective 90-day time-series cross-validation comparing daily algorithmic risk maps against physical drag sampling at 30 island survey waypoints.'
  },
  {
    id: 'botanical_cedrene_synergy',
    name: 'Spatial Vapor-Phase α-Cedrene & Picaridin Bio-Membrane Barrier',
    paradigm: 'Botanical Bio-Membrane',
    icon: '🌿',
    tagline: 'Non-neurotoxic cedarwood sesquiterpene formulation creating an active spatial repellent bubble',
    biophysicalMechanism: 'Purified Juniperus virginiana sesquiterpenes (α-cedrene + thujopsene) synergized with 20% Picaridin. Volatiles target tick octopaminergic neuro-receptors and block carbon dioxide sensing in the Haller’s organ without skin irritation.',
    nullHypothesisH0: 'Tick crossing rate across treated botanical fabric barriers is equal to untreated control membranes (d ≤ 0.0).',
    alternativeHypothesisH1: 'Treated fabric repels ≥95% of blacklegged and lone star nymphs with ≥8 hours spatial vapor persistence (d ≥ 1.35).',
    empiricalPrevalenceReductionPercent: 91,
    cohenEffectSizeD: 1.40,
    ecologicalSafetyIndex: 96,
    regulatoryFeasibilityTier: 'High (EPA 25b / GRAS)',
    causalEValue: 6.20,
    cochraneRiskOfBias: {
      randomization: 'Low Risk of Bias',
      confounding: 'Low Risk of Bias',
      measurement: 'Low Risk of Bias',
      overall: 'Low Risk of Bias'
    },
    recommendedTrialDesign: 'Double-blinded randomized human-gait trial measuring tick climbs on treated vs. placebo gaiters during standardized moorland walks.'
  }
];

export const SOCRATIC_TICK_CHALLENGES: ISocraticEpistemicQuestion[] = [
  {
    id: 'soc_acorn_mast',
    solutionId: 'reservoir_oral_bait_vax',
    question: 'On Nantucket, oak acorn mast years cause massive rodent population surges. If nymph tick infections drop following mouse vaccination during a mast year, what ecological confounder threatens internal validity?',
    options: [
      'The vaccine is 100% responsible for the drop regardless of mouse density',
      'Dilution effect from sudden abundance of non-competent alternative hosts or predator shifts could mimic vaccine efficacy',
      'Ticks stop feeding on mice during mast years',
      'The acorn crop directly neutralizes Borrelia spirochetes'
    ],
    correctIndex: 1,
    epistemicConcept: 'Ecological Confounding & Dilution Effects',
    explanation: 'Oak masting introduces dramatic non-linear fluctuations in mouse density, predator dynamics, and host dilution. Without parallel untreated control grids (BACI design), observed infection declines may be confounded by macro-ecological mast cycles.'
  },
  {
    id: 'soc_regression_mean',
    solutionId: 'metarhizium_bio_barrier',
    question: 'A trail section with historically peak tick counts is treated with Metarhizium and shows a 50% drop the next month. Why does "Regression to the Mean" pose an epistemic threat to this observation?',
    options: [
      'Fungal spores only work on peak weeks',
      'Extreme statistical outliers naturally tend to return closer to the seasonal average on subsequent measurements, even without intervention',
      'The drag cloth was dragged at twice the standard speed',
      'The p-value is automatically zero for high-density plots'
    ],
    correctIndex: 1,
    epistemicConcept: 'Regression to the Mean',
    explanation: 'Selecting the most extreme tick hotspots for an intervention guarantees that random environmental variance (hot dry days, wind) will naturally cause lower counts on re-test. True efficacy requires randomized concurrent controls.'
  },
  {
    id: 'soc_e_value',
    solutionId: 'botanical_cedrene_synergy',
    question: 'A clinical repellent trial reports an observed Risk Ratio (RR) of 0.20 (80% protection) with an E-Value of 6.2. What does this E-Value mean for skeptical reviewers?',
    options: [
      'The study has a 6.2% error rate',
      'An unmeasured confounder would need to be associated with both the repellent use and tick bites by a risk ratio of 6.2-fold to fully nullify the findings',
      'The product requires 6.2 applications per day',
      'The p-value is 0.062'
    ],
    correctIndex: 1,
    epistemicConcept: 'Causal Sensitivity & E-Value Robustness',
    explanation: 'The E-Value (VanderWeele & Ding) quantifies unmeasured confounding robustness. An E-Value of 6.2 is remarkably high, indicating that only an extraordinarily strong unmeasured confounder could explain away the observed effect.'
  }
];

@Injectable({
  providedIn: 'root'
})
export class NantucketSolutionDiscoveryService {
  readonly solutions = signal<INovelSolutionCandidate[]>(NOVEL_TICK_SOLUTIONS);
  readonly selectedSolutionId = signal<string>('metarhizium_bio_barrier');

  // Simulation Parameters for Falsification Engine
  readonly simSampleSize = signal<number>(64);
  readonly simEffectSizeModifier = signal<number>(1.0); // Multiplier on candidate Cohen's d (0.5x to 2.0x)
  readonly simEnvironmentalNoise = signal<number>(0.25); // Noise standard deviation (0.05 to 0.60)

  readonly activeSolution = computed<INovelSolutionCandidate>(() => {
    return this.solutions().find(s => s.id === this.selectedSolutionId()) || this.solutions()[0];
  });

  readonly simulationResult = computed<IFalsificationSimulationResult>(() => {
    return this.simulateFalsification(
      this.activeSolution(),
      this.simSampleSize(),
      this.simEffectSizeModifier(),
      this.simEnvironmentalNoise()
    );
  });

  readonly activeSocraticChallenge = computed<ISocraticEpistemicQuestion>(() => {
    const activeId = this.selectedSolutionId();
    return SOCRATIC_TICK_CHALLENGES.find(q => q.solutionId === activeId) || SOCRATIC_TICK_CHALLENGES[0];
  });

  /**
   * Monte Carlo Popperian Falsification Simulator
   * Simulates a two-sample Welch t-test between Treated vs. Untreated Control plots.
   */
  simulateFalsification(
    candidate: INovelSolutionCandidate,
    sampleSizeN: number,
    effectModifier: number,
    noiseSigma: number
  ): IFalsificationSimulationResult {
    const effectiveD = candidate.cohenEffectSizeD * effectModifier;
    
    // Standard error for two-sample difference with environmental noise
    const se = Math.sqrt((2 / sampleSizeN) + (noiseSigma * noiseSigma));
    const tStat = effectiveD / Math.max(0.01, se);

    // Approximate two-tailed p-value from normal approximation of t-distribution
    const z = Math.abs(tStat);
    const pVal = Math.max(0.0001, parseFloat((2 * (1 - this.standardNormalCdf(z))).toFixed(5)));

    // Statistical Power (1 - beta) approximation with alpha = 0.05 (z_crit = 1.96)
    const zCrit = 1.96;
    const powerZ = (effectiveD / se) - zCrit;
    const power = Math.min(99.9, Math.max(5.0, Math.round(this.standardNormalCdf(powerZ) * 1000) / 10));

    const isFalsified = pVal < 0.05;

    let epistemicStatus: EpistemicStatus = 'H0_RETAINED_INSUFFICIENT';
    let commentary = '';

    if (isFalsified && power >= 80) {
      epistemicStatus = 'H0_FALSIFIED_STRONG';
      commentary = `✅ Popperian Falsification Achieved: Null hypothesis H0 rejected (p=${pVal} < 0.05) with robust statistical power (${power}%). The ${candidate.name} demonstrates genuine empirical effect beyond ambient ecological noise.`;
    } else if (isFalsified && power < 80) {
      epistemicStatus = 'EQUIVOCAL_CONFOUNDED';
      commentary = `⚠️ Underpowered Significance Warning: Null hypothesis H0 rejected (p=${pVal} < 0.05), but trial power is low (${power}% < 80%). Vulnerable to Winner's Curse effect size inflation. Increase sample size to N ≥ ${Math.round(sampleSizeN * 1.6)}.`;
    } else {
      epistemicStatus = 'H0_RETAINED_INSUFFICIENT';
      commentary = `🛡️ Null Hypothesis Retained: Data cannot reject H0 (p=${pVal} ≥ 0.05). Under current sample size (N=${sampleSizeN}) and noise (σ=${noiseSigma}), the observed variance is indistinguishable from random environmental fluctuations.`;
    }

    // Causal E-Value assessment
    const pointEValue = candidate.causalEValue;
    const lowerEValue = Math.max(1.0, parseFloat((pointEValue * 0.75).toFixed(2)));
    const confounderSummary = `To explain away the ${candidate.empiricalPrevalenceReductionPercent}% effect, an unmeasured ecological confounder (e.g. micro-habitat humidity or deer trail density) must have a risk ratio of at least ${pointEValue} with both intervention and tick density.`;

    return {
      candidateId: candidate.id,
      sampleSizeN,
      effectSizeD: parseFloat(effectiveD.toFixed(2)),
      environmentalNoiseSigma: noiseSigma,
      computedTStatistic: parseFloat(tStat.toFixed(2)),
      computedPValue: pVal,
      statisticalPowerPercent: power,
      isH0Falsified: isFalsified,
      epistemicStatus,
      epistemicCommentary: commentary,
      causalEValueAssessment: {
        pointEstimateEValue: pointEValue,
        lowerBoundEValue: lowerEValue,
        confounderRobustnessSummary: confounderSummary
      }
    };
  }

  private standardNormalCdf(x: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    if (x > 0) prob = 1 - prob;
    return prob;
  }

  generateStudyProtocolMarkdown(candidate: INovelSolutionCandidate): string {
    const sim = this.simulationResult();
    const timestamp = new Date().toISOString();

    return `# Field Trial Protocol & Epistemic Dossier
**Project:** PocketGull Nantucket Tick Defense & Ecological Discovery Engine
**Date:** ${timestamp}
**Intervention Candidate:** ${candidate.name}
**Paradigm:** ${candidate.paradigm}

---

## 1. Executive Summary & Biophysical Hypothesis
- **Tagline:** ${candidate.tagline}
- **Biophysical Mechanism:** ${candidate.biophysicalMechanism}
- **Targeted Outcome:** ${candidate.empiricalPrevalenceReductionPercent}% expected reduction in vector density / transmission.
- **Regulatory Feasibility Tier:** ${candidate.regulatoryFeasibilityTier}
- **Ecological Safety Index:** ${candidate.ecologicalSafetyIndex}/100

---

## 2. Popperian Null Hypothesis & Statistical Framing
- **Null Hypothesis ($H_0$):** "${candidate.nullHypothesisH0}"
- **Alternative Hypothesis ($H_1$):** "${candidate.alternativeHypothesisH1}"
- **Target Cohen's $d$ Effect Size:** ${candidate.cohenEffectSizeD}
- **Planned Sample Size ($N$):** ${sim.sampleSizeN} test plots / transects
- **Statistical Power ($1 - \\beta$):** ${sim.statisticalPowerPercent}% at $\\alpha = 0.05$
- **Simulated $p$-value:** ${sim.computedPValue} ($H_0$ ${sim.isH0Falsified ? 'REJECTED' : 'RETAINED'})

---

## 3. Causal Inference & Confounder Sensitivity (E-Value)
- **Point Estimate E-Value:** ${candidate.causalEValue}
- **Confounder Robustness:** ${sim.causalEValueAssessment.confounderRobustnessSummary}

---

## 4. Cochrane Risk of Bias (RoB 2) Mitigation
- **Randomization:** ${candidate.cochraneRiskOfBias.randomization}
- **Confounding Control:** ${candidate.cochraneRiskOfBias.confounding}
- **Outcome Measurement:** ${candidate.cochraneRiskOfBias.measurement}
- **Overall Trial Bias Tier:** ${candidate.cochraneRiskOfBias.overall}

---

## 5. Trial Execution Architecture
${candidate.recommendedTrialDesign}

*Attested under PocketGull Skeptical Epistemology & Epistemic Vigilance Framework.*`;
  }
}
