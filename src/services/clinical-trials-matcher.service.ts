import { Injectable, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { IPatient } from './patient.types';

export interface IClinicalTrialMatch {
  nctId: string;
  briefTitle: string;
  officialTitle: string;
  phase: 'Phase 1' | 'Phase 2' | 'Phase 3' | 'Phase 4' | 'Observational';
  status: 'RECRUITING' | 'ACTIVE_NOT_RECRUITING' | 'ENROLLING_BY_INVITATION';
  conditions: string[];
  interventions: string[];
  sponsor: string;
  distanceMiles: number;
  matchConfidenceScore: number; // 0-100%
  keyInclusionSummary: string;
  keyExclusionSummary: string;
  contactEmail: string;
  contactPhone: string;
  locationFacility: string;
}

export interface ITrialMatcherReport {
  patientId: string;
  timestamp: string;
  searchCriteria: {
    primaryCondition: string;
    age: number;
    gender: string;
    radiusMiles: number;
  };
  totalMatchesFound: number;
  matches: IClinicalTrialMatch[];
  fhirResearchStudyBundle: Record<string, unknown>;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalTrialsMatcherService {
  private patientState: PatientStateService | null = null;

  constructor() {
    try {
      this.patientState = inject(PatientStateService, { optional: true });
    } catch {
      this.patientState = null;
    }
  }

  private readonly CLINICAL_TRIALS_CATALOG: IClinicalTrialMatch[] = [
    {
      nctId: 'NCT05984112',
      briefTitle: 'Precision SGLT2i + GLP-1RA Multi-Omics Microvascular Trial',
      officialTitle: 'Phase 3 Multi-Center Randomized Trial Evaluating Renal Hemodynamics and SIBI Inflammatory Attenuation in High-Risk Metabolic Syndrome',
      phase: 'Phase 3',
      status: 'RECRUITING',
      conditions: ['Type 2 Diabetes', 'Essential Hypertension', 'Diabetic Kidney Disease'],
      interventions: ['Empagliflozin 25mg + Semaglutide 1.0mg', 'Standard Care Active Comparator'],
      sponsor: 'National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK)',
      distanceMiles: 14.2,
      matchConfidenceScore: 94,
      keyInclusionSummary: 'Age 40-75y, eGFR 45-85 mL/min, HbA1c 6.5-9.5%, documented essential hypertension.',
      keyExclusionSummary: 'History of end-stage renal disease (ESRD), acute pancreatitis within 12 months.',
      contactEmail: 'niddk-precision-trials@nih.gov',
      contactPhone: '+1 (800) 555-0199',
      locationFacility: 'Academic Medical Center - Division of Endocrinology & Nephrology'
    },
    {
      nctId: 'NCT06129845',
      briefTitle: 'Autonomic Vagal Entrainment & 4-7-8 Breathing in Postpartum Mood Lability',
      officialTitle: 'Phase 2 Randomized Trial of Real-Time HRV Biofeedback and Perinatal Doula Support for 4th-Trimester Resilience',
      phase: 'Phase 2',
      status: 'RECRUITING',
      conditions: ['Postpartum Mood Disturbance', 'Perinatal Anxiety', 'Autonomic Dysregulation'],
      interventions: ['PocketGull Resonant Biofeedback Vagal Entrainment', 'Sham Breathing Control'],
      sponsor: 'Eunice Kennedy Shriver National Institute of Child Health and Human Development (NICHD)',
      distanceMiles: 8.5,
      matchConfidenceScore: 98,
      keyInclusionSummary: 'Postpartum Day 7-90, EPDS score >= 10, resting HRV SDNN < 40ms.',
      keyExclusionSummary: 'Active psychosis or severe bipolar disorder.',
      contactEmail: 'nichd-maternal-vagal@nih.gov',
      contactPhone: '+1 (800) 555-0144',
      locationFacility: 'Maternal-Fetal Clinical Research Pavilion'
    },
    {
      nctId: 'NCT04892156',
      briefTitle: 'Pancreatic Adenocarcinoma Immunotherapy & High-Dose EPA Resolution Trial',
      officialTitle: 'Phase 2 Evaluation of PERT + Specialized Pro-Resolving Mediators in Advanced Pancreatic Ductal Adenocarcinoma',
      phase: 'Phase 2',
      status: 'RECRUITING',
      conditions: ['Pancreatic Ductal Adenocarcinoma', 'Cancer Cachexia'],
      interventions: ['Pancreatic Enzyme Replacement Therapy (PERT) + SPM Resolvins', 'Standard mFOLFIRINOX'],
      sponsor: 'National Cancer Institute (NCI Moonshot)',
      distanceMiles: 22.0,
      matchConfidenceScore: 96,
      keyInclusionSummary: 'Histologically confirmed PDAC, ECOG Performance Status 0-2, weight loss >= 5%.',
      keyExclusionSummary: 'Severe refractory bowel obstruction.',
      contactEmail: 'nci-moonshot-pdac@nih.gov',
      contactPhone: '+1 (800) 555-0188',
      locationFacility: 'Comprehensive Cancer Center'
    },
    {
      nctId: 'NCT05432190',
      briefTitle: 'Early-Onset Neuro-Metabolic Biomarker Tracking (ADRD Initiative)',
      officialTitle: 'Observational Multi-Modal PET-Tau, Plasma p-Tau217 and Autonomic Sleep Tracking Study',
      phase: 'Observational',
      status: 'RECRUITING',
      conditions: ['Mild Cognitive Impairment', 'Alzheimer Disease', 'Subjective Cognitive Decline'],
      interventions: ['High-Density Digital Telemetry & Sleep Spindle Analysis'],
      sponsor: 'National Institute on Aging (NIA)',
      distanceMiles: 18.7,
      matchConfidenceScore: 91,
      keyInclusionSummary: 'Age 50-85y, MoCA score 20-28, baseline sleep fragmentation.',
      keyExclusionSummary: 'Major acute stroke within 6 months.',
      contactEmail: 'nia-adrd-tracking@nih.gov',
      contactPhone: '+1 (800) 555-0177',
      locationFacility: 'Brain Health & Memory Institute'
    }
  ];

  /**
   * Matches candidate clinical trials for a patient
   */
  public matchTrialsForPatient(patient: IPatient, maxDistanceMiles = 50): ITrialMatcherReport {
    const age = patient.age || 50;
    const gender = patient.gender || 'Male';
    const conditions = (patient.preexistingConditions || []).join(' ').toLowerCase();

    // Filter and score matches
    const scoredMatches = this.CLINICAL_TRIALS_CATALOG.filter(trial => {
      return trial.distanceMiles <= maxDistanceMiles;
    }).map(trial => {
      let score = 75;

      // Condition match bonus
      const matchesCond = trial.conditions.some(c => conditions.includes(c.toLowerCase().split(' ')[0]));
      if (matchesCond) score += 20;

      // Age eligibility heuristic
      if (age >= 18 && age <= 80) score += 5;

      return {
        ...trial,
        matchConfidenceScore: Math.min(99, score)
      };
    }).sort((a, b) => b.matchConfidenceScore - a.matchConfidenceScore);

    const primaryCond = patient.preexistingConditions?.[0] || 'Standard Medical Surveillance';

    // Generate FHIR ResearchStudy Bundle
    const fhirResearchStudyBundle = {
      resourceType: 'Bundle',
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: scoredMatches.map(m => ({
        resource: {
          resourceType: 'ResearchStudy',
          id: m.nctId,
          title: m.briefTitle,
          status: m.status.toLowerCase(),
          condition: m.conditions.map(c => ({ text: c })),
          sponsor: { display: m.sponsor },
          contact: [{ telecom: [{ system: 'email', value: m.contactEmail }, { system: 'phone', value: m.contactPhone }] }],
          description: m.keyInclusionSummary
        }
      }))
    };

    return {
      patientId: patient.id || 'p001',
      timestamp: new Date().toISOString(),
      searchCriteria: {
        primaryCondition: primaryCond,
        age,
        gender,
        radiusMiles: maxDistanceMiles
      },
      totalMatchesFound: scoredMatches.length,
      matches: scoredMatches,
      fhirResearchStudyBundle
    };
  }
}
