import { Injectable, signal, computed, inject } from '@angular/core';
import { ThemeService } from './theme.service';
import { PatientStateService } from './patient-state.service';
import { SecureStorageService } from './secure-storage.service';

export type TourPathway = 'clinical-provider' | 'family-hero' | 'global-researcher' | 'patient-wellness';

export interface ITourStep {
  targetId: string;
  title: string;
  body: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  badge?: string;
}

export interface ITourPathwayMetadata {
  id: TourPathway;
  title: string;
  subtitle: string;
  icon: string;
  stepCount: number;
}

const TOUR_SEEN_KEY = 'pg_tour_seen';

@Injectable({ providedIn: 'root' })
export class WalkthroughTourService {
  private theme = inject(ThemeService);
  private state = inject(PatientStateService);
  private storage = inject(SecureStorageService);

  /** Active Persona Pathway */
  readonly activePathway = signal<TourPathway>('clinical-provider');

  /** -1 = inactive, 0..N = active step index */
  readonly currentStep = signal<number>(-1);
  readonly isActive = computed(() => this.currentStep() >= 0);

  /** Available Persona Pathways for user flow selection */
  readonly availablePathways: ITourPathwayMetadata[] = [
    {
      id: 'clinical-provider',
      title: 'Attending Clinician & EHR Scribe',
      subtitle: 'Patient charts, 3D anatomy, Ambient Scribe SOAP note synthesis & FHIR R4 handoff.',
      icon: '🩺',
      stepCount: 11
    },
    {
      id: 'family-hero',
      title: 'Family & Hero Health Quests',
      subtitle: 'Kid-powered coaching, 4 companion modes, 9-language i18n & printable fridge charts.',
      icon: '🌟',
      stepCount: 5
    },
    {
      id: 'global-researcher',
      title: 'Global Science & Data Alliance',
      subtitle: 'AWS RODA, GCP BigQuery, Azure Blob, Apple Health, MIMIC-IV & Big Four consensus.',
      icon: '🔬',
      stepCount: 5
    },
    {
      id: 'patient-wellness',
      title: 'Patient Wellness & Ephemeral Sovereignty',
      subtitle: 'Camera tremor/rPPG vitals, Zen 432Hz Sanctuary, anonymous healing & 1-click purge.',
      icon: '🧘',
      stepCount: 5
    }
  ];

