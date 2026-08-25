import { Injectable, signal, computed, inject } from '@angular/core';
import { ThemeService } from './theme.service';
import { PatientStateService } from './patient-state.service';
import { SecureStorageService } from './secure-storage.service';

export interface ITourStep {
  targetId: string;
  title: string;
  body: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_SEEN_KEY = 'pg_tour_seen';

@Injectable({ providedIn: 'root' })
export class WalkthroughTourService {
  private theme = inject(ThemeService);
  private state = inject(PatientStateService);
  private storage = inject(SecureStorageService);

  /** -1 = inactive, 0..N = active step index */
  currentStep = signal<number>(-1);
  isActive = computed(() => this.currentStep() >= 0);

  steps = computed<ITourStep[]>(() => {
    const isSpark = this.theme.currentTheme() === 'spark';
    const list: ITourStep[] = [
      {
        targetId: 'tour-patient-dropdown',
        title: 'Step 1: Patient Chart & Sentinel Triage Selection',
        body: 'Begin the clinical loop by selecting a patient profile. Patients flagged for outbreak or epidemiological threats (Sentinels) feature high-priority amber tags, demographic twin baselines, and containment protocols.',
        position: 'bottom',
      },
      {
        targetId: 'tour-body-chart',
        title: 'Step 2: 3D Anatomical & Raycast Loci Symptom Isolation',
        body: 'Investigate the procedural Three.js 3D anatomical model (Skin, Muscle, Bone, Visceral Organs, Dermatomes). Tapping an organ interpolates camera focus, displays raycast tooltips, and filters metabolic CMP lab panels.',
        position: 'right',
      },
      {
        targetId: 'tour-generate-btn',
        title: 'Step 3: One-Tap Gemini 3.5 & 3.6 Multi-Lens Synthesis',
        body: 'Click "Refresh Analysis". Google Gemini 3.5 & 3.6 Flash stream real-time evidence-grounded directives with Thought Signature Circulation across Western, TCM Zang-Fu, and Ayurvedic paradigms.',
        position: 'bottom',
      },
      {
        targetId: 'tour-lens-tabs',
        title: 'Step 4: Explore 11 Specialized Clinical Lenses',
        body: 'Navigate through Overview, Treatment Matrix, Functional Protocols, Nutrition, Precision Nutrients, Follow-up, Patient Education, Assessments, Maternal, Longevity, and CMS RPM Billing Audit lenses.',
        position: 'bottom',
      },
      {
        targetId: 'tour-report-node',
        title: 'Step 5: 4-Level Progressive Disclosure & Level 4 Context Actions',
        body: 'Single-click cards for details; double-click/tap to cycle state; right-click or long-press for Level 4 Clinical Context Actions (FHIR R4 Export, Gemini Consult, CMS 837P Exporter, Pin Telemetry, Attach Note).',
        position: 'left',
      },
      {
        targetId: 'tour-voice-agent-window',
        title: 'Step 6: Live Avian Agent Consult & Multimodal Streaming',
        body: 'The Avian Voice Consult panel is active. Interact with `@google/adk` personas like Gulliver (🔭) or Swoop (⚡) using full-duplex WebSocket audio streams and instant client-side barge-in.',
        position: 'left',
      },
      {
        targetId: 'tour-research-frame-window',
        title: 'Step 7: Literature Research & Open Science Hub',
        body: 'The Literature Research panel is open and draggable. Explore PubMed E-utilities, bioRxiv preprints, PubGemma 27B MeSH literature grounding, and PhysioNet 2026 Platinum Tier (#1 Global Benchmark) models.',
        position: 'left',
      },
      {
        targetId: 'tour-docs-trigger',
        title: 'Step 8: Interactive Medical Studies & Docs',
        body: 'Click "Docs" to view the comprehensive, integrated clinical protocol guidelines, OpenAPI schema, and study pages.',
        position: 'bottom',
      },
      {
        targetId: 'tour-theme-trigger',
        title: 'Step 9: Dieter Rams Functional Theme Studio',
        body: 'Select from structured rectangular theme swatches (Rice Paper Washi, Raw Hemp, Carrara Marble, Obsidian Black, Madame Curie Lab) with real-color dual-swatch contrast previews and ADA 44px touch targets.',
        position: 'bottom',
      },
      {
        targetId: 'tour-footer-lens-navigation',
        title: 'Step 10: Footer Lens Stepper & Wachter/Brookings Governance Suite',
        body: 'Quickly switch and navigate sequentially through the 11 specialized clinical lenses while monitoring Wachter/Brookings AI governance indicators and alarm suppression meters.',
        position: 'top',
      },
      {
        targetId: 'tour-finalize-btn',
        title: 'Step 11: Patient QR Handoff & FHIR R4 Bundle Archival',
        body: 'Archive the care plan, generate HL7 FHIR R4 Bundle exports, export CMS 837P RPM claims, and scan the QR code to hand off the plan to the patient\'s mobile device. Loop complete!',
        position: 'bottom',
      }
    ];

    return list;
  });

  totalSteps = computed(() => this.steps().length);

  start() {
    if (this.storage.getItem(TOUR_SEEN_KEY)) return;
    this.currentStep.set(0);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /** Force-start regardless of seen status (e.g. from a help button) */
  forceStart() {
    this.currentStep.set(0);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  next() {
    const step = this.currentStep();
    if (step < 0) return;
    
    const nextIdx = step + 1;
    const nextStep = nextIdx < this.steps().length ? this.steps()[nextIdx] : null;
    
    if (nextStep && (nextStep.targetId === 'tour-voice-agent-window' || nextStep.targetId === 'tour-voice-agent-trigger')) {
      this.state.toggleLiveAgent(true);
    } else {
      this.state.toggleLiveAgent(false);
    }

    if (nextStep && (nextStep.targetId === 'tour-research-frame-window' || nextStep.targetId === 'tour-research-frame-trigger')) {
      this.state.toggleResearchFrame(true);
    } else {
      this.state.toggleResearchFrame(false);
    }

    if (step >= this.steps().length - 1) {
      this.dismiss();
    } else {
      this.currentStep.set(nextIdx);
    }
  }

  prev() {
    const step = this.currentStep();
    if (step > 0) {
      const prevIdx = step - 1;
      const prevStep = this.steps()[prevIdx];
      
      if (prevStep.targetId === 'tour-voice-agent-window' || prevStep.targetId === 'tour-voice-agent-trigger') {
        this.state.toggleLiveAgent(true);
      } else {
        this.state.toggleLiveAgent(false);
      }
      
      if (prevStep.targetId === 'tour-research-frame-window' || prevStep.targetId === 'tour-research-frame-trigger') {
        this.state.toggleResearchFrame(true);
      } else {
        this.state.toggleResearchFrame(false);
      }
      
      this.currentStep.set(prevIdx);
    }
  }

  dismiss() {
    this.currentStep.set(-1);
    this.state.toggleLiveAgent(false);
    this.state.toggleResearchFrame(false);
    this.storage.setItem(TOUR_SEEN_KEY, '1');
  }
}
