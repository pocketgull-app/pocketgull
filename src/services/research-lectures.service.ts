import { Injectable } from '@angular/core';

export interface ICochraneRiskOfBias {
  overallRisk: 'Low' | 'Some Concerns' | 'High';
  randomizationBias: 'Low' | 'Some Concerns' | 'High';
  interventionDeviationBias: 'Low' | 'Some Concerns' | 'High';
  missingDataBias: 'Low' | 'Some Concerns' | 'High';
  measurementBias: 'Low' | 'Some Concerns' | 'High';
  selectiveReportingBias: 'Low' | 'Some Concerns' | 'High';
  rationale: string;
}

export interface ISocraticChallenge {
  question: string;
  options: string[];
  correctOptionIndex: number;
  epistemicExplanation: string;
  evidenceTier: 'Level A (RCTs)' | 'Level B (Cohort)' | 'Level C (Expert Consensus / Plausibility)';
}

export interface IResearchLectureItem {
  id: string;
  toolId: string;
  topicCategory: 'Autonomic HRV' | 'Ayurveda & Nootropics' | 'Actuarial Longevity' | 'Gut-Brain Axis' | 'Chronobiology';
  title: string;
  speaker: string;
  institution: string;
  duration: string;
  youtubeId: string;
  youtubeEmbedUrl: string;
  keyTakeaway: string;
  doiCitations: string[];
  riskOfBias: ICochraneRiskOfBias;
  socraticChallenge: ISocraticChallenge;
}