  /** Dynamic Steps based on active pathway */
  readonly steps = computed<ITourStep[]>(() => {
    const pathway = this.activePathway();

    switch (pathway) {
      case 'family-hero':
        return [
          {
            targetId: 'tour-family-quest-hero',
            title: 'Hero Step 1: Select Companion Archetype',
            body: 'Choose from 🌟 Kids & Family, 🤝 Peer/Friend Pact, 🐕 Furry Pet Co-Care, or 🧘 Mindful Solo Self-Mastery to tailor daily habit encouragement.',
            position: 'bottom',
            badge: 'Companion Mode'
          },
          {
            targetId: 'tour-family-quest-language',
            title: 'Hero Step 2: 9-Language Cognitive Localization',
            body: 'Switch seamlessly across English, Spanish, French, German, Chinese, Japanese, Hindi, Arabic (with native RTL alignment), and Portuguese.',
            position: 'bottom',
            badge: 'i18n'
          },
          {
            targetId: 'tour-family-quest-cards',
            title: 'Hero Step 3: Complete Micro-Habit Health Quests',
            body: 'Log daily hydration, morning sunshine, rainbow vegetable intake, and wind-down bedtimes to earn superhero badge stamps.',
            position: 'left',
            badge: 'Quests'
          },
          {
            targetId: 'tour-family-quest-print',
            title: 'Hero Step 4: 1-Click Printable Refrigerator Chart',
            body: 'Generate a high-contrast, black-and-white printable weekly stamp chart for physical refrigerator tracking with stickers or markers.',
            position: 'top',
            badge: 'Print'
          },
          {
            targetId: 'tour-family-quest-privacy',
            title: 'Hero Step 5: Screen-Free & Offline First Support',
            body: 'All progress caches offline in PWA local storage with zero cloud ad trackers and 100% ephemeral privacy protection.',
            position: 'top',
            badge: 'Privacy'
          }
        ];

      case 'global-researcher':
        return [
          {
            targetId: 'tour-research-ecosystem-tabs',
            title: 'Science Step 1: Select Open Health Data Cloud',
            body: 'Explore federated datasets across AWS Open Data (RODA), Google Cloud BigQuery, Microsoft Azure Blob, Apple Health Studies, and Global Science Alliances.',
            position: 'bottom',
            badge: 'Federation'
          },
          {
            targetId: 'tour-research-biomarkers',
            title: 'Science Step 2: Inspect Global Reference Cohorts',
            body: 'Query PhysioNet MIMIC-IV continuous waveforms, UK Biobank 500k Pan-UKBB GWAS distributions, and Human Protein Atlas tissue expression maps.',
            position: 'right',
            badge: 'Cohorts'
          },
          {
            targetId: 'tour-research-consensus',
            title: 'Science Step 3: Big Four Quad-Cloud Consensus',
            body: 'Evaluate concordance scoring and statistical agreement across Google Gemini 2.5, AWS Bedrock Claude 3.5, Azure BioGPT, and Apple CoreML.',
            position: 'bottom',
            badge: 'Consensus'
          },
          {
            targetId: 'tour-research-cochrane',
            title: 'Science Step 4: Cochrane RoB 2 & CPIC Pharmacogenomics',
            body: 'Review Risk of Bias 2 evaluations and verify CYP450 (CYP2D6, CYP2C19) drug-gene interaction guidelines.',
            position: 'left',
            badge: 'Evidence'
          },
          {
            targetId: 'tour-research-null-hypothesis',
            title: 'Science Step 5: Popperian Null-Hypothesis (H₀) Auditing',
            body: 'Verify that treatment efficacy metrics achieve empirical statistical significance (p < 0.05) against baseline clinical means.',
            position: 'top',
            badge: 'Epistemology'
          }
        ];

      case 'patient-wellness':
        return [
          {
            targetId: 'tour-camera-biometrics',
            title: 'Wellness Step 1: WebGPU Camera Bio-Telemetry',
            body: 'Extract contactless rPPG heart rate variability (HRV) and motor tremor FFT frequency spectra directly on-device using WebGPU.',
            position: 'bottom',
            badge: 'Bio-Telemetry'
          },
          {
            targetId: 'tour-zen-sanctuary',
            title: 'Wellness Step 2: Zen Sanctuary & 432Hz Sound Healing',
            body: 'Engage in procedural 432Hz Tibetan singing bowl sound synthesis and 4-7-8 vagal nerve breathing pacers.',
            position: 'bottom',
            badge: 'Sanctuary'
          },
          {
            targetId: 'tour-postcards-pier',
            title: 'Wellness Step 3: Postcards on the Pier Healing Gallery',
            body: 'Read and send anonymous, compassionate words of encouragement with Kintsugi gold vein illumination.',
            position: 'left',
            badge: 'Community'
          },
          {
            targetId: 'tour-exposomics-geofence',
            title: 'Wellness Step 4: Privacy-First On-Device Geo-Exposomics',
            body: 'Check local Air Quality Index (AQI) and UV pollen advisories calculated purely on-device without remote location logging.',
            position: 'top',
            badge: 'Exposomics'
          },
          {
            targetId: 'tour-purge-state',
            title: 'Wellness Step 5: 1-Click Ephemeral State Purge',
            body: 'Wipe all transient clinical signals, cache, and session buffers with a single click satisfying HIPAA Safe Harbor.',
            position: 'top',
            badge: 'Data Sovereignty'
          }
        ];

      case 'clinical-provider':
      default:
        return [
          {
            targetId: 'tour-patient-dropdown',
            title: 'Step 1: Patient Chart & Sentinel Triage Selection',
            body: 'Begin the clinical loop by selecting a patient profile. Patients flagged for outbreak or epidemiological threats (Sentinels) feature high-priority amber tags, demographic twin baselines, and containment protocols.',
            position: 'bottom',
            badge: 'EHR'
          },
          {
            targetId: 'tour-body-chart',
            title: 'Step 2: 3D Anatomical & Raycast Loci Symptom Isolation',
            body: 'Investigate the procedural Three.js 3D anatomical model (Skin, Muscle, Bone, Visceral Organs, Dermatomes). Tapping an organ interpolates camera focus, displays raycast tooltips, and filters metabolic CMP lab panels.',
            position: 'right',
            badge: '3D Anatomy'
          },
          {
            targetId: 'tour-ambient-scribe',
            title: 'Step 3: Ambient Multimodal Clinical Scribe',
            body: 'Activate the real-time speech diarization engine (Clinician 🩺 vs Patient 👤) to synthesize structured SOAP notes with automated ICD-10-CM and CPT E&M billing codes.',
            position: 'bottom',
            badge: 'Ambient AI'
          },
          {
            targetId: 'tour-generate-btn',
            title: 'Step 4: One-Tap Gemini 3.5 & 3.6 Multi-Lens Synthesis',
            body: 'Click "Refresh Analysis". Google Gemini 3.5 & 3.6 Flash stream real-time evidence-grounded directives with Thought Signature Circulation across Western, TCM Zang-Fu, and Ayurvedic paradigms.',
            position: 'bottom',
            badge: 'Intelligence'
          },
          {
            targetId: 'tour-lens-tabs',
            title: 'Step 5: Explore 11 Specialized Clinical Lenses',
            body: 'Navigate through Overview, Treatment Matrix, Functional Protocols, Nutrition, Precision Nutrients, Follow-up, Patient Education, Assessments, Maternal, Longevity, and CMS RPM Billing Audit lenses.',
            position: 'bottom',
            badge: 'Multi-Lens'
          },
          {
            targetId: 'tour-report-node',
            title: 'Step 6: 4-Level Progressive Disclosure & Level 4 Context Actions',
            body: 'Single-click cards for details; double-click/tap to cycle state; right-click or long-press for Level 4 Clinical Context Actions (FHIR R4 Export, Gemini Consult, CMS 837P Exporter, Pin Telemetry, Attach Note).',
            position: 'left',
            badge: 'Progressive Disclosure'
          },
          {
            targetId: 'tour-voice-agent-window',
            title: 'Step 7: Live Avian Agent Consult & Multimodal Streaming',
            body: 'The Avian Voice Consult panel is active. Interact with `@google/adk` personas like Gulliver (🔭) or Swoop (⚡) using full-duplex WebSocket audio streams and instant client-side barge-in.',
            position: 'left',
            badge: 'Voice Stream'
          },
          {
            targetId: 'tour-research-frame-window',
            title: 'Step 8: Literature Research & Open Science Hub',
            body: 'The Literature Research panel is open and draggable. Explore PubMed E-utilities, bioRxiv preprints, PubGemma 27B MeSH literature grounding, and PhysioNet 2026 Platinum Tier (#1 Global Benchmark) models.',
            position: 'left',
            badge: 'Research'
          },
          {
            targetId: 'tour-theme-trigger',
            title: 'Step 9: Dieter Rams Functional Theme Studio',
            body: 'Select from structured rectangular theme swatches (Rice Paper Washi, Raw Hemp, Carrara Marble, Obsidian Black, Madame Curie Lab) with real-color dual-swatch contrast previews and ADA 44px touch targets.',
            position: 'bottom',
            badge: 'Aesthetic'
          },
          {
            targetId: 'tour-footer-lens-navigation',
            title: 'Step 10: Footer Lens Stepper & Wachter/Brookings Governance Suite',
            body: 'Quickly switch and navigate sequentially through the 11 specialized clinical lenses while monitoring Wachter/Brookings AI governance indicators and alarm suppression meters.',
            position: 'top',
            badge: 'Governance'
          },
          {
            targetId: 'tour-finalize-btn',
            title: 'Step 11: Patient QR Handoff & FHIR R4 Bundle Archival',
            body: 'Archive the care plan, generate HL7 FHIR R4 Bundle exports, export CMS 837P RPM claims, and scan the QR code to hand off the plan to the patient\'s mobile device. Loop complete!',
            position: 'bottom',
            badge: 'FHIR Export'
          }
        ];
    }
  });

