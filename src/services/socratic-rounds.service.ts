import { Injectable, signal, computed } from '@angular/core';

export interface ISocraticDebateMessage {
  id: string;
  speaker: 'dr_skeptic' | 'dr_pragmatist' | 'moderator';
  speakerName: string;
  speakerTitle: string;
  speakerBadge: string;
  message: string;
  timestamp: string;
  pValueNullHypothesis?: number;
  cochraneRoB?: 'Low' | 'Some Concerns' | 'High';
  evidenceGrade?: 'Level 1 (RCT/Meta)' | 'Level 2 (Cohort)' | 'Level 3 (Case-Control)' | 'Level 4 (Expert Opinion)';
  falsificationVector?: string;
  therapeuticProtocol?: string;
}

export interface IDifferentialCandidate {
  name: string;
  icd10: string;
  priorProbability: number;
  posteriorProbability: number;
  likelihoodRatio: number;
  pValueNullHypothesis: number;
  keyBiomarker: string;
  contraindicationWarning?: string;
  evidenceConfidence: number; // 0.0 - 1.0
}

@Injectable({
  providedIn: 'root'
})
export class SocraticRoundsService {
  readonly roundsActive = signal<boolean>(false);
  readonly currentTurn = signal<number>(0);
  readonly consensusScore = signal<number>(0.74); // 0.00 to 1.00
  readonly selectedCaseTopic = signal<string>('Complex Multi-Compartment Knee Arthralgia & Chronic Fatigue');

  readonly debateMessages = signal<ISocraticDebateMessage[]>([
    {
      id: 'msg-1',
      speaker: 'moderator',
      speakerName: 'Rounds Director (AI CDS)',
      speakerTitle: 'Chief Medical AI Synthesizer',
      speakerBadge: 'STAT Clinical Intake',
      message: 'Case Presentation: 42yo presenting with medial joint-line pain, positive McMurray test, persistent fatigue, and elevated CRP (8.4 mg/L). Differential diagnosis is open.',
      timestamp: '08:00:12',
      evidenceGrade: 'Level 1 (RCT/Meta)'
    },
    {
      id: 'msg-2',
      speaker: 'dr_skeptic',
      speakerName: 'Dr. Skeptic (Popperian CDS)',
      speakerTitle: 'Null Hypothesis Falsification & Cochrane RoB Lead',
      speakerBadge: 'H₀ Falsifier (p < 0.05)',
      message: 'We cannot reject the null hypothesis of non-specific bursitis without an isolated coronal MRI confirmation. McMurray test sensitivity is only 53% in isolation (Cochrane RoB: Some Concerns). Do not jump to arthroscopy without ruling out systemic inflammatory arthropathy.',
      timestamp: '08:00:28',
      pValueNullHypothesis: 0.024,
      cochraneRoB: 'Low',
      falsificationVector: 'Requires HLA-B27 and Quantitative T2 Cartilage Mapping before surgical referral.'
    },
    {
      id: 'msg-3',
      speaker: 'dr_pragmatist',
      speakerName: 'Dr. Pragmatist (Functional MD)',
      speakerTitle: 'Systems Biology & Restorative Strategy Lead',
      speakerBadge: 'Systems Biology',
      message: 'While we verify the coronal MRI slices, we must address the systemic metabolic driver. The elevated CRP with joint pain suggests subclinical metabolic endotoxemia. I recommend immediate high-potency Boswellia serrata (AKBA), Curcumin phytosome, and isometric quadriceps biofeedback.',
      timestamp: '08:00:45',
      therapeuticProtocol: 'AKBA 100mg BID + Supervised Vastus Medialis Isometric Activation',
      evidenceGrade: 'Level 2 (Cohort)'
    }
  ]);

