import { Injectable, signal, computed } from '@angular/core';

export interface ILateralHealthCard {
  id: string;
  strategyTitle: string; // e.g. "Oblique Strategy #42", "The Reverse Paradigm", "The Random Stimulus"
  category: 'OBLIQUE_STRATEGY' | 'DE_BONO_HAT' | 'PROVOCATION_PO' | 'MULTI_PARADIGM_FLIP';
  promptQuote: string;
  clinicalApplication: string;
  emojiBadge: string;
}

export interface IDeBonoClinicalPerspective {
  hatColor: 'WHITE' | 'RED' | 'BLACK' | 'YELLOW' | 'GREEN' | 'BLUE';
  hatName: string;
  focusArea: string;
  insights: string[];
  emojiBadge: string;
}

@Injectable({
  providedIn: 'root'
})
export class LateralThinkingHealthEngineService {
  private activeCards = signal<ILateralHealthCard[]>([
    {
      id: 'ob-001',
      strategyTitle: 'Oblique Strategy: Invert the Control Variable',
      category: 'OBLIQUE_STRATEGY',
      promptQuote: 'Let your autonomic heart rate variability conduct your daily calendar, rather than your clock.',
      clinicalApplication: 'When HRV RMSSD < 35ms, automatically clear non-essential meetings and trigger 528Hz AVS recovery.',
      emojiBadge: '🎴🫀⚡'
    },
    {
      id: 'ob-002',
      strategyTitle: 'The Provocation Method (PO): Light Over Sleep',
      category: 'PROVOCATION_PO',
      promptQuote: 'PO: Fatigue is not a lack of sleep; it is a photon frequency mismatch.',
      clinicalApplication: 'Adjust morning natural sunlight exposure (10,000 lux) before prescribing sleep supplements.',
      emojiBadge: '🌅👀💡'
    },
    {
      id: 'ob-003',
      strategyTitle: 'Multi-Paradigm Flip: Energy as Fuel',
      category: 'MULTI_PARADIGM_FLIP',
      promptQuote: 'Do not suppress acute emotional stress; channel it into physical movement or creative expression.',
      clinicalApplication: 'Convert high sympathetic arousal into a 15-minute Zone 2 physical quest or AVS entrainment.',
      emojiBadge: '☯️🔥🏃'
    }
  ]);

  private debonoPerspectives = signal<IDeBonoClinicalPerspective[]>([
    {
      hatColor: 'WHITE',
      hatName: 'White Hat (Objective Data)',
      focusArea: 'Biometric Telemetry & Lab Panels',
      insights: ['HRV: 42ms', 'SpO2: 98%', 'CGM Time-in-Range: 84%'],
      emojiBadge: '⚪📊'
    },
    {
      hatColor: 'RED',
      hatName: 'Red Hat (Somatic Intuition)',
      focusArea: 'Subjective Feeling & Emotional Tone',
      insights: ['Patient reports afternoon brain fog and mild tension in upper back.'],
      emojiBadge: '🔴🫀'
    },
    {
      hatColor: 'BLACK',
      hatName: 'Black Hat (Caution & Risk Audit)',
      focusArea: 'Safety & Contraindications',
      insights: ['Rx Robin verified zero drug-herbal interactions with current regimen.'],
      emojiBadge: '🖤🛡️'
    },
    {
      hatColor: 'YELLOW',
      hatName: 'Yellow Hat (Flourishing Potential)',
      focusArea: 'Epigenetic Growth & Vitality',
      insights: ['Patient has high potential for rapid autonomic recovery within 14 days.'],
      emojiBadge: '💛🌟'
    },
    {
      hatColor: 'GREEN',
      hatName: 'Green Hat (Creative Lateral Solutions)',
      focusArea: 'Novel Multi-Paradigm Interventions',
      insights: ['Combine 528Hz Solfeggio soundscapes with evening TCM Acupressure grounding.'],
      emojiBadge: '💚🌿🎧'
    },
    {
      hatColor: 'BLUE',
      hatName: 'Blue Hat (Peregrine Orchestration)',
      focusArea: 'Final Care Plan Synthesis',
      insights: ['Peregrine executes dynamic pivot to SOMATIC_AVS_RECOVERY mode.'],
      emojiBadge: '💙🦅'
    }
  ]);

  readonly cards = this.activeCards.asReadonly();
  readonly sixHats = this.debonoPerspectives.asReadonly();

  /**
   * Draw a random Lateral Thinking / Oblique Strategy card for clinical problem-solving
   */
  drawRandomStrategyCard(): ILateralHealthCard {
    const list = this.activeCards();
    const index = Math.floor(Math.random() * list.length);
    return list[index];
  }
}
