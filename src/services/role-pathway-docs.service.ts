import { Injectable, signal } from '@angular/core';

export type ClinicalRolePathway = 'clinician' | 'resident' | 'researcher' | 'executive' | 'patient';

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
  recommendedTools: { name: string; icon: string; tabId: string; purpose: string }[];
  quickActions: IPathwayQuickAction[];
  keyDocumentationHighlights: { heading: string; detail: string }[];
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
      regulatoryAndStandards: ['CPIC Levels A/B', 'ICD-10-CM / SNOMED-CT', 'CMS RPM CPT Codes', 'FDA 520(o) Compliant'],
      takeHomeSummary: 'Pocket-Gull acts as your defensive clinical co-pilot, surfacing stealth organ decay and drug-gene hazards while liberating you from manual EHR documentation.'
    },

    resident: {
      pathwayId: 'resident',
      roleTitle: 'Medical Student, Resident & Academic Fellow',
      targetAudience: 'Medical students, internal medicine/family medicine residents, and sub-specialty fellows.',
      icon: '🎓',
      tagline: 'Master diagnostic clinical reasoning, ace ACGME milestones, and generate 1-click Grand Rounds presentations.',
      toneAndDensity: 'Pedagogical, Socratic, biophysical mechanism-first, board-exam aligned.',
      primaryClinicalObjectives: [
        'Hone clinical diagnostic instincts through the Residency OSCE Simulator with automated ACGME milestone scoring.',
        'Compete in the Keju AI Exam Arena for high-yield USMLE Step 2/3 and internal medicine board case challenges.',
        'Export comprehensive 7-slide Grand Rounds presentation decks in 1 click for departmental conferences.',
        'Learn Socratic ruling-out strategies using Bayesian likelihood ratios rather than memorized heuristics.'
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
      regulatoryAndStandards: ['ACGME Milestones 2.0', 'CARE Guidelines', 'USMLE Step 2/3 Aligned', 'William Caslon Typographic Standards'],
      takeHomeSummary: 'Transform complex multi-morbidity cases into masterclass teaching moments and presentation-ready Grand Rounds decks in seconds.'
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
}