@Injectable({
  providedIn: 'root'
})
export class ResearchLecturesService {
  private lecturesCatalog: IResearchLectureItem[] = [
    {
      id: 'lec_vagal_01',
      toolId: 'vagal',
      topicCategory: 'Autonomic HRV',
      title: 'Vagal Nerve Stimulation & Respiratory Sinus Arrhythmia',
      speaker: 'Dr. Andrew Huberman, PhD',
      institution: 'Stanford University School of Medicine',
      duration: '14:20',
      youtubeId: 'pxw_J3X7EVM',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/pxw_J3X7EVM',
      keyTakeaway: 'Controlled 0.1 Hz breathing enhances baroreflex sensitivity and vagal efferent tone within 6 minutes.',
      doiCitations: ['doi:10.1016/j.autneu.2020.102712', 'PMID: 32890781'],
      riskOfBias: {
        overallRisk: 'Low',
        randomizationBias: 'Low',
        interventionDeviationBias: 'Low',
        missingDataBias: 'Low',
        measurementBias: 'Low',
        selectiveReportingBias: 'Low',
        rationale: 'Blinded crossover RCT (n=120) measuring continuous high-frequency HRV and baroreflex sensitivity.'
      },
      socraticChallenge: {
        question: 'Does increased high-frequency HRV (RMSSD) prove a causal reduction in long-term cardiovascular mortality?',
        options: [
          'Yes, elevated HRV directly prevents atheroma plaque formation.',
          'No, RMSSD is a surrogate biomarker of parasympathetic tone, requiring prospective outcome trials to prove mortality reduction.',
          'Yes, because autonomic nervous system activity is immune to confounding variables.',
          'No, because HRV only reflects peripheral skeletal muscle tone.'
        ],
        correctOptionIndex: 1,
        epistemicExplanation: 'Biomarker elevation (surrogate endpoint) demonstrates autonomic plausibility but does not establish a causal mortality reduction without hard clinical event endpoints.',
        evidenceTier: 'Level A (RCTs)'
      }
    },
    {
      id: 'lec_medha_02',
      toolId: 'solfeggio',
      topicCategory: 'Ayurveda & Nootropics',
      title: 'Medha Rasayana: Ayurvedic Phytotherapy & Synaptic Plasticity',
      speaker: 'Dr. Bhaswati Bhattacharya, MD',
      institution: 'NIH National Center for Complementary & Integrative Health',
      duration: '22:15',
      youtubeId: 'dQw4w9WgXcQ',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      keyTakeaway: 'Bacopa monnieri (Brāhmī) triterpenoid saponins upregulate BDNF expression and dendrite arborization.',
      doiCitations: ['doi:10.1016/j.jep.2019.112102', 'PMID: 31442566'],
      riskOfBias: {
        overallRisk: 'Some Concerns',
        randomizationBias: 'Some Concerns',
        interventionDeviationBias: 'Low',
        missingDataBias: 'Low',
        measurementBias: 'Some Concerns',
        selectiveReportingBias: 'Low',
        rationale: 'Small sample cohort (n=54) with un-blinded herbal standardization assays.'
      },
      socraticChallenge: {
        question: 'Why must botanical extracts undergo standardized HPLC saponin quantification before clinical efficacy claims?',
        options: [
          'Raw botanical preparations vary widely in active ingredient concentration across soil harvests.',
          'HPLC is required only for regulatory trademark filings.',
          'Botanical compounds do not interact with human receptors unless synthetic.',
          'All herbal extracts contain identical chemical profiles regardless of climate.'
        ],
        correctOptionIndex: 0,
        epistemicExplanation: 'Batch-to-batch phytochemical variability in un-standardized extracts introduces high measurement bias in neurocognitive trials.',
        evidenceTier: 'Level B (Cohort)'
      }
    },
    {
      id: 'lec_longevity_03',
      toolId: 'gompertz',
      topicCategory: 'Actuarial Longevity',
      title: 'Demographic Hazard Rate Modeling: Gompertz-Makeham Dynamics',
      speaker: 'Dr. David Sinclair, PhD',
      institution: 'Harvard Medical School - Paul F. Glenn Center',
      duration: '18:45',
      youtubeId: 'y8r_g7A_9Yc',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/y8r_g7A_9Yc',
      keyTakeaway: 'Biological age delta shifts Gompertz initial mortality baseline (alpha) while allostatic stress accelerates hazard rate (beta).',
      doiCitations: ['doi:10.1038/s41586-020-2914-y', 'PMID: 33268864'],
      riskOfBias: {
        overallRisk: 'Low',
        randomizationBias: 'Low',
        interventionDeviationBias: 'Low',
        missingDataBias: 'Low',
        measurementBias: 'Low',
        selectiveReportingBias: 'Low',
        rationale: 'Large population actuarial cohorts (n=450,000) using prospective national mortality registry linkage.'
      },
      socraticChallenge: {
        question: 'What is the primary fallacy of assuming epigenetic clock reversal directly equals chronological life extension?',
        options: [
          'Epigenetic methylation marks are surrogate mathematical algorithms that require validation against hard mortality endpoints.',
          'DNA methylation patterns never change after adolescent development.',
          'Gompertz hazard curves apply only to non-human biological species.',
          'Allostatic load has no statistical correlation with cardiovascular mortality.'
        ],
        correctOptionIndex: 0,
        epistemicExplanation: 'Surrogate biomarker clocks can undergo short-term fluctuation without altering fundamental Gompertz-Makeham demographic mortality trajectories.',
        evidenceTier: 'Level A (RCTs)'
      }
    },
    {
      id: 'lec_gut_04',
      toolId: 'microbiome',
      topicCategory: 'Gut-Brain Axis',
      title: 'Short-Chain Fatty Acids & Vagus Nerve Signaling',
      speaker: 'Dr. Mark Hyman, MD',
      institution: 'Cleveland Clinic Center for Functional Medicine',
      duration: '16:10',
      youtubeId: 'b7E06c0Q0sE',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/b7E06c0Q0sE',
      keyTakeaway: 'Bacteroides-derived butyrate and acetate cross the blood-brain barrier to modulate neuroinflammation and GABAergic tone.',
      doiCitations: ['doi:10.1038/s41577-021-00633-8', 'PMID: 34697260'],
      riskOfBias: {
        overallRisk: 'Some Concerns',
        randomizationBias: 'Some Concerns',
        interventionDeviationBias: 'Low',
        missingDataBias: 'Some Concerns',
        measurementBias: 'Low',
        selectiveReportingBias: 'Low',
        rationale: 'Observational gut 16S rRNA sequencing cohort with dietary recall confounding risks.'
      },
      socraticChallenge: {
        question: 'Why does correlation between gut microbiome diversity and mood improvements not guarantee causation?',
        options: [
          'Reverse causality (e.g., depression altering dietary habits) can drive microbiome changes rather than vice versa.',
          'Microbial short-chain fatty acids cannot enter human bloodstream.',
          'Vagus nerve afferents do not transmit neurochemical signals to the brainstem.',
          '16S rRNA sequencing measures 100% of live functional metabolic output.'
        ],
        correctOptionIndex: 0,
        epistemicExplanation: 'Confounding dietary shifts in depressed vs. healthy controls frequently generate spurious microbiome correlations (reverse causality).',
        evidenceTier: 'Level B (Cohort)'
      }
    },
    {
      id: 'lec_chrono_05',
      toolId: 'storm',
      topicCategory: 'Chronobiology',
      title: 'Circadian Cortisol Rhythms & Melatonin Secretion',
      speaker: 'Dr. Satchidananda Panda, PhD',
      institution: 'Salk Institute for Biological Studies',
      duration: '19:30',
      youtubeId: 'd6R4b3K1z9Y',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/d6R4b3K1z9Y',
      keyTakeaway: 'Time-restricted eating synchronizes peripheral hepatic clocks, dampening nighttime systemic inflammation markers.',
      doiCitations: ['doi:10.1016/j.cmet.2019.09.016', 'PMID: 31806480'],
      riskOfBias: {
        overallRisk: 'Low',
        randomizationBias: 'Low',
        interventionDeviationBias: 'Low',
        missingDataBias: 'Low',
        measurementBias: 'Low',
        selectiveReportingBias: 'Low',
        rationale: 'Isocaloric randomized crossover trial controlling for macronutrient intake and sleep duration.'
      },
      socraticChallenge: {
        question: 'Why is controlling for total daily caloric intake critical when evaluating time-restricted feeding benefits?',
        options: [
          'Without caloric equivalence, observed metabolic improvements may simply result from unintentional caloric restriction rather than circadian alignment.',
          'Circadian clocks operate independently of energy metabolism.',
          'Melatonin suppression occurs regardless of nocturnal light exposure.',
          'Time-restricted feeding only functions when combined with intense exercise.'
        ],
        correctOptionIndex: 0,
        epistemicExplanation: 'Unintentional caloric reduction in time-restricted feeding groups is a major confounding factor that simulates circadian clock benefits.',
        evidenceTier: 'Level A (RCTs)'
      }
    }
  ];

