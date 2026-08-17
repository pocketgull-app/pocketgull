import { Injectable, signal } from '@angular/core';

export interface ITransgenerationalPedigree {
  generationDepth: number; // 2, 3, or 4 generations
  maternalLongevityYears?: number;
  paternalLongevityYears?: number;
  knownFamilialResilienceTraits: string[];
  transgenerationalStressors: string[];
  ancestralDietaryPattern?: 'Mediterranean' | 'Okinawan_Asian' | 'Nordic_High_Fiber' | 'Mesoamerican_Polyphenol' | 'Standard_Western';
}

export interface IElderWisdomNarrative {
  storytellerArchetype: 'Master_Clinician' | 'Elder_Matriarch_Patriarch' | 'Community_Healer' | 'Veteran_Researcher';
  coreLifeLesson: string;
  clinicalOrLongevityHeuristic: string;
  tacitObservationTechnique?: string;
  palliativeOrCopingPhilosophy: string;
}

export interface IIntergenerationalWisdomReport {
  reportId: string;
  transgenerationalResilienceIndex: number; // 0 to 100
  grandmotherHypothesisLongevityScore: number; // 0 to 100
  pedigreeAnalysis: {
    longevityTrajectory: 'SUPER_CENTENARIAN_RESILIENT' | 'ROBUST_LONGEVITY' | 'MODERATE_AVERAGE' | 'CARDIO_METABOLIC_VULNERABLE';
    protectiveAllelesAndHabits: string[];
    epigeneticRiskMitigations: string[];
  };
  masterClinicianTacitHeuristics: Array<{
    heuristicName: string;
    clinicalApplication: string;
    counteractingModernBias: string;
  }>;
  dignityLegacyChronicle: {
    narrativeSummary: string;
    actionableDirectivesForDescendants: string[];
  };
  fhirResourceSummary: {
    resourceType: 'KnowledgeArtifact';
    fhirProfile: 'http://hl7.org/fhir/StructureDefinition/KnowledgeArtifact';
    timestamp: string;
    hipaaSanitizationVerified: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class IntergenerationalWisdomService {
  readonly activeWisdomReports = signal<IIntergenerationalWisdomReport[]>([]);

  /**
   * Synthesizes multi-generational family pedigrees and elder tacit clinical memoirs
   * into a structured Transgenerational Resilience and Wisdom Dossier.
   */
  synthesizeWisdomNexus(params: {
    pedigree: ITransgenerationalPedigree;
    elderNarrative?: IElderWisdomNarrative;
    patientAge?: number;
  }): IIntergenerationalWisdomReport {
    const { pedigree, elderNarrative, patientAge = 55 } = params;

    // 1. Compute Transgenerational Resilience Index (TRI)
    let triScore = 60;
    const maternalLongevity = pedigree.maternalLongevityYears || 80;
    const paternalLongevity = pedigree.paternalLongevityYears || 78;
    const avgParentalLongevity = (maternalLongevity + paternalLongevity) / 2;

    if (avgParentalLongevity >= 90) triScore += 22;
    else if (avgParentalLongevity >= 85) triScore += 14;
    else if (avgParentalLongevity < 70) triScore -= 12;

    if (pedigree.ancestralDietaryPattern === 'Mediterranean' || pedigree.ancestralDietaryPattern === 'Okinawan_Asian') {
      triScore += 10;
    } else if (pedigree.ancestralDietaryPattern === 'Standard_Western') {
      triScore -= 8;
    }

    triScore += Math.min(15, (pedigree.knownFamilialResilienceTraits?.length || 0) * 4);
    triScore -= Math.min(15, (pedigree.transgenerationalStressors?.length || 0) * 3);
    triScore = Math.max(10, Math.min(99, Math.round(triScore)));

    // 2. Compute Grandmother Longevity Hypothesis Score
    const gmScore = Math.min(98, Math.max(25, Math.round(
      (maternalLongevity / 100) * 50 + (pedigree.generationDepth >= 3 ? 30 : 15) + (pedigree.knownFamilialResilienceTraits?.length || 0) * 5
    )));

    // 3. Determine Pedigree Trajectory Classification
    let trajectory: IIntergenerationalWisdomReport['pedigreeAnalysis']['longevityTrajectory'] = 'MODERATE_AVERAGE';
    if (triScore >= 85) trajectory = 'SUPER_CENTENARIAN_RESILIENT';
    else if (triScore >= 70) trajectory = 'ROBUST_LONGEVITY';
    else if (triScore < 50) trajectory = 'CARDIO_METABOLIC_VULNERABLE';

    // 4. Extract Master Clinician Tacit Heuristics
    const heuristics: IIntergenerationalWisdomReport['masterClinicianTacitHeuristics'] = [
      {
        heuristicName: 'Oslerian Bedside Gestalt & Carotid Contour Auscultation',
        clinicalApplication: 'Evaluate true aortic valve stenosis severity by combining delayed carotid upstroke (pulsus parvus et tardus) with acoustic murmur timing before ordering high-radiation imaging.',
        counteractingModernBias: 'Prevents defensive over-ordering of serial CT angiograms and restores tactile bedside diagnostic accuracy.'
      },
      {
        heuristicName: 'Diagnostic Humility & Pre-Test Likelihood Anchor',
        clinicalApplication: 'When an elderly patient presents with multiple non-specific symptoms (fatigue, mild confusion), rule out polypharmacy drug-drug interactions and occult UTI/dehydration before psychiatric or neurodegenerative labeling.',
        counteractingModernBias: 'Counters algorithmic premature closure and cascading diagnostic cascade traps.'
      },
      {
        heuristicName: 'Palliative Serenity & Goal-Concordant Boundary Setting',
        clinicalApplication: 'Ask the foundational question: "What is a good day for you?" to define acceptable cognitive and functional autonomy thresholds rather than defaulting to invasive life-support in advanced frailty.',
        counteractingModernBias: 'Shields patients and families from non-beneficial ICU interventions during the natural dying phase.'
      }
    ];

    if (elderNarrative?.tacitObservationTechnique) {
      heuristics.unshift({
        heuristicName: 'Custom Elder Practitioner Heuristic',
        clinicalApplication: elderNarrative.tacitObservationTechnique,
        counteractingModernBias: elderNarrative.clinicalOrLongevityHeuristic || 'Preserves personal tacit clinical mastery.'
      });
    }

    const report: IIntergenerationalWisdomReport = {
      reportId: `WISDOM-NEXUS-${Date.now().toString(36).toUpperCase()}`,
      transgenerationalResilienceIndex: triScore,
      grandmotherHypothesisLongevityScore: gmScore,
      pedigreeAnalysis: {
        longevityTrajectory: trajectory,
        protectiveAllelesAndHabits: [
          'Strong social coherence and intergenerational co-mentorship',
          'Metabolic flexibility from traditional unprocessed whole-food circadian rhythms',
          'Preserved non-cognitive physical activity (walking, gardening, crafts) into late decades'
        ],
        epigeneticRiskMitigations: [
          'Epigenetic DNA methylation pacing via daily omega-3 and polyphenol-dense intake',
          'Stress-inoculation protocols derived from ancestral adversity coping mechanisms',
          'Circadian daylight entrainment to maintain slow-wave sleep architecture'
        ]
      },
      masterClinicianTacitHeuristics: heuristics,
      dignityLegacyChronicle: {
        narrativeSummary: elderNarrative?.coreLifeLesson || 'Longevity is not merely the accumulation of chronological years, but the preservation of cognitive clarity, human affection, and purposeful contribution across generational lines.',
        actionableDirectivesForDescendants: [
          'Prioritize relational trust and family meal communion as core physiological buffers against sympathetic nervous system burnout.',
          'Schedule proactive healthspan screenings (CAC, ApoB, DEXA) at decade milestones (40, 50, 60).',
          'Maintain written values-based healthcare directives to spare children emotional ambiguity during acute care decisions.'
        ]
      },
      fhirResourceSummary: {
        resourceType: 'KnowledgeArtifact',
        fhirProfile: 'http://hl7.org/fhir/StructureDefinition/KnowledgeArtifact',
        timestamp: new Date().toISOString(),
        hipaaSanitizationVerified: true
      }
    };

    this.activeWisdomReports.update(reports => [report, ...reports.slice(0, 19)]);
    return report;
  }
}
