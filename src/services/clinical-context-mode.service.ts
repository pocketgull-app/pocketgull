import { Injectable, signal, computed } from '@angular/core';

export type ClinicalPersonaMode = 
  | 'open_science'          // 🔬 Open Science & Research: ArXivLabs, Europe PMC, Local Gemma 3 Edge AI, Bio-ML, Cochrane RoB 2
  | 'clinical_scribe'       // 🩺 Clinical Scribe: Ambient Audio Diarization, Auto-SOAP Note, ICD-10/CPT Crosswalk, E/M MDM
  | 'clinical_specialist'   // 🩺 Attending Specialist (Legacy Alias)
  | 'maternal_doula'        // 👶 Maternal & Doula: 4th-Trimester ACOG Telemetry, EPDS Depression Screener, LATCH Lactation
  | 'patient_family'        // 🌿 Patient Sanctuary: Visual 3D Twin, Plain-Language Flip Cards, Courage Badges
  | 'school_safety'         // 🎒 School Nurse & Sub: 30-Sec EAP Cards, Emergency Meds
  | 'executive_governance'; // 🏛️ Steering Committee: FDA §520(o), SDoH Parity, ROI Audit

export type ComplexityLevel = 1 | 2 | 3; // 1 = Minimalist / Fast, 2 = Pro / Diagnostic, 3 = Deep Enterprise

