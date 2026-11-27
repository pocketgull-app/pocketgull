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
    },
    {
      nctId: 'NCT06210944',
      briefTitle: 'Non-Opioid Selective NaV1.8 & Mirror Graded Motor Imagery Pain Trial',
      officialTitle: 'Phase 3 NIH HEAL Initiative Trial Evaluating Peripheral NaV1.8 Blockade with Somatic Mirror Retraining for Neuropathic & Opioid-Sparing Pain Relief',
      phase: 'Phase 3',
      status: 'RECRUITING',
      conditions: ['Neuropathic Pain', 'Central Sensitization', 'Chronic Lower Back Pain', 'Phantom Limb Pain', 'Allodynia'],
      interventions: ['Suzetrigine (VX-548) Non-Opioid NaV1.8 Inhibitor + Graded Motor Imagery'],
      sponsor: 'NIH Helping to End Addiction Long-term (HEAL) Network',
      distanceMiles: 11.4,
      matchConfidenceScore: 95,
      keyInclusionSummary: 'Adults age 18-80y with chronic neuropathic or musculoskeletal pain (DN4 >= 4 or VAS >= 5), opioid-sparing rehabilitation priority.',
      keyExclusionSummary: 'Known severe hepatic CYP3A4 failure or unstable acute spinal cord transection.',
      contactEmail: 'nih-heal-pain@nih.gov',
      contactPhone: '+1 (800) 555-0162',
      locationFacility: 'Center for Translational Pain & Neuromodulation'
    },
    {
      nctId: 'NCT06187420',
      briefTitle: 'HLA-DRB1 / MTHFR Pharmacogenomic Remyelination & Fatigue Protocol',
      officialTitle: 'Phase 2 Biomarker-Guided Trial of Clemastine Fumarate, L-Methylfolate, and CoQ10 in CYP2D6/MTHFR Stratified Multiple Sclerosis',
      phase: 'Phase 2',
      status: 'RECRUITING',
      conditions: ['Multiple Sclerosis', 'Neurological & Methylation', 'MTHFR Deficiency', 'Demyelinating Neuropathy'],
      interventions: ['L-Methylfolate + Clemastine Fumarate + Ubiquinol CoQ10 Precision Titration'],
      sponsor: 'National Institute of Neurological Disorders and Stroke (NINDS)',
      distanceMiles: 16.0,
      matchConfidenceScore: 94,
      keyInclusionSummary: 'Confirmed HLA-DRB1*15:01 or MTHFR C677T variant, homocysteine > 12 umol/L, neuropathic fatigue or sensory paresthesia.',
      keyExclusionSummary: 'Concurrent strong anticholinergic burden or pregnancy.',
      contactEmail: 'ninds-remyelination@nih.gov',
      contactPhone: '+1 (800) 555-0155',
      locationFacility: 'Neuroimmunology & Pharmacogenomics Unit'
    },
    {
      nctId: 'NCT05992014',
      briefTitle: 'Wildfire PM2.5 Exposome Shielding & Airway Biologic De-Escalation',
      officialTitle: 'Phase 3 Randomized Pragmatic Study of Biologic IL-4Ralpha Blockade Plus Indoor HEPA Mitigation in Environmental Eosinophilic Asthma',
      phase: 'Phase 3',
      status: 'RECRUITING',
      conditions: ['Asthma', 'Bronchial Hyperreactivity', 'Environmental Exposomics', 'Wildfire Smoke Exposure'],
      interventions: ['Dupilumab 300mg Q2W + Smart Indoor PM2.5 Closed-Loop HEPA'],
      sponsor: 'National Institute of Environmental Health Sciences (NIEHS)',
      distanceMiles: 19.3,
      matchConfidenceScore: 92,
      keyInclusionSummary: 'Age 18-75y with persistent asthma or post-PM2.5 airway hyperreactivity and elevated eosinophils or FeNO >= 25 ppb.',
      keyExclusionSummary: 'Untreated systemic helminth infection.',
      contactEmail: 'niehs-airway-shield@nih.gov',
      contactPhone: '+1 (800) 555-0131',
      locationFacility: 'Pulmonary & Environmental Exposomics Pavilion'
    },
    {
      nctId: 'NCT06077315',
      briefTitle: 'Non-Invasive Cervical Radiculopathy Decompression & Fascial Mechanobiology',
      officialTitle: 'Phase 2 Randomized Controlled Study of Ergonomic Traction Decompression and 40Hz Vibro-Tactile Pain Desensitization in Radiculopathy',
      phase: 'Phase 2',
      status: 'RECRUITING',
      conditions: ['Cervical Radiculopathy', 'Spinal Biomechanics', 'Osteoarthritis', 'Radicular Pain'],
      interventions: ['Decompression Physiotherapy + 40Hz Somatosensory Pain Gate Entrainment'],
      sponsor: 'National Institute of Arthritis and Musculoskeletal and Skin Diseases (NIAMS)',
      distanceMiles: 12.8,
      matchConfidenceScore: 90,
      keyInclusionSummary: 'Adults with cervical or lumbar nerve root compression, dermatomal pain/paresthesia, or refractory joint stiffness.',
      keyExclusionSummary: 'Cauda equina syndrome or progressive acute myelopathy requiring emergency surgery.',
      contactEmail: 'niams-biomechanics@nih.gov',
      contactPhone: '+1 (800) 555-0124',
      locationFacility: 'Spine Biomechanics & Rehabilitation Laboratory'
    }
  ];

  /**
   * Matches candidate clinical trials for a patient across conditions, active symptoms, body-part issues, and goals
   */
  public matchTrialsForPatient(patient: IPatient, maxDistanceMiles = 50): ITrialMatcherReport {
    const age = patient.age || 50;
    const gender = patient.gender || 'Male';
    const conditionText = (patient.preexistingConditions || []).join(' ').toLowerCase();
    const symptomText = (patient.symptoms || []).map(s => s.name || '').join(' ').toLowerCase();
    const flatIssues = Object.values(patient.issues || {}).flat();
    const issueText = flatIssues
      .map(issue => {
        const subSymptoms = (issue.symptoms || [])
          .map(s => (typeof s === 'string' ? s : s.name || ''))
          .join(' ');
        return `${issue.name || ''} ${issue.description || ''} ${subSymptoms}`;
      })
      .join(' ')
      .toLowerCase();
    const clinicalCorpus = `${conditionText} ${symptomText} ${issueText} ${(patient.patientGoals || '').toLowerCase()} ${(patient.name || '').toLowerCase()}`;

    // Filter and score matches
    const scoredMatches = this.CLINICAL_TRIALS_CATALOG.filter(trial => {
      return trial.distanceMiles <= maxDistanceMiles;
    }).map(trial => {
      let score = 70;

      // Exact/phrase match against condition catalog and symptom/pain corpus
      const matchedConditions = trial.conditions.filter(c => {
        const cLower = c.toLowerCase();
        const keywords = cLower.split(/[\s/,&-]+/).filter(w => w.length >= 4);
        return clinicalCorpus.includes(cLower) || keywords.some(kw => clinicalCorpus.includes(kw));
      });

      if (matchedConditions.length > 0) {
        score += 18 + Math.min(8, matchedConditions.length * 3);
      }

      // Bonus for explicit pain / neurological distress alignment when pain burden is present
      const hasHighPainIssue = flatIssues.some(i => (i.painLevel || 0) >= 6);
      if (hasHighPainIssue && trial.conditions.some(c => c.toLowerCase().includes('pain'))) {
        score += 6;
      }

      // Age eligibility heuristic
      if (age >= 18 && age <= 85) score += 4;

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