  readonly totalSteps = computed(() => this.steps().length);

  /** Sets the active walkthrough pathway */
  setPathway(pathway: TourPathway): void {
    this.activePathway.set(pathway);
    this.currentStep.set(0);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  start(pathway?: TourPathway): void {
    if (pathway) {
      this.activePathway.set(pathway);
    }
    if (this.storage.getItem(TOUR_SEEN_KEY)) return;
    this.currentStep.set(0);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /** Force-start regardless of seen status (e.g. from a help button) */
  forceStart(pathway?: TourPathway): void {
    if (pathway) {
      this.activePathway.set(pathway);
    }
    this.currentStep.set(0);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  next(): void {
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

  prev(): void {
    const step = this.currentStep();
    if (step > 0) {
      const prevIdx = step - 1;
      const prevStep = this.steps()[prevIdx];
      
      if (prevStep && (prevStep.targetId === 'tour-voice-agent-window' || prevStep.targetId === 'tour-voice-agent-trigger')) {
        this.state.toggleLiveAgent(true);
      } else {
        this.state.toggleLiveAgent(false);
      }
      
      if (prevStep && (prevStep.targetId === 'tour-research-frame-window' || prevStep.targetId === 'tour-research-frame-trigger')) {
        this.state.toggleResearchFrame(true);
      } else {
        this.state.toggleResearchFrame(false);
      }
      
      this.currentStep.set(prevIdx);
    }
  }

  dismiss(): void {
    this.currentStep.set(-1);
    this.state.toggleLiveAgent(false);
    this.state.toggleResearchFrame(false);
    this.storage.setItem(TOUR_SEEN_KEY, '1');
  }
}