export interface IPersonaConfig {
  id: ClinicalPersonaMode;
  label: string;
  badge: string;
  tagline: string;
  icon: string;
  accentColor: string;
  level1Views: string[];
  level2Views: string[];
  level3Views: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalContextModeService {
  /**
   * Current active clinical persona mode. Default to 'open_science' for research-first velocity.
   */
  readonly activeMode = signal<ClinicalPersonaMode>('open_science');

  /**
   * Complexity gating tier (1 = Minimalist, 2 = Pro, 3 = Deep Enterprise).
   */
  readonly complexityLevel = signal<ComplexityLevel>(2);

  readonly personaCatalog: Record<ClinicalPersonaMode, IPersonaConfig> = {
    open_science: {
      id: 'open_science',
      label: 'Open Science & Research',
      badge: 'ArXivLabs & Edge AI',
      tagline: 'Preprint discovery, 100% offline Gemma 3 WebGPU AI, non-coding variant models, and Cochrane RoB 2.',
      icon: '🔬',
      accentColor: 'purple',
      level1Views: ['arxiv_labs', 'preprints_hub'],
      level2Views: ['arxiv_labs', 'preprints_hub', 'local_gemma_studio', 'pgx_safety', 'citizen_science'],
      level3Views: ['arxiv_labs', 'preprints_hub', 'local_gemma_studio', 'pgx_safety', 'citizen_science', 'socratic_validator', 'academic_citations', 'graphql_explorer']
    },
    clinical_scribe: {
      id: 'clinical_scribe',
      label: 'Clinical Scribe & Attending M.D.',
      badge: 'Ambient SOAP & Billing',
      tagline: 'Ambient conversation diarization, automated SOAP charting, and ICD-10/CPT coding copilot.',
      icon: '🩺',
      accentColor: 'indigo',
      level1Views: ['ambient_scribe', 'soap_generator'],
      level2Views: ['ambient_scribe', 'soap_generator', 'coding_copilot', 'drug_interactions', 'sbar_handoff'],
      level3Views: ['ambient_scribe', 'soap_generator', 'coding_copilot', 'em_mdm_calculator', 'da_vinci_prior_auth', 'hcc_risk_scoring']
    },
    clinical_specialist: {
      id: 'clinical_specialist',
      label: 'Attending Clinician & Precision CDS',
      badge: 'Multi-Hop Diagnostics',
      tagline: 'Precision genomics, teledentistry SIBI cross-talk, Cochrane RoB 2, and GraphQL inspector.',
      icon: '🩺',
      accentColor: 'blue',
      level1Views: ['biophysical_twin', 'teledentistry_odontogram'],
      level2Views: ['biophysical_twin', 'teledentistry_odontogram', 'cochrane_trials'],
      level3Views: ['biophysical_twin', 'teledentistry_odontogram', 'cochrane_trials', 'graphql_explorer']
    },
    maternal_doula: {
      id: 'maternal_doula',
      label: 'Maternal Health & Doula Companion',
      badge: '4th-Trimester Telemetry',
      tagline: 'ACOG AIM preeclampsia monitoring, EPDS depression screening, and LATCH lactation support.',
      icon: '👶',
      accentColor: 'teal',
      level1Views: ['maternal_telemetry', 'crisis_safety_banner'],
      level2Views: ['maternal_telemetry', 'epds_screener', 'latch_lactation', 'circadian_sync'],
      level3Views: ['maternal_telemetry', 'epds_screener', 'latch_lactation', 'galactagogue_registry', 'fhir_maternal_bundle']
    },
    patient_family: {
      id: 'patient_family',
      label: 'Patient & Family Sanctuary',
      badge: 'Pediatric & Wellbeing',
      tagline: 'Calm visual anatomy, Grade 6.2 plain-language educational flip cards, and daily home care checklist.',
      icon: '🌿',
      accentColor: 'emerald',
      level1Views: ['biophysical_twin', 'patient_education_cards', 'courage_badges'],
      level2Views: ['biophysical_twin', 'patient_education_cards', 'daily_homecare_checklist', 'courage_badges'],
      level3Views: ['biophysical_twin', 'patient_education_cards', 'daily_homecare_checklist', 'ephemeral_data_purge', 'health_record_export']
    },
    school_safety: {
      id: 'school_safety',
      label: 'School Nurse & Substitute Station',
      badge: 'Section 504 & EAP',
      tagline: '30-second high-contrast classroom cards, emergency rescue meds, and nurse protocols.',
      icon: '🎒',
      accentColor: 'amber',
      level1Views: ['substitute_cards', 'emergency_protocols'],
      level2Views: ['substitute_cards', 'section_504_plan', 'emergency_protocols'],
      level3Views: ['substitute_cards', 'section_504_plan', 'emergency_protocols', 'school_nurse_dossier']
    },
    executive_governance: {
      id: 'executive_governance',
      label: 'AI Steering Committee & Governance',
      badge: 'FDA §520(o) & SDoH Equity',
      tagline: 'Algorithmic demographic parity, clinical burnout metrics, and zero-retention privacy audits.',
      icon: '🏛️',
      accentColor: 'blue',
      level1Views: ['governance_dossier'],
      level2Views: ['governance_dossier', 'sdoh_equity_matrix'],
      level3Views: ['governance_dossier', 'sdoh_equity_matrix', 'fda_compliance_tracker', 'mandiant_cyber_defense']
    }
  };

  /**
   * Returns metadata config for active mode.
   */
  readonly currentConfig = computed(() => this.personaCatalog[this.activeMode()]);

  /**
   * Returns list of allowed views for current role & complexity tier.
   */
  readonly visibleViews = computed(() => {
    const config = this.currentConfig();
    const level = this.complexityLevel();
    if (level === 1) return config.level1Views;
    if (level === 2) return config.level2Views;
    return config.level3Views;
  });

  constructor() {
    this.hydrateFromUrlParams();
  }

  /**
   * Hydrates persona and complexity level from browser URL parameters on initial load.
   */
  public hydrateFromUrlParams(): void {
    if (typeof window === 'undefined' || !window.location) return;

    try {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get('role') as ClinicalPersonaMode;
      const levelParam = parseInt(params.get('level') || '', 10) as ComplexityLevel;

      if (roleParam && this.personaCatalog[roleParam]) {
        this.activeMode.set(roleParam);
      }

      if (levelParam === 1 || levelParam === 2 || levelParam === 3) {
        this.complexityLevel.set(levelParam);
      }
    } catch {
      // Graceful fallback if URL parsing fails
    }
  }

  /**
   * Updates browser URL query parameters without reloading the page.
   */
  private syncToUrlParams(): void {
    if (typeof window === 'undefined' || !window.history || !window.location) return;

    try {
      const url = new URL(window.location.href);
      url.searchParams.set('role', this.activeMode());
      url.searchParams.set('level', this.complexityLevel().toString());
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Safe noop if history state mutation fails
    }
  }

  /**
   * Returns a shareable, deep-linked URL string for a specific role and complexity tier.
   */
  public getShareableRoleUrl(role: ClinicalPersonaMode = this.activeMode(), level: ComplexityLevel = this.complexityLevel()): string {
    if (typeof window === 'undefined' || !window.location) {
      return `https://pocketgull.app/?role=${role}&level=${level}`;
    }
    const origin = window.location.origin;
    return `${origin}/?role=${role}&level=${level}`;
  }

  /**
   * Sets the active persona mode and updates URL state.
   */
  setMode(mode: ClinicalPersonaMode): void {
    if (this.personaCatalog[mode]) {
      this.activeMode.set(mode);
      this.syncToUrlParams();
    }
  }

  /**
   * Sets the complexity gating level (1, 2, or 3) and updates URL state.
   */
  setComplexityLevel(level: ComplexityLevel): void {
    this.complexityLevel.set(level);
    this.syncToUrlParams();
  }

  /**
   * Checks whether a specific view should be rendered based on active persona & complexity gate.
   */
  isViewVisible(viewId: string): boolean {
    const views = this.visibleViews();
    return views.includes(viewId);
  }

  /**
   * Auto-infers persona mode from natural language directives.
   */
  inferModeFromSpeech(directive: string): ClinicalPersonaMode {
    const text = directive.toLowerCase();
    if (text.includes('arxiv') || text.includes('science') || text.includes('research') || text.includes('preprint') || text.includes('gemma') || text.includes('schmidt')) {
      return 'open_science';
    }
    if (text.includes('scribe') || text.includes('soap') || text.includes('coding') || text.includes('billing') || text.includes('cpt') || text.includes('icd')) {
      return 'clinical_scribe';
    }
    if (text.includes('maternal') || text.includes('postpartum') || text.includes('doula') || text.includes('epds') || text.includes('lactation') || text.includes('preeclampsia')) {
      return 'maternal_doula';
    }
    if (text.includes('school') || text.includes('substitute') || text.includes('504') || text.includes('nurse')) {
      return 'school_safety';
    }
    if (text.includes('governance') || text.includes('committee') || text.includes('fda') || text.includes('equity')) {
      return 'executive_governance';
    }
    return 'patient_family';
  }
}
