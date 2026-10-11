import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { TeledentistryService } from './teledentistry.service';

export interface IPeriodontalSystemicRisk {
  sibiScore: number; // Systemic Inflammatory Burden Index (0 - 100)
  cardiovascularRiskMultiplier: number; // e.g. 1.0x - 2.8x
  predictedHba1cElevation: number; // e.g. +0.0% to +0.8%
  endothelialDysfunctionGrade: 'Low' | 'Moderate' | 'Severe' | 'Critical';
  primaryPathogens: string[];
  recommendedInterventions: {
    title: string;
    description: string;
    evidenceGrade: 'Grade A' | 'Grade B' | 'Grade C';
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class PeriodontalSystemicBridgeService {
  private patientState = inject(PatientStateService);
  private teledentistry = inject(TeledentistryService);

  readonly hsCrpMgL = computed<number>(() => this.teledentistry.hsCRP());
  readonly deepPocketSites = computed<number>(() => this.teledentistry.deepPocketsCount());
  readonly bleedingOnProbingPercent = computed<number>(() => this.teledentistry.bleedingPercentage());

  readonly sibiScore = computed<number>(() => this.teledentistry.sibiScore());

  readonly systemicRiskAnalysis = computed<IPeriodontalSystemicRisk>(() => {
    const sibi = this.sibiScore();
    const pockets = this.deepPocketSites();
    const crp = this.hsCrpMgL();

    let cvMultiplier = 1.0;
    let hba1cAdd = 0.0;
    let grade: IPeriodontalSystemicRisk['endothelialDysfunctionGrade'] = 'Low';

    if (sibi >= 70 || crp >= 3.0 || pockets >= 6) {
      cvMultiplier = 2.4;
      hba1cAdd = 0.6;
      grade = 'Critical';
    } else if (sibi >= 45 || crp >= 2.0 || pockets >= 3) {
      cvMultiplier = 1.7;
      hba1cAdd = 0.4;
      grade = 'Severe';
    } else if (sibi >= 25 || crp >= 1.0) {
      cvMultiplier = 1.3;
      hba1cAdd = 0.2;
      grade = 'Moderate';
    }

    const interventions: IPeriodontalSystemicRisk['recommendedInterventions'] = [];

    if (this.teledentistry.buprenorphineTherapyActive()) {
      interventions.push({
        title: 'FDA 2022 Transmucosal Buprenorphine Dental Defense Protocol',
        description: 'Neutral water rinse immediately post-dissolution, strict 1-hour mechanical tooth brushing delay, prescription 5000 ppm sodium fluoride, and xylitol salivary pacing to arrest severe cervical decay.',
        evidenceGrade: 'Grade A'
      });
    }

    interventions.push(
      {
        title: 'Scaling & Root Planing (SRP) + Subantimicrobial Doxycycline',
        description: 'Mechanical debridement of subgingival bio-calculus reduces systemic TNF-alpha and hs-CRP by up to 35%.',
        evidenceGrade: 'Grade A'
      },
      {
        title: 'Green Tea EGCG & Essential Oil Oral Rinse',
        description: 'Matcha epigallocatechin gallate inhibits P. gingivalis cysteine proteases (gingipains) and attenuates endothelial vascular adhesion.',
        evidenceGrade: 'Grade B'
      },
      {
        title: 'Coenzyme Q10 & Omega-3 Fatty Acid Supplementation',
        description: 'Mitochondrial antioxidant support reduces gingival crevicular fluid oxidative distress and lowers systemic hs-CRP.',
        evidenceGrade: 'Grade B'
      }
    );

    return {
      sibiScore: sibi,
      cardiovascularRiskMultiplier: parseFloat(cvMultiplier.toFixed(2)),
      predictedHba1cElevation: parseFloat(hba1cAdd.toFixed(2)),
      endothelialDysfunctionGrade: grade,
      primaryPathogens: ['Porphyromonas gingivalis', 'Tannerella forsythia', 'Treponema denticola'],
      recommendedInterventions: interventions
    };
  });
}