  readonly differentialRankings = signal<IDifferentialCandidate[]>([
    {
      name: 'Medial Meniscus Posterior Horn Radial Tear',
      icd10: 'M23.22',
      priorProbability: 0.28,
      posteriorProbability: 0.76,
      likelihoodRatio: 3.42,
      pValueNullHypothesis: 0.012,
      keyBiomarker: 'Coronal T2 Fat-Sat Surface Signal Disruption',
      evidenceConfidence: 0.88
    },
    {
      name: 'Medial Compartment Osteoarthritis (Kellgren-Lawrence II)',
      icd10: 'M17.11',
      priorProbability: 0.35,
      posteriorProbability: 0.62,
      likelihoodRatio: 2.15,
      pValueNullHypothesis: 0.038,
      keyBiomarker: 'Subchondral Sclerosis & 2.1mm Joint Space Narrowing',
      evidenceConfidence: 0.82
    },
    {
      name: 'Pes Anserine Bursitis & Tendinopathy',
      icd10: 'M70.51',
      priorProbability: 0.15,
      posteriorProbability: 0.31,
      likelihoodRatio: 1.10,
      pValueNullHypothesis: 0.142, // Non-significant H0 cannot be rejected
      keyBiomarker: 'Anteromedial Tibial Fluid Collection',
      contraindicationWarning: 'p >= 0.05: Insufficient evidence to isolate from primary meniscal tear',
      evidenceConfidence: 0.45
    },
    {
      name: 'Subclinical Spondyloarthritis Enthesopathy',
      icd10: 'M46.90',
      priorProbability: 0.08,
      posteriorProbability: 0.19,
      likelihoodRatio: 1.45,
      pValueNullHypothesis: 0.085,
      keyBiomarker: 'CRP > 8.0 mg/L & Morning Stiffness > 30 min',
      evidenceConfidence: 0.52
    }
  ]);

  readonly consensusTier = computed(() => {
    const s = this.consensusScore();
    if (s >= 0.80) return { label: 'High Concordance', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    if (s >= 0.50) return { label: 'Active Clinical Debate', color: 'text-amber-300', bg: 'bg-amber-500/20' };
    return { label: 'Divergent Epistemology', color: 'text-rose-400', bg: 'bg-rose-500/20' };
  });

  /**
   * Dispatches a new debate round with automated Socratic turn generation.
   */
  advanceDebateRound(userHypothesis?: string): void {
    const nextTurn = this.currentTurn() + 1;
    this.currentTurn.set(nextTurn);

    const now = new Date().toLocaleTimeString();

    if (userHypothesis) {
      this.debateMessages.update(msgs => [
        ...msgs,
        {
          id: `msg-${Date.now()}-user`,
          speaker: 'moderator',
          speakerName: 'Attending Clinician (You)',
          speakerTitle: 'Consulting Physician',
          speakerBadge: 'Clinical Input',
          message: userHypothesis,
          timestamp: now,
          evidenceGrade: 'Level 4 (Expert Opinion)'
        }
      ]);
    }

    // Generate Dr. Skeptic rebuttal
    const skepticMsg: ISocraticDebateMessage = {
      id: `msg-${Date.now()}-sk`,
      speaker: 'dr_skeptic',
      speakerName: 'Dr. Skeptic (Popperian CDS)',
      speakerTitle: 'Null Hypothesis Falsification Lead',
      speakerBadge: 'H₀ Scrutiny',
      message: `Analyzing new hypothesis: Likelihood ratio adjusted to 2.85. The positive predictive value requires exclusion of acute cruciate instability ($p=0.009$). Recommend joint fluid leukocyte count.`,
      timestamp: now,
      pValueNullHypothesis: 0.009,
      cochraneRoB: 'Low',
      falsificationVector: 'Falsification Criteria: Must demonstrate lack of synovial leukocytosis (<2,000/mcL).'
    };

    // Generate Dr. Pragmatist synthesis
    const pragmatistMsg: ISocraticDebateMessage = {
      id: `msg-${Date.now()}-pr`,
      speaker: 'dr_pragmatist',
      speakerName: 'Dr. Pragmatist (Functional MD)',
      speakerTitle: 'Systems Biology Lead',
      speakerBadge: 'Actionable Protocol',
      message: `Concur with synovial fluid surveillance. In the interim, initiate non-thermal low-level laser (PBM) over the medial collateral footprint to accelerate type-II collagen alignment.`,
      timestamp: now,
      therapeuticProtocol: 'PBM 810nm 6J/cm² + Collagen Peptides 15g/day with Vitamin C 500mg',
      evidenceGrade: 'Level 1 (RCT/Meta)'
    };

    this.debateMessages.update(msgs => [...msgs, skepticMsg, pragmatistMsg]);

    // Modulate consensus score dynamically
    this.consensusScore.update(s => Math.min(0.98, Math.max(0.35, s + 0.04)));
  }

  resetRounds(): void {
    this.currentTurn.set(0);
    this.consensusScore.set(0.74);
  }
}
