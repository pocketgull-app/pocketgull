import { Injectable, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { RolePathwayDocsService, ClinicalRolePathway } from './role-pathway-docs.service';
import { MOCK_PATIENTS } from '../mock-patients';

export interface IRoleDemoScenario {
  roleId: ClinicalRolePathway;
  roleTitle: string;
  roleIcon: string;
  scenarioName: string;
  patientId: string;
  patientName: string;
  chiefComplaint: string;
  highlightedModules: string[];
  initialActiveTab: string;
  clinicalNarrative: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleDemoLauncherService {
  private patientState?: PatientStateService | null;
  private docsService: RolePathwayDocsService;

  constructor(patientState?: PatientStateService | null, docsService?: RolePathwayDocsService | null) {
    this.patientState = patientState !== undefined ? patientState : inject(PatientStateService, { optional: true });
    this.docsService = docsService || (typeof inject === 'function' ? (inject(RolePathwayDocsService, { optional: true }) || new RolePathwayDocsService()) : new RolePathwayDocsService());
  }

  readonly scenarios: Record<ClinicalRolePathway, IRoleDemoScenario> = {
    clinician: {
      roleId: 'clinician',
      roleTitle: 'Attending Physician & Primary Care',
      roleIcon: '🏥',
      scenarioName: 'Refractory Hypertension & Stealth Renal Decay',
      patientId: 'p001',
      patientName: 'Homo Sapiens (Male, Metabolic Syndrome & Refractory HTN, 58y)',
      chiefComplaint: 'Morning BP spikes (148-152 mmHg), CYP2D6 Poor Metabolizer (*4/*4) safety alert, and eGFR decay (-24 mL/min/yr).',
      highlightedModules: ['RxGuard PGx', 'BioTrajectory Velocity', 'Ambient Clinical Scribe', 'DxRadar Conn Syndrome'],
      initialActiveTab: 'rxguard',
      clinicalNarrative: 'Step into an attending physician’s shift: review pharmacogenomic herb-drug contraindications, verify stealth eGFR loss, and auto-populate SOAP encounter notes.'
    },

    resident: {
      roleId: 'resident',
      roleTitle: 'Medical Student, Resident & Fellow',
      roleIcon: '🎓',
      scenarioName: 'POTS & Long COVID Autonomic Simulation',
      patientId: 'p002',
      patientName: 'Homo Sapiens (Female, Dysautonomia & Long COVID, 34y)',
      chiefComplaint: 'Post-exertional malaise, orthostatic tachycardia (HR 74 → 128 bpm), and ACGME competency evaluation.',
      highlightedModules: ['Residency OSCE Simulator', 'Grand Rounds 7-Slide Deck', 'Keju Board Arena', 'Socratic DxRadar'],
      initialActiveTab: 'osce',
      clinicalNarrative: 'Experience residency training: run an interactive OSCE clinical simulation, earn ACGME milestone credits, and export a 7-slide Grand Rounds presentation deck.'
    },

    researcher: {
      roleId: 'researcher',
      roleTitle: 'Clinical Researcher & Biostatistician',
      roleIcon: '🔬',
      scenarioName: 'Personalized 56-Day ABAB Crossover Trial',
      patientId: 'p001',
      patientName: 'Homo Sapiens (Male, Metabolic Syndrome, 58y)',
      chiefComplaint: 'Empirical Bayesian validation of SIBI anti-inflammatory diet vs standard care with 14-day washout intervals.',
      highlightedModules: ['N-of-1 Trial Engine', 'TrialFinder NIH Matcher', 'Bayesian Posteriors', 'FHIR ResearchStudy'],
      initialActiveTab: 'nof1',
      clinicalNarrative: 'Conduct translational clinical science: configure single-case crossover trials, calculate Cohen’s d effect sizes, and query active ClinicalTrials.gov protocols.'
    },

    executive: {
      roleId: 'executive',
      roleTitle: 'Hospital Executive & Chief Medical Officer',
      roleIcon: '🏛️',
      scenarioName: 'Enterprise Governance, Cybersecurity & FHIR CAPI',
      patientId: 'p001',
      patientName: 'Enterprise Hospital System (Epic & Cerner Fleet)',
      chiefComplaint: 'Zero-vulnerability cyber defense audit, 100% HIPAA Safe Harbor de-identification, and GAAP ASC 606 revenue recognition.',
      highlightedModules: ['Mandiant Cyber Defense', 'Global Compliance Matrix', 'SMART-on-FHIR CAPI', 'OpenSSF Scorecard'],
      initialActiveTab: 'mandiant',
      clinicalNarrative: 'Audit health system security: inspect Sentinel zero-leak egress logs, verify ONC Cures Act FHIR endpoints, and review economic ROI pro-forma models.'
    },

    patient: {
      roleId: 'patient',
      roleTitle: 'Patient, Family & Health Equity',
      roleIcon: '👤',
      scenarioName: 'Maternal 4th-Trimester & Home Telemetry Bridge',
      patientId: 'p007',
      patientName: 'Homo Sapiens (Female, Maternal Postpartum, 28y)',
      chiefComplaint: 'Postpartum blood pressure logging and 8th-grade health literacy guidance without downloading apps.',
      highlightedModules: ['SMS Compass Bridge', 'Plain-Language Analogies', 'Spanish Translations', 'Joy & Play Matrix'],
      initialActiveTab: 'sms',
      clinicalNarrative: 'Experience healthcare through the patient’s eyes: communicate with clinicians via everyday SMS text messages, and read medical concepts explained in plain English and Spanish.'
    }
  };

  /**
   * Activates a role-specific demo scenario across the whole application
   */
  public launchRoleDemo(roleId: ClinicalRolePathway): IRoleDemoScenario {
    const scenario = this.scenarios[roleId] || this.scenarios.clinician;
    
    // 1. Set the active role pathway
    this.docsService.setPathway(roleId);

    // 2. Set demo mode in state
    if (this.patientState) {
      this.patientState.isDemoMode.set(true);
      
      // Find matching mock patient
      const targetPatient = MOCK_PATIENTS.find(p => p.id === scenario.patientId) || MOCK_PATIENTS[0];
      if (targetPatient) {
        this.patientState.patientId.set(targetPatient.id);
        this.patientState.patientName.set(targetPatient.name);
        this.patientState.patientAge.set(targetPatient.age);
        this.patientState.patientGender.set(targetPatient.gender || 'Male');
        this.patientState.patientGoals.set(targetPatient.patientGoals || '');
        if (targetPatient.vitals) {
          this.patientState.vitals.set(targetPatient.vitals);
        }
        if (targetPatient.issues) {
          this.patientState.issues.set(targetPatient.issues);
        }
        if (targetPatient.history) {
          this.patientState.patientHistory.set(targetPatient.history as any);
        }
      }
    }

    return scenario;
  }

  public getScenarios(): IRoleDemoScenario[] {
    return Object.values(this.scenarios);
  }
}
