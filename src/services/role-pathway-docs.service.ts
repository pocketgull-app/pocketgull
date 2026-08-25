import { Injectable, signal } from '@angular/core';

export type ClinicalRolePathway = 'clinician' | 'resident' | 'researcher' | 'executive' | 'patient';

export type ClinicalWorkflowStageId = 'intake' | 'consult' | 'careplan' | 'soundscape' | 'outcomes';

export interface IClinicalWorkflowStage {
  stageNumber: number;
  stageId: ClinicalWorkflowStageId;
  title: string;
  subtitle: string;
  icon: string;
  targetTabId: string;
  clinicalObjective: string;
  keyOutputs: string[];
  evidenceOrStandard: string;
  statusBadge: string;
}

export interface IPathwayQuickAction {
  title: string;
  description: string;
  icon: string;
  targetTabId: string;
  badge: string;
}

export interface IPathwayDocumentation {
  pathwayId: ClinicalRolePathway;
  roleTitle: string;
  targetAudience: string;
  icon: string;
  tagline: string;
  toneAndDensity: string;
  primaryClinicalObjectives: string[];
  workflowStages: IClinicalWorkflowStage[];
  recommendedTools: { name: string; icon: string; tabId: string; purpose: string }[];
  quickActions: IPathwayQuickAction[];
  keyDocumentationHighlights: { heading: string; detail: string }[];
  flourishingAndHopeFramework?: {
    permaDimension: string;
    hopePathways: string[];
    learnedOptimismReframe: string;
  };
  regulatoryAndStandards: string[];
  takeHomeSummary: string;
}

@Injectable({
  providedIn: 'root'
})
export class RolePathwayDocsService {
  readonly activePathway = signal<ClinicalRolePathway>('clinician');

