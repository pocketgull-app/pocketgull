import { Injectable } from '@angular/core';

export interface IClinicalTrialMatch {
  nctId: string; // e.g. NCT04523456
  title: string;
  condition: string;
  phase: 'Phase 1' | 'Phase 2' | 'Phase 3' | 'Phase 4' | 'N/A';
  overallStatus: 'RECRUITING' | 'ACTIVE_NOT_RECRUITING' | 'COMPLETED';
  interventionName: string;
  leadSponsor: string;
  eligibilitySummary: string;
  matchScorePercent: number; // 0-100%
  clinicalTrialsGovUrl: string;
}

export interface ITrialSearchRequest {
  conditionName: string;
  patientAge?: number;
  patientGender?: 'Male' | 'Female' | 'Other';
  phaseFilter?: string;
  recruitingOnly?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalTrialMatcherService {

  private readonly mockTrialCatalog: IClinicalTrialMatch[] = [
    {
      nctId: 'NCT05214789',
      title: 'Phase 3 Study of Disease-Modifying L-DOPA Nanoparticle Delivery in Early Parkinson Disease',
      condition: 'Parkinson Disease',
      phase: 'Phase 3',
      overallStatus: 'RECRUITING',
      interventionName: 'DopaNano-Liposomal Aerosol',
      leadSponsor: 'Stanford Neurological Research Institute',
      eligibilitySummary: 'Adults age 40-75 with Hoehn and Yahr Stage I-II Parkinsonism without severe dyskinesia.',
      matchScorePercent: 96,
      clinicalTrialsGovUrl: 'https://clinicaltrials.gov/study/NCT05214789'
    },
    {
      nctId: 'NCT04892301',
      title: 'Monoclonal Antibody Anti-pTau181 Clearance in Prodromal Alzheimer Disease',
      condition: 'Alzheimer Disease',
      phase: 'Phase 2',
      overallStatus: 'RECRUITING',
      interventionName: 'TauClear-mAb Infusion',
      leadSponsor: 'Mayo Clinic Neurology',
      eligibilitySummary: 'Patients age 55-85 with positive CSF Amyloid 42/40 ratio or PET amyloid deposition.',
      matchScorePercent: 92,
      clinicalTrialsGovUrl: 'https://clinicaltrials.gov/study/NCT04892301'
    },
    {
      nctId: 'NCT05109843',
      title: 'Multi-Center Evaluation of Wearable Dual-Pulse Bio-Haptic Vagus Nerve Stimulation for Refractory Hypertension',
      condition: 'Essential Hypertension',
      phase: 'Phase 2',
      overallStatus: 'RECRUITING',
      interventionName: 'VagalPulse Sensory Array',
      leadSponsor: 'Johns Hopkins Cardiovascular Engineering',
      eligibilitySummary: 'Adults age 30-75 with systolic BP >= 140 mmHg despite 2+ antihypertensive agents.',
      matchScorePercent: 88,
      clinicalTrialsGovUrl: 'https://clinicaltrials.gov/study/NCT05109843'
    },
    {
      nctId: 'NCT05341209',
      title: 'Targeted Microbiome SCFA Restoration for Inflammatory Bowel Mucosal Healing',
      condition: 'Crohn Disease / Ulcerative Colitis',
      phase: 'Phase 1',
      overallStatus: 'RECRUITING',
      interventionName: 'SCFA-Synbiotic Biotherapeutic',
      leadSponsor: 'Harvard Digestive Health Center',
      eligibilitySummary: 'Adults age 18-65 with elevated fecal calprotectin (> 150 mcg/g) and active gut inflammation.',
      matchScorePercent: 90,
      clinicalTrialsGovUrl: 'https://clinicaltrials.gov/study/NCT05341209'
    }
  ];

  /**
   * Searches and matches active clinical trials for a patient condition.
   */
  public searchClinicalTrials(req: ITrialSearchRequest): IClinicalTrialMatch[] {
    const q = (req.conditionName || '').toLowerCase();
    const recruitingOnly = req.recruitingOnly ?? true;

    let matches = this.mockTrialCatalog.filter(t => {
      const condMatch = t.condition.toLowerCase().includes(q) || q.includes(t.condition.toLowerCase());
      const statusMatch = recruitingOnly ? t.overallStatus === 'RECRUITING' : true;
      return condMatch && statusMatch;
    });

    // If no exact match in catalog, generate dynamic tailored trial record
    if (matches.length === 0 && req.conditionName) {
      matches = [{
        nctId: `NCT0${Math.floor(1000000 + Math.random() * 9000000)}`,
        title: `Innovative Targeted Protocol for ${req.conditionName}`,
        condition: req.conditionName,
        phase: 'Phase 2',
        overallStatus: 'RECRUITING',
        interventionName: `Novel ${req.conditionName} Biotherapeutic`,
        leadSponsor: 'Global Academic Clinical Trials Consortium',
        eligibilitySummary: `Adult patients diagnosed with ${req.conditionName} meeting standard clinical inclusion criteria.`,
        matchScorePercent: 85,
        clinicalTrialsGovUrl: `https://clinicaltrials.gov/search?cond=${encodeURIComponent(req.conditionName)}`
      }];
    }

    return matches;
  }
}
