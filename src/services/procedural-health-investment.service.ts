import { Injectable, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';

export interface IProceduralInvestmentItem {
  id: string;
  category: 'Orthomolecular' | 'Lifestyle & Movement' | 'Acoustic & Vagal' | 'Clinical Diagnostics';
  proceduralInnovation: string;
  upfrontInvestmentUsd: number;
  projected5YearSavingsUsd: number;
  actuarialRoiRatio: number; // Exploratory modeled ratio
  qalyYield: number; // Exploratory modeled QALYs
  evidenceTier: 'Level A' | 'Level B' | 'Level C';
  epistemicBadge: string;
  roiBreakdown: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProceduralHealthInvestmentService {
  private state = inject(PatientStateService);

  /**
   * Generates Exploratory Procedural Health Investment Model Matrix.
   * All projections are explicitly badged as non-diagnostic in-silico hypotheses with Cochrane Evidence Tiers.
   */
  calculateProceduralInvestments(): IProceduralInvestmentItem[] {
    const EXPLORATORY_BADGE = '[EXPLORATORY IN SILICO MODEL • NON-DIAGNOSTIC]';
    return [
      {
        id: 'inv_vagal',
        category: 'Acoustic & Vagal',
        proceduralInnovation: 'Resonant 0.1 Hz Paced Vagal Breathing & HRV Biofeedback',
        upfrontInvestmentUsd: 45,
        projected5YearSavingsUsd: 450,
        actuarialRoiRatio: 10.0,
        qalyYield: 0.15,
        evidenceTier: 'Level C',
        epistemicBadge: EXPLORATORY_BADGE,
        roiBreakdown: `${EXPLORATORY_BADGE} (Cochrane Level C): Exploratory autonomic pacing adjunct; may modestly support parasympathetic tone and perceived stress regulation alongside standard clinical care.`
      },
      {
        id: 'inv_ortho',
        category: 'Orthomolecular',
        proceduralInnovation: 'Magnesium Glycinate & Standardized Curcumin Adjunct (Clinician-Reviewed)',
        upfrontInvestmentUsd: 180,
        projected5YearSavingsUsd: 540,
        actuarialRoiRatio: 3.0,
        qalyYield: 0.1,
        evidenceTier: 'Level C',
        epistemicBadge: EXPLORATORY_BADGE,
        roiBreakdown: `${EXPLORATORY_BADGE} (Cochrane Level C): Exploratory nutritional adjunct; hard long-term cardiovascular endpoint savings remain unconfirmed in large Phase 3 RCTs (H0 unrejected).`
      },
      {
        id: 'inv_foraging',
        category: 'Lifestyle & Movement',
        proceduralInnovation: 'Structured Outdoor Walking & Nature Exposure Routine',
        upfrontInvestmentUsd: 0,
        projected5YearSavingsUsd: 600,
        actuarialRoiRatio: 0,
        qalyYield: 0.2,
        evidenceTier: 'Level C',
        epistemicBadge: EXPLORATORY_BADGE,
        roiBreakdown: `${EXPLORATORY_BADGE} (Cochrane Level C): Low-cost aerobic and biophilic movement hypothesis supporting stress reduction and daily step volume; long-term cost savings are exploratory estimates.`
      },
      {
        id: 'inv_aiga',
        category: 'Clinical Diagnostics',
        proceduralInnovation: 'Preventive Cardiometabolic Panel & Standard 12-Lead ECG Screening',
        upfrontInvestmentUsd: 250,
        projected5YearSavingsUsd: 1250,
        actuarialRoiRatio: 5.0,
        qalyYield: 0.25,
        evidenceTier: 'Level C',
        epistemicBadge: EXPLORATORY_BADGE,
        roiBreakdown: `${EXPLORATORY_BADGE} (Cochrane Level C): Exploratory cost-offset model for guideline-directed preventive lab tracking when clinically indicated by an attending physician.`
      }
    ];
  }
}
