import { Injectable, signal, computed } from '@angular/core';

export type ClinicalPersonaMode = 
  | 'patient_family'        // Family & Pediatric: Calm, Paper Art, Courage Badges
  | 'school_safety'         // School Nurse & Sub: 30-Sec EAP Cards, Emergency Meds
  | 'clinical_specialist'   // Attending MD: Multi-Hop GraphQL, Teledentistry SIBI, Cochrane CDS
  | 'executive_governance'; // Steering Committee: FDA §520(o), SDoH Parity, ROI Audit

export interface IPersonaConfig {
  id: ClinicalPersonaMode;
  label: string;
  badge: string;
  tagline: string;
  icon: string;
  accentColor: string;
  defaultViews: string[];
  hiddenViews: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalContextModeService {
  /**
   * Current active clinical persona mode.
   */
  readonly activeMode = signal<ClinicalPersonaMode>('patient_family');

  readonly personaCatalog: Record<ClinicalPersonaMode, IPersonaConfig> = {
    patient_family: {
      id: 'patient_family',
      label: 'Patient & Family Sanctuary',
      badge: 'Pediatric & Wellbeing',
      tagline: 'Calm biophysical twin, soothing papercraft backdrops, and pediatric courage keepsakes.',
      icon: '🌿',
      accentColor: 'teal',
      defaultViews: ['biophysical_twin', 'courage_badges', 'intake_history'],
      hiddenViews: ['raw_fhir', 'governance_audit', 'hcc_coding_matrix']
    },
    school_safety: {
      id: 'school_safety',
      label: 'School Nurse & Substitute Station',
      badge: 'Section 504 & EAP',
      tagline: '30-second high-contrast classroom cards, emergency rescue meds, and nurse protocols.',
      icon: '🎒',
      accentColor: 'amber',
      defaultViews: ['substitute_cards', 'section_504_plan', 'emergency_protocols'],
      hiddenViews: ['raw_fhir', 'billing_dashboard', 'governance_audit']
    },
    clinical_specialist: {
      id: 'clinical_specialist',
      label: 'Attending Clinician & Precision CDS',
      badge: 'Multi-Hop Diagnostics',
      tagline: 'Precision genomics, teledentistry SIBI cross-talk, Cochrane RoB 2, and GraphQL inspector.',
      icon: '🩺',
      accentColor: 'blue',
      defaultViews: ['biophysical_twin', 'teledentistry_odontogram', 'cochrane_trials', 'graphql_explorer'],
      hiddenViews: ['courage_badges']
    },
    executive_governance: {
      id: 'executive_governance',
      label: 'AI Steering Committee & Governance',
      badge: 'FDA §520(o) & SDoH Equity',
      tagline: 'Algorithmic demographic parity, clinical burnout metrics, and zero-retention privacy audits.',
      icon: '🏛️',
      accentColor: 'purple',
      defaultViews: ['governance_dossier', 'sdoh_equity_matrix', 'fda_compliance_tracker'],
      hiddenViews: ['courage_badges', 'substitute_cards']
    }
  };

  /**
   * Returns metadata config for active mode.
   */
  readonly currentConfig = computed(() => this.personaCatalog[this.activeMode()]);

  /**
   * Sets the active persona mode.
   */
  setMode(mode: ClinicalPersonaMode): void {
    if (this.personaCatalog[mode]) {
      this.activeMode.set(mode);
    }
  }

  /**
   * Auto-infers persona mode from natural language directives.
   */
  inferModeFromSpeech(directive: string): ClinicalPersonaMode {
    const text = directive.toLowerCase();
    if (text.includes('school') || text.includes('substitute') || text.includes('504') || text.includes('classroom') || text.includes('nurse')) {
      return 'school_safety';
    }
    if (text.includes('governance') || text.includes('committee') || text.includes('fda') || text.includes('equity') || text.includes('admin') || text.includes('cmo')) {
      return 'executive_governance';
    }
    if (text.includes('doctor') || text.includes('clinician') || text.includes('specialist') || text.includes('graphql') || text.includes('teledentistry') || text.includes('cochrane')) {
      return 'clinical_specialist';
    }
    return 'patient_family';
  }
}