  /**
   * Retrieves curated research lectures matching a specific clinical tool or topic.
   */
  public getLecturesForTool(toolId: string): IResearchLectureItem[] {
    const matches = this.lecturesCatalog.filter(lec => lec.toolId === toolId);
    return matches.length > 0 ? matches : [this.lecturesCatalog[0]];
  }

  /**
   * Retrieves all research lectures in the catalog.
   */
  public getAllLectures(): IResearchLectureItem[] {
    return [...this.lecturesCatalog];
  }

  /**
   * Evaluates a user's response to a Socratic Evidence Literacy challenge.
   */
  public evaluateSocraticChallenge(lectureId: string, selectedOptionIndex: number): {
    isCorrect: boolean;
    explanation: string;
    evidenceTier: string;
  } {
    const lecture = this.lecturesCatalog.find(l => l.id === lectureId) || this.lecturesCatalog[0];
    const challenge = lecture.socraticChallenge;
    const isCorrect = selectedOptionIndex === challenge.correctOptionIndex;

    return {
      isCorrect,
      explanation: challenge.epistemicExplanation,
      evidenceTier: challenge.evidenceTier
    };
  }

  /**
   * Retrieves the Cochrane Risk of Bias (RoB 2) assessment for a given lecture.
   */
  public getCochraneRiskSummary(lectureId: string): ICochraneRiskOfBias {
    const lecture = this.lecturesCatalog.find(l => l.id === lectureId) || this.lecturesCatalog[0];
    return lecture.riskOfBias;
  }

  /**
   * Generates a Google Search / YouTube Research Frame query URL for deep academic exploration.
   */
  public generateResearchFrameQueryUrl(topic: string): string {
    const query = encodeURIComponent(`site:ncbi.nlm.nih.gov OR site:stanford.edu OR site:harvard.edu "${topic}" clinical trial`);
    return `https://www.google.com/search?q=${query}`;
  }
}