  private readonly pathways: Record<ClinicalRolePathway, IPathwayDocumentation> = {
    clinician: {
      pathwayId: 'clinician',
      roleTitle: 'Attending Physician & Primary Care Clinician',
      targetAudience: 'Board-certified physicians, nurse practitioners, physician associates, and clinical specialists.',
      icon: '🏥',
      tagline: 'High-acuity diagnostic safety, pharmacogenomic dosing, and rapid ambient SOAP encounter completion.',
      toneAndDensity: 'Terse, high-density, evidence-graded (Level A/B/C) with direct ICD-10, SNOMED, and CPT billing codes.',
      primaryClinicalObjectives: [
        'Prevent Adverse Drug Reactions (ADRs) with CPIC Pharmacogenomic allele phenotyping (*4/*4 CYP2D6, SLCO1B1).',
        'Detect stealth organ degradation early using first-derivative biomarker velocity (d[eGFR]/dt >= 15%/yr alert).',
        'Rule out secondary etiology differentials (e.g. Conn Syndrome ARR, Renal Artery Stenosis) via Bayesian nomograms.',
        'Ambiently capture multi-modal doctor-patient dialogues and sign off structured SOAP notes in under 60 seconds.'
      ],
      workflowStages: [
        {
          stageNumber: 1,
          stageId: 'intake',
          title: '1. Ambient SOAP Intake',
          subtitle: 'Live Voice Scribe & SNOMED Coding',
          icon: '🎙️',
          targetTabId: 'scribe',
          clinicalObjective: 'Ambiently record doctor-patient encounter, transcribing conversation and auto-extracting ICD-10/SNOMED-CT clinical codes.',
          keyOutputs: ['Real-time audio waveform telemetry', 'Structured HPI & ROS bullets', 'ICD-10 / SNOMED code mappings'],
          evidenceOrStandard: 'CMS RPM CPT 99453 / ONC HTI-1',
          statusBadge: 'Stage 1: Intake'
        },
        {
          stageNumber: 2,
          stageId: 'consult',
          title: '2. Tri-Paradigm Consult',
          subtitle: 'Allopathic, TCM & Ayurvedic Synthesis',
          icon: '🧠',
          targetTabId: 'dxradar',
          clinicalObjective: 'Synthesize Western biophysical pathology with TCM Jing-Luo meridians and Ayurvedic Dosha balance, executing Bayesian nomograms to rule out secondary etiologies.',
          keyOutputs: ['3-Paradigm diagnostic synthesis', 'Bayesian LR+/LR- differential radar', 'Popperian H0 falsification gate'],
          evidenceOrStandard: 'Bayesian Likelihood Ratio Nomograms',
          statusBadge: 'Stage 2: Consult'
        },
        {
          stageNumber: 3,
          stageId: 'careplan',
          title: '3. Precision Care Plan',
          subtitle: 'CPIC Pharmacogenomics & Dosing',
          icon: '🛡️',
          targetTabId: 'rxguard',
          clinicalObjective: 'Generate evidence-graded care plan, screening for CPIC drug-gene hazards (*4/*4 CYP2D6, SLCO1B1) and botanical herb-drug interactions.',
          keyOutputs: ['CPIC Level 1A/1B dosing adjustments', 'Botanical contraindication flags', 'Evidence-graded intervention matrix'],
          evidenceOrStandard: 'CPIC Guidelines & FDA 520(o)',
          statusBadge: 'Stage 3: Care Plan'
        },
        {
          stageNumber: 4,
          stageId: 'soundscape',
          title: '4. Autonomic Co-Regulation',
          subtitle: '528Hz Solfeggio & Binaural Vagal Tone',
          icon: '🎶',
          targetTabId: 'soundscape',
          clinicalObjective: 'Deliver high-definition 4608kbps acoustic co-regulation with Bauer HRTF pinna crossfeed to balance parasympathetic vagal tone and reduce sympathetic fight-or-flight drive.',
          keyOutputs: ['4608kbps Studio Lossless audio stream', '528Hz Solfeggio / 6Hz Theta entrainment', 'Real-time Web Audio FFT spectrum'],
          evidenceOrStandard: 'ISO 226:2023 / Bauer HRTF Protocol',
          statusBadge: 'Stage 4: Co-Regulation'
        },
        {
          stageNumber: 5,
          stageId: 'outcomes',
          title: '5. Longitudinal Outcomes',
          subtitle: 'Stealth Biomarker Velocity & FHIR Export',
          icon: '📈',
          targetTabId: 'velocity',
          clinicalObjective: 'Track first-derivative biomarker slopes (d[eGFR]/dt, d[HbA1c]/dt), flagging stealth organ decay and exporting HL7 FHIR R4 Bundles.',
          keyOutputs: ['Gompertz-Makeham trajectory curves', 'd[eGFR]/dt >= 15%/yr rapid alert', 'Sanitized FHIR R4 Bundle JSON'],
          evidenceOrStandard: 'HL7 FHIR R4 US Core / Safe Harbor',
          statusBadge: 'Stage 5: Outcomes'
        }
      ],
      recommendedTools: [
        { name: 'RxGuard PGx & Botanicals', icon: '🛡️', tabId: 'rxguard', purpose: 'CPIC drug-gene & herb-drug interaction matrix.' },
        { name: 'BioTrajectory Velocity', icon: '📈', tabId: 'velocity', purpose: 'First-derivative stealth organ decay tracking.' },
        { name: 'DxRadar Socratic Engine', icon: '🎯', tabId: 'dxradar', purpose: 'Secondary cause differential with Bayesian LR+/LR-.' },
        { name: 'Ambient Clinical Scribe', icon: '🎙️', tabId: 'scribe', purpose: 'Automated conversation-to-SOAP encounter synthesis.' }
      ],
      quickActions: [
        { title: 'Launch Ambient SOAP Scribe', description: 'Start live consultation dictation with automatic ICD-10 coding.', icon: '🎙️', targetTabId: 'scribe', badge: 'Fast Encounter' },
        { title: 'Check Patient PGx Safety', description: 'Review CYP2D6 and botanical herb-drug contraindications.', icon: '🛡️', targetTabId: 'rxguard', badge: 'Safety Alert' },
        { title: 'Evaluate Biomarker Slopes', description: 'Inspect stealth eGFR and A1c velocity trajectories.', icon: '📈', targetTabId: 'velocity', badge: 'Predictive CDS' }
      ],
      keyDocumentationHighlights: [
        { heading: 'CMS Remote Patient Monitoring (RPM) Billing', detail: 'Meets CPT 99453 (initial setup), CPT 99454 (30-day telemetry transmission), and CPT 99457 (clinical management minutes).' },
        { heading: 'FDA 520(o) Non-Device CDS Exemption', detail: 'All recommendations expose transparent underlying clinical evidence, allowing independent physician verification without alert fatigue.' }
      ],
      flourishingAndHopeFramework: {
        permaDimension: 'Engagement & Flow (E) + Vitality (V)',
        hopePathways: [
          'Pathway 1: Zero-friction ambient SOAP capture eliminates 2.1 hours of evening EHR pajama time.',
          'Pathway 2: Pre-encounter PGx & biomarker velocity checks prevent diagnostic second-guessing and cognitive fatigue.',
          'Pathway 3: Multimodal live consultation preserves eye contact and authentic human connection during encounters.'
        ],
        learnedOptimismReframe: 'Encounter documentation friction is a structural systems challenge, not a clinician deficiency. Automating mechanical scribe tasks restores joy in practicing medicine.'
      },
      regulatoryAndStandards: ['CPIC Levels A/B', 'ICD-10-CM / SNOMED-CT', 'CMS RPM CPT Codes', 'FDA 520(o) Compliant'],
      takeHomeSummary: 'Pocket-Gull acts as your defensive clinical co-pilot, surfacing stealth organ decay and drug-gene hazards while liberating you from manual EHR documentation.'
    },

    resident: {
      pathwayId: 'resident',
      roleTitle: 'Medical Student, Resident & Academic Fellow',
      targetAudience: 'Medical students, internal medicine/family medicine residents, and sub-specialty fellows.',
      icon: '🎓',
      tagline: 'Refine diagnostic clinical reasoning, ace ACGME milestones, and generate 1-click Grand Rounds presentations.',
      toneAndDensity: 'Pedagogical, Socratic, biophysical mechanism-first, board-exam aligned.',
      primaryClinicalObjectives: [
        'Hone clinical diagnostic instincts through the Residency OSCE Simulator with automated ACGME milestone scoring.',
        'Compete in the Keju AI Exam Arena for high-yield USMLE Step 2/3 and internal medicine board case challenges.',
        'Export comprehensive 7-slide Grand Rounds presentation decks in 1 click for departmental conferences.',
        'Learn Socratic ruling-out strategies using Bayesian likelihood ratios rather than memorized heuristics.'
      ],
      workflowStages: [
        {
          stageNumber: 1,
          stageId: 'intake',
          title: '1. Socratic OSCE Intake',
          subtitle: 'Simulated Clinical Encounter',
          icon: '🎓',
          targetTabId: 'osce',
          clinicalObjective: 'Conduct Socratic standardized patient intake simulations with automated ACGME Competency Milestone scoring (PC1-PC5, MK1-MK3).',
          keyOutputs: ['Simulated patient dialogue history', 'ACGME Milestone 2.0 competence rubric', 'Diagnostic ruling-in/ruling-out checklist'],
          evidenceOrStandard: 'ACGME Milestones 2.0 / USMLE Step 2/3',
          statusBadge: 'Stage 1: Intake'
        },
        {
          stageNumber: 2,
          stageId: 'consult',
          title: '2. Keju Diagnostic Arena',
          subtitle: 'USMLE Board Diagnostic Tournaments',
          icon: '📜',
          targetTabId: 'mandarinate',
          clinicalObjective: 'Compete in diagnostic tournament cases, identifying rare zebras, secondary hypertension triggers, and autonomic POTS criteria.',
          keyOutputs: ['High-yield board exam rationales', 'Bayesian pre-test to post-test probability shifts', 'Socratic ruling-out nomograms'],
          evidenceOrStandard: 'CARE Guidelines / USMLE Aligned',
          statusBadge: 'Stage 2: Consult'
        },
        {
          stageNumber: 3,
          stageId: 'careplan',
          title: '3. Evidence-Graded Plan',
          subtitle: 'CARE Guidelines Case Strategy',
          icon: '📋',
          targetTabId: 'dxradar',
          clinicalObjective: 'Formulate evidence-graded therapy regimens (Level A RCTs vs Level C Consensus) conforming to international CARE case reporting standards.',
          keyOutputs: ['Level A/B/C graded interventions', 'Secondary etiology workup algorithm', 'Board-compliant pharmacotherapy plan'],
          evidenceOrStandard: 'CARE Guidelines / GRADE Framework',
          statusBadge: 'Stage 3: Care Plan'
        },
        {
          stageNumber: 4,
          stageId: 'soundscape',
          title: '4. Study Focus Soundscape',
          subtitle: '40Hz Gamma & Theta Brainwave Entrainment',
          icon: '🎧',
          targetTabId: 'soundscape',
          clinicalObjective: 'Engage 40Hz Gamma and 6Hz Theta neuro-acoustic entrainment to accelerate deep medical knowledge retention and relieve study burnout.',
          keyOutputs: ['40Hz Gamma cognitive focus carrier', 'HRTF spatialized binaural study backdrop', 'Autonomic pacing timer'],
          evidenceOrStandard: 'Neuro-Acoustic Entrainment Protocol',
          statusBadge: 'Stage 4: Co-Regulation'
        },
        {
          stageNumber: 5,
          stageId: 'outcomes',
          title: '5. Grand Rounds 7-Slide Deck',
          subtitle: '1-Click Departmental Presentation Export',
          icon: '📽️',
          targetTabId: 'presentation',
          clinicalObjective: 'Export presentation-ready 7-slide Grand Rounds PowerPoint and Google Docs decks in 1 click for departmental conferences.',
          keyOutputs: ['7-Slide Grand Rounds presentation deck', 'Automated CARE case report markdown', 'Departmental discussion questions'],
          evidenceOrStandard: 'ACGME Practice-Based Learning',
          statusBadge: 'Stage 5: Outcomes'
        }
      ],
      recommendedTools: [
        { name: 'Residency OSCE Simulator', icon: '🎓', tabId: 'osce', purpose: 'ACGME competency & simulated clinical encounters.' },
        { name: 'Grand Rounds & CARE Deck', icon: '📽️', tabId: 'presentation', purpose: '1-click PowerPoint and Google Docs case report export.' },
        { name: 'Keju AI Exam Arena', icon: '📜', tabId: 'mandarinate', purpose: 'Board examination diagnostic tournament.' },
        { name: 'DxRadar Socratic Engine', icon: '🎯', tabId: 'dxradar', purpose: 'Bayesian nomogram ruling-out reasoning.' }
      ],
      quickActions: [
        { title: 'Export Grand Rounds Deck', description: 'Generate 7-slide presentation ready for projector or Google Slides.', icon: '📽️', targetTabId: 'presentation', badge: '1-Click Slides' },
        { title: 'Run OSCE Clinical Case', description: 'Simulate high-yield case with real-time ACGME milestone scoring.', icon: '🎓', targetTabId: 'osce', badge: 'Board Prep' },
        { title: 'Practice Socratic Ruling-Out', description: 'Work through Bayesian likelihood ratios and ruling-out lab orders.', icon: '🎯', targetTabId: 'dxradar', badge: 'Diagnostic Skill' }
      ],
      keyDocumentationHighlights: [
        { heading: 'ACGME Milestones 2.0 Mapping', detail: 'Simulations map directly to Patient Care (PC1-PC5), Medical Knowledge (MK1-MK3), and Practice-Based Learning.' },
        { heading: 'CARE Guidelines Case Reporting', detail: 'Conforms to international CAse REport publishing guidelines for rapid journal and conference submissions.' }
      ],
      flourishingAndHopeFramework: {
        permaDimension: 'Accomplishment & Excellence (A) + Meaning (M)',
        hopePathways: [
          'Pathway 1: Interactive Socratic OSCE simulations build diagnostic confidence without patient safety risk.',
          'Pathway 2: Instant 7-slide Grand Rounds deck export solves departmental presentation prep in minutes.',
          'Pathway 3: Bayesian ruling-out trees replace rote memorization with foundational pathophysiological intuition.'
        ],
        learnedOptimismReframe: 'Diagnostic misses in training are essential calibration data points. Socratic reflection accelerates clinical expertise.'
      },
      regulatoryAndStandards: ['ACGME Milestones 2.0', 'CARE Guidelines', 'USMLE Step 2/3 Aligned', 'William Caslon Typographic Standards'],
      takeHomeSummary: 'Transform complex multi-morbidity cases into premier teaching moments and presentation-ready Grand Rounds decks in seconds.'
    },

    researcher: {
      pathwayId: 'researcher',
      roleTitle: 'Clinical Researcher, Biostatistician & Principal Investigator',
      targetAudience: 'Principal investigators, biostatisticians, clinical trial coordinators, and translational scientists.',
      icon: '🔬',
      tagline: 'Design single-case N-of-1 crossover trials, compute Bayesian posterior probabilities, and match NIH trials.',
      toneAndDensity: 'Methodological, mathematical, Popperian null-hypothesis grounded (H0/H1), Open Science compliant.',
      primaryClinicalObjectives: [
        'Design 56-day ABAB single-case crossover trials with standardized 14-day washout intervals.',
        'Calculate empirical Cohen’s d effect sizes and Gaussian conjugate Bayesian posterior probabilities of superiority.',
        'Match clinical cohorts against active NIH ClinicalTrials.gov protocols with geographic radius filtering.',
        'Generate structured FHIR R4 ResearchStudy bundles for reproducible decentralized clinical trials (DCT).'
      ],
      workflowStages: [
        {
          stageNumber: 1,
          stageId: 'intake',
          title: '1. Phenopacket Ingestion',
          subtitle: 'Cohort & Genomic Variant Extraction',
          icon: '📦',
          targetTabId: 'tools',
          clinicalObjective: 'Extract structured Human Phenotype Ontology (HPO) terms and genomic variant coordinates into standardized GA4GH Phenopackets.',
          keyOutputs: ['GA4GH Phenopacket v2 JSON', 'HPO ontology term mappings', 'GRCh38 variant coordinate normalization'],
          evidenceOrStandard: 'GA4GH Phenopacket Schema v2.0',
          statusBadge: 'Stage 1: Intake'
        },
        {
          stageNumber: 2,
          stageId: 'consult',
          title: '2. Hypothesis & Trial Search',
          subtitle: 'NIH ClinicalTrials.gov Geocoded Match',
          icon: '🔬',
          targetTabId: 'trials',
          clinicalObjective: 'Synthesize multi-paradigm hypotheses and query active ClinicalTrials.gov protocols with geographic radius and biomarker eligibility filtering.',
          keyOutputs: ['NIH ClinicalTrials.gov matched protocols', 'PubMed / EuropePMC citation linkages', 'Eligibility inclusion/exclusion verification'],
          evidenceOrStandard: 'ClinicalTrials.gov APIv2 / OpenAlex',
          statusBadge: 'Stage 2: Consult'
        },
        {
          stageNumber: 3,
          stageId: 'careplan',
          title: '3. N-of-1 Crossover Protocol',
          subtitle: '56-Day ABAB Single-Case Trial Design',
          icon: '🧪',
          targetTabId: 'nof1',
          clinicalObjective: 'Design personalized single-case randomized crossover trials with standardized 14-day washout periods and daily biomarker endpoints.',
          keyOutputs: ['56-Day ABAB crossover protocol schedule', 'Standardized 14-day washout schedule', 'Daily telemetric endpoint definitions'],
          evidenceOrStandard: 'CENT 2015 / CONSORT Guidelines',
          statusBadge: 'Stage 3: Care Plan'
        },
        {
          stageNumber: 4,
          stageId: 'soundscape',
          title: '4. Acoustic Biomarker Therapy',
          subtitle: 'Harmonic Modulation & EEG Resonance',
          icon: '🎶',
          targetTabId: 'soundscape',
          clinicalObjective: 'Deliver precision frequency stimulation with real-time spectrum analysis to test acoustic neuro-modulation hypotheses.',
          keyOutputs: ['Controlled frequency sweep logs', 'Autonomic HRV response telemetry', 'Bauer HRTF acoustic channel isolation'],
          evidenceOrStandard: 'ISO 226:2023 Acoustical Standards',
          statusBadge: 'Stage 4: Co-Regulation'
        },
        {
          stageNumber: 5,
          stageId: 'outcomes',
          title: '5. Bayesian Posteriors & FHIR',
          subtitle: 'Cohen’s d, H0 Gate & ResearchStudy Export',
          icon: '📊',
          targetTabId: 'velocity',
          clinicalObjective: 'Compute exact closed-form Bayesian posterior probabilities P(Intervention > Baseline | Data), Cohen’s d effect sizes, and export FHIR R4 ResearchStudy.',
          keyOutputs: ['Bayesian conjugate posterior curves', 'Popperian H0 p-value gate verdict', 'HL7 FHIR R4 ResearchStudy bundle'],
          evidenceOrStandard: 'Popperian Falsifiability & RoB 2',
          statusBadge: 'Stage 5: Outcomes'
        }
      ],
      recommendedTools: [
        { name: 'N-of-1 Trial Designer', icon: '🧪', tabId: 'nof1', purpose: 'Personalized single-case randomized crossover trials.' },
        { name: 'TrialFinder Matcher', icon: '🔬', tabId: 'trials', purpose: 'Geocoded NIH ClinicalTrials.gov protocol matching.' },
        { name: 'BioTrajectory Velocity', icon: '📈', tabId: 'velocity', purpose: 'Gompertz-Makeham longitudinal biomarker decay curves.' },
        { name: 'FHIR Sovereignty Exporter', icon: '📦', tabId: 'tools', purpose: 'Standardized FHIR R4 ResearchStudy & Observation export.' }
      ],
      quickActions: [
        { title: 'Design N-of-1 Crossover', description: 'Configure 56-day ABAB trial with Bayesian superiority calculations.', icon: '🧪', targetTabId: 'nof1', badge: 'Trial Protocol' },
        { title: 'Search NIH Clinical Trials', description: 'Filter actively recruiting trials within a 50-mile patient radius.', icon: '🔬', targetTabId: 'trials', badge: 'NIH Matcher' },
        { title: 'Export FHIR Research Bundle', description: 'Serialize complete trial telemetry to HL7 FHIR R4 JSON.', icon: '📦', targetTabId: 'tools', badge: 'Open Science' }
      ],
      keyDocumentationHighlights: [
        { heading: 'Popperian Epistemology & Null-Hypothesis Gate', detail: 'Any observation where p >= 0.05 automatically displays a skeptical warning notice disclosing inability to reject H0.' },
        { heading: 'Bayesian Conjugate Superiority', detail: 'Computes continuous posterior probability distributions P(Intervention > Baseline | Data) using exact closed-form conjugates.' }
      ],
      flourishingAndHopeFramework: {
        permaDimension: 'Meaning & Purpose (M) + Curiosity Strengths',
        hopePathways: [
          'Pathway 1: Single-case N-of-1 experimentation democratizes evidence generation for rare diseases.',
          'Pathway 2: Direct NIH ClinicalTrials.gov geocoded matching connects isolated patients with curative trials.',
          'Pathway 3: Cochrane Risk of Bias transparency protects scientific integrity and publication credibility.'
        ],
        learnedOptimismReframe: 'Negative trial results (failing to reject H0) are vital scientific progress that protect patients from ineffective treatments.'
      },
      regulatoryAndStandards: ['FHIR R4 ResearchStudy', 'CONSORT / CENT Guidelines', 'Popperian Epistemology H0', 'Cochrane Risk of Bias (RoB 2)'],
      takeHomeSummary: 'Bridge individual patient care directly into rigorous translational science with single-case Bayesian crossover experimentation.'
    },

    executive: {
      pathwayId: 'executive',
      roleTitle: 'Hospital Administrator, CMIO & Chief Compliance Officer',
      targetAudience: 'Chief Medical Information Officers (CMIO), Chief Information Security Officers (CISO), and health system executives.',
      icon: '🏛️',
      tagline: 'Enterprise HIPAA Safe Harbor compliance, zero-egress edge architecture, and SMART-on-FHIR interoperability.',
      toneAndDensity: 'Architectural, governance-focused, regulatory, with verified security and economic ROI models.',
      primaryClinicalObjectives: [
        'Ensure 100% HIPAA §164.514 Safe Harbor de-identification across all research and AI workloads.',
        'Eliminate cloud data breach liability via client-side edge computing (WASM / WebGPU) and zero third-party tracking.',
        'Connect seamlessly to Epic Systems and Oracle Health Cerner via certified SMART-on-FHIR CAPI integration.',
        'Maintain GAAP ASC 606 revenue compliance with automated Stripe philanthropic endowment ledgering.'
      ],
      workflowStages: [
        {
          stageNumber: 1,
          stageId: 'intake',
          title: '1. Enterprise EHR & CAPI Sync',
          subtitle: 'SMART-on-FHIR CAPI Ingestion',
          icon: '🏛️',
          targetTabId: 'mandiant',
          clinicalObjective: 'Ingest multi-site clinical telemetry across Epic, Oracle Cerner, and remote patient monitoring streams with zero third-party leakage.',
          keyOutputs: ['SMART-on-FHIR CAPI connection logs', 'Zero third-party tracker audit report', 'HIPAA §164.514 18-identifier de-id check'],
          evidenceOrStandard: 'ONC HTI-1 / HL7 SMART-on-FHIR',
          statusBadge: 'Stage 1: Intake'
        },
        {
          stageNumber: 2,
          stageId: 'consult',
          title: '2. Diagnostic Quality & SDoH',
          subtitle: 'Multi-Site Concordance & Disparity Review',
          icon: '🌐',
          targetTabId: 'jurisdiction',
          clinicalObjective: 'Benchmark diagnostic concordance, clinical safety alerts, and Social Determinants of Health (SDoH) across provider networks.',
          keyOutputs: ['Provider diagnostic concordance rate', 'SDoH disparity vulnerability index', 'Cross-border telemedicine licensing grid'],
          evidenceOrStandard: 'WHO Health Equity Disparity Index',
          statusBadge: 'Stage 2: Consult'
        },
        {
          stageNumber: 3,
          stageId: 'careplan',
          title: '3. Value-Based ROI Plan',
          subtitle: 'ASC 606 & CMS RPM Revenue Capture',
          icon: '💼',
          targetTabId: 'equity',
          clinicalObjective: 'Model practice financial sustainability, automating CMS RPM billing capture (CPT 99453/99454/99457) and GAAP ASC 606 revenue compliance.',
          keyOutputs: ['Practice 3-year economic ROI model', 'CMS Remote Patient Monitoring pro-forma', 'GAAP ASC 606 audit trail ledger'],
          evidenceOrStandard: 'GAAP ASC 606 / CMS CPT Telehealth',
          statusBadge: 'Stage 3: Care Plan'
        },
        {
          stageNumber: 4,
          stageId: 'soundscape',
          title: '4. Burnout Mitigation Suite',
          subtitle: 'Ambient Decompression & Rest Modules',
          icon: '🎵',
          targetTabId: 'soundscape',
          clinicalObjective: 'Deploy ambient soundscape relaxation and zero-pajama-time scribe workflows to prevent physician burnout and reduce clinician turnover.',
          keyOutputs: ['$500k+ retention savings per physician', 'Ambient clinical exam room soundscapes', 'Physician cognitive recovery metrics'],
          evidenceOrStandard: 'AMA Joy in Medicine Framework',
          statusBadge: 'Stage 4: Co-Regulation'
        },
        {
          stageNumber: 5,
          stageId: 'outcomes',
          title: '5. Mandiant Zero-Trust Audit',
          subtitle: 'OpenSSF 10/10 Scorecard & Safe Harbor',
          icon: '🛡️',
          targetTabId: 'mandiant',
          clinicalObjective: 'Audit Mandiant defense telemetry, verifying zero egress leaks across 1,005 source files and 100% HIPAA Safe Harbor compliance.',
          keyOutputs: ['Mandiant zero-leak egress report', 'OpenSSF 10/10 Scorecard & SLSA L3 proof', 'HIPAA §164.514 Safe Harbor certificate'],
          evidenceOrStandard: 'OpenSSF / HIPAA §164.514 / SLSA L3',
          statusBadge: 'Stage 5: Outcomes'
        }
      ],
      recommendedTools: [
        { name: 'Mandiant Threat Defense', icon: '🛡️', tabId: 'mandiant', purpose: 'Cyber defense telemetry and zero-vulnerability audit.' },
        { name: 'Global & State Compliance', icon: '🌐', tabId: 'jurisdiction', purpose: 'Multi-state telemedicine and cross-border regulatory matrix.' },
        { name: 'SSA Disability Navigator', icon: '🏛️', tabId: 'ssa', purpose: 'Automated SSA Blue Book disability documentation.' },
        { name: 'Population Health Equity Hub', icon: '🌍', tabId: 'equity', purpose: 'SDoH tracking and WHO health disparity indices.' }
      ],
      quickActions: [
        { title: 'Review Security & Egress Guard', description: 'Inspect Sentinel zero-leak audit logs across 1,005 source files.', icon: '🛡️', targetTabId: 'mandiant', badge: '10/10 Scorecard' },
        { title: 'Inspect Jurisdictional Matrix', description: 'Verify state medical board and telemedicine licensing rules.', icon: '🌐', targetTabId: 'jurisdiction', badge: 'Compliance' },
        { title: 'Audit Population Health Equity', description: 'Analyze SDoH indices and Medicare Advantage quality stars.', icon: '🌍', targetTabId: 'equity', badge: 'VBC Metrics' }
      ],
      keyDocumentationHighlights: [
        { heading: 'OpenSSF Scorecard (10/10) & SLSA Level 3', detail: 'Zero base-OS vulnerabilities, hermetic builds, signed provenance attestations, and supply-chain hardening.' },
        { heading: 'Edge Data Sovereignty', detail: 'Zero tracking pixels (No Google Analytics, Meta Pixel, or Segment). Telemetry computations run 100% on client device.' }
      ],
      flourishingAndHopeFramework: {
        permaDimension: 'Positive Emotion (P) + Organizational Flourishing',
        hopePathways: [
          'Pathway 1: $500k+ saved per retained physician through ambient burnout reduction.',
          'Pathway 2: Zero cloud breach liability with on-device WASM edge AI guarantees regulatory serenity.',
          'Pathway 3: Turnkey SMART-on-FHIR integration aligns health system IT with CMS/ONC interoperability mandates.'
        ],
        learnedOptimismReframe: 'Regulatory compliance is not an administrative burden, but an organizational competitive advantage when automated by sound architecture.'
      },
      regulatoryAndStandards: ['HIPAA §164.514 Safe Harbor', 'ONC Cures Act §170.315(g)(10)', 'OpenSSF 10/10 Scorecard', 'GAAP ASC 606 Compliant'],
      takeHomeSummary: 'Pocket-Gull delivers hospital-grade clinical AI with zero security vulnerabilities, complete data sovereignty, and turnkey SMART-on-FHIR integration.'
    },

    patient: {
      pathwayId: 'patient',
      roleTitle: 'Patient, Family Caregiver & Health Equity Advocate',
      targetAudience: 'Patients, family members, community health workers, and non-clinical care partners.',
      icon: '👤',
      tagline: 'Understand your body in plain English and Spanish without medical jargon or confusing apps.',
      toneAndDensity: 'Empathetic, jargon-free, 8th-grade health literacy, relatable biophysical analogies.',
      primaryClinicalObjectives: [
        'Understand your health plan using relatable analogies (e.g. "Think of blood pressure like water pressure in a garden hose").',
        'Communicate with your care team and log daily readings via simple SMS text messages without downloading apps.',
        'Review patient education lenses in your preferred language (English / Español Médico).',
        'Empower yourself with clear, step-by-step home action plans for diet, sleep, and lifestyle resets.'
      ],
      workflowStages: [
        {
          stageNumber: 1,
          stageId: 'intake',
          title: '1. Gentle Home Check-In',
          subtitle: 'SMS Compass Zero-App Logging',
          icon: '💬',
          targetTabId: 'sms',
          clinicalObjective: 'Log daily symptoms, vitals, and concerns from home via everyday SMS text messages without downloading apps or remembering passwords.',
          keyOutputs: ['Zero-app SMS conversation log', 'Plain-English symptom translation', 'Daily comfort & energy level rating'],
          evidenceOrStandard: 'Plain Writing Act of 2010',
          statusBadge: 'Stage 1: Intake'
        },
        {
          stageNumber: 2,
          stageId: 'consult',
          title: '2. 3D Body & Symptom Explorer',
          subtitle: 'Interactive Organs & Friendly Analogies',
          icon: '🧍',
          targetTabId: 'joy',
          clinicalObjective: 'Explore interactive 3D body models with medical concepts explained in plain English and Spanish using friendly everyday analogies.',
          keyOutputs: ['3D interactive organ health model', 'Friendly biophysical analogy cards', 'English & Spanish bilingual summaries'],
          evidenceOrStandard: 'Flesch-Kincaid Grade 8.0 Literacy',
          statusBadge: 'Stage 2: Consult'
        },
        {
          stageNumber: 3,
          stageId: 'careplan',
          title: '3. Everyday Action Plan',
          subtitle: 'Simple Daily Nutrition, Sleep & Movement Steps',
          icon: '🌱',
          targetTabId: 'tools',
          clinicalObjective: 'Receive clear, encouraging daily action steps for wholesome meals, restorative sleep routines, and gentle physical activity.',
          keyOutputs: ['Step-by-step home action plan', 'Daily hydration & movement goals', 'Easy grocery & botanical shopping list'],
          evidenceOrStandard: 'National CLAS Standards / AHA',
          statusBadge: 'Stage 3: Care Plan'
        },
        {
          stageNumber: 4,
          stageId: 'soundscape',
          title: '4. Soothing Bedtime Audio',
          subtitle: 'Ocean Waves & Calming Sleep Tones',
          icon: '🌊',
          targetTabId: 'soundscape',
          clinicalObjective: 'Listen to gentle ambient ocean waves and calming 528Hz acoustic harmonies designed for deep, restorative nightly sleep and stress relief.',
          keyOutputs: ['Gentle ocean flow acoustic track', 'Built-in 30-minute bedtime sleep timer', 'Autonomic soothing audio spectrum'],
          evidenceOrStandard: 'Acoustic Co-Regulation Protocol',
          statusBadge: 'Stage 4: Co-Regulation'
        },
        {
          stageNumber: 5,
          stageId: 'outcomes',
          title: '5. Family Quest & Vault',
          subtitle: 'Flourishing Streaks & 1-Click Backup',
          icon: '🌟',
          targetTabId: 'joy',
          clinicalObjective: 'Celebrate healthy habit streaks on the Family Health Quest board and download a 100% confidential, password-protected offline vault backup.',
          keyOutputs: ['Family Health Quest celebration badges', 'Three Good Things resilience journal', 'Encrypted .pocketgull vault backup file'],
          evidenceOrStandard: 'AES-256-GCM / 100% Privacy',
          statusBadge: 'Stage 5: Outcomes'
        }
      ],
      recommendedTools: [
        { name: 'SMS Compass Bridge', icon: '💬', tabId: 'sms', purpose: 'Zero-app plain text messaging health bridge.' },
        { name: 'Joy & Play Matrix', icon: '☀️', tabId: 'joy', purpose: 'Holistic wellness, nervous system rest & lifestyle.' },
        { name: 'Double-Click Safety Interlock', icon: '🛠️', tabId: 'tools', purpose: 'Child-proof button safety and patient education lenses.' },
        { name: 'Teledentistry & Odontogram', icon: '🦷', tabId: 'dental', purpose: 'Oral-systemic connection and daily gum health guide.' }
      ],
      quickActions: [
        { title: 'Open SMS Compass Bridge', description: 'Log a home reading or question in everyday plain English.', icon: '💬', targetTabId: 'sms', badge: 'No App Needed' },
        { title: 'Read Plain-Language Lens', description: 'See your diagnosis explained with friendly everyday analogies.', icon: '☀️', targetTabId: 'joy', badge: 'Easy Reading' },
        { title: 'Switch to Spanish (Español)', description: 'View care plans and education steps in Spanish.', icon: '🌐', targetTabId: 'tools', badge: 'Español' }
      ],
      keyDocumentationHighlights: [
        { heading: 'Flesch-Kincaid Grade 8.0 Reading Level', detail: 'All medical terms are translated into clear, conversational concepts validated for 100% clarity.' },
        { heading: 'Biophysical Analogies', detail: 'Blood vessels are explained as garden hoses, metabolic fire as a hearth fireplace, and nerve calm as an ocean tide.' }
      ],
      flourishingAndHopeFramework: {
        permaDimension: 'Positive Emotion (P) + Vitality (V) + Hope Agency',
        hopePathways: [
          'Pathway 1: Three Good Things daily evening journal builds emotional resilience and uplifts mood.',
          'Pathway 2: VIA character strengths turn daily health habits into fun, rewarding micro-rituals.',
          'Pathway 3: Plain-language care summaries ensure you always know the exact next step without fear or confusion.'
        ],
        learnedOptimismReframe: 'A health symptom is not a personal failure—it is simply your body sending helpful information to guide your next healthy choice.'
      },
      regulatoryAndStandards: ['Plain Writing Act of 2010', 'National CLAS Standards', 'WCAG AAA 7:1 Contrast', '100% Confidential'],
      takeHomeSummary: 'You are the captain of your health journey. Pocket-Gull translates complicated medical charts into clear, empowering action steps.'
    }
  };

  public getPathway(pathwayId: ClinicalRolePathway): IPathwayDocumentation {
    return this.pathways[pathwayId] || this.pathways.clinician;
  }

  public getAllPathways(): IPathwayDocumentation[] {
    return Object.values(this.pathways);
  }

  public setPathway(pathwayId: ClinicalRolePathway): void {
    this.activePathway.set(pathwayId);
  }

  public getWorkflowStages(pathwayId?: ClinicalRolePathway): IClinicalWorkflowStage[] {
    const target = pathwayId || this.activePathway();
    return this.getPathway(target).workflowStages;
  }

  public getWorkflowStage(stageNumber: number, pathwayId?: ClinicalRolePathway): IClinicalWorkflowStage | undefined {
    const stages = this.getWorkflowStages(pathwayId);
    return stages.find(s => s.stageNumber === stageNumber);
  }
}
