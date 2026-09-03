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
      stepCount: 12
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
            title: 'Pick Your Adventure',
            body: 'Who\'s on this health journey with you? Choose a companion mode—whether it\'s your kids earning superhero stamps, a friend keeping you accountable, your pet reminding you to walk, or just you building quiet daily habits.',
            position: 'bottom',
            badge: 'Companion Mode'
          },
          {
            targetId: 'tour-family-quest-language',
            title: 'Your Language, Your Way',
            body: 'Health advice only works when it speaks your language. Switch between 9 languages instantly—including right-to-left Arabic—so everyone in your family can understand what\'s happening.',
            position: 'bottom',
            badge: 'i18n'
          },
          {
            targetId: 'tour-family-quest-cards',
            title: 'Small Steps, Big Wins',
            body: 'Drink water. Get some morning sun. Eat a rainbow of vegetables. Wind down before bed. These aren\'t medical orders—they\'re tiny daily habits your family can do together and celebrate with badge stamps.',
            position: 'left',
            badge: 'Quests'
          },
          {
            targetId: 'tour-family-quest-print',
            title: 'Put It on the Fridge',
            body: 'Print a weekly chart your kids can stick on the refrigerator and mark up with stickers or crayons. Real paper. Real markers. No screen required.',
            position: 'top',
            badge: 'Print'
          },
          {
            targetId: 'tour-family-quest-privacy',
            title: 'Safe, Offline, and Yours',
            body: 'Everything your family logs stays right here on this device. No accounts. No ads. No data sent to anyone. It works offline, and you can erase it all anytime.',
            position: 'top',
            badge: 'Privacy'
          }
        ];

      case 'global-researcher':
        return [
          {
            targetId: 'tour-research-ecosystem-tabs',
            title: 'Explore the World\'s Health Data',
            body: 'Connect to open research datasets across AWS, Google Cloud, Microsoft Azure, and Apple Health Studies. Federated access means you query where the data lives—nothing gets copied or centralized.',
            position: 'bottom',
            badge: 'Federation'
          },
          {
            targetId: 'tour-research-biomarkers',
            title: 'Compare Against Real Populations',
            body: 'How does your patient compare to 500,000 UK Biobank participants? To PhysioNet MIMIC-IV ICU waveforms? Ground your clinical intuition in actual population-scale reference distributions.',
            position: 'right',
            badge: 'Cohorts'
          },
          {
            targetId: 'tour-research-consensus',
            title: 'Get a Multi-Model Second Opinion',
            body: 'No single AI model should be trusted alone. Compare reasoning across Google Gemini, AWS Bedrock Claude, Azure BioGPT, and Apple CoreML—and see where they agree, disagree, and why.',
            position: 'bottom',
            badge: 'Consensus'
          },
          {
            targetId: 'tour-research-cochrane',
            title: 'Check the Evidence Quality',
            body: 'Not all studies are created equal. Review Cochrane Risk of Bias assessments for cited trials, and verify drug-gene interactions against CPIC pharmacogenomic guidelines (CYP2D6, CYP2C19).',
            position: 'left',
            badge: 'Evidence'
          },
          {
            targetId: 'tour-research-null-hypothesis',
            title: 'Hold Every Claim Accountable',
            body: 'If a treatment effect can\'t clear p < 0.05 against population baselines, Pocket-Gull says so openly. No hand-waving. No false confidence. Science means being honest about what we don\'t know.',
            position: 'top',
            badge: 'Epistemology'
          }
        ];

      case 'patient-wellness':
        return [
          {
            targetId: 'tour-camera-biometrics',
            title: 'Check In With Your Body',
            body: 'Point your camera at your hand or face. Pocket-Gull can read your pulse from the tiny color changes in your skin—no wearable needed, no data sent anywhere. Everything stays on your device.',
            position: 'bottom',
            badge: 'Bio-Telemetry'
          },
          {
            targetId: 'tour-zen-sanctuary',
            title: 'Find a Quiet Moment',
            body: 'When the world feels like too much, step into a space designed for stillness. Gentle singing bowl tones and a simple breathing guide—inhale for 4, hold for 7, exhale for 8—to help your nervous system settle.',
            position: 'bottom',
            badge: 'Sanctuary'
          },
          {
            targetId: 'tour-postcards-pier',
            title: 'You\'re Not Alone',
            body: 'Read anonymous words of encouragement from others who\'ve walked a hard road, or leave a kind word for someone who needs it. No names. No profiles. Just human warmth, offered freely.',
            position: 'left',
            badge: 'Community'
          },
          {
            targetId: 'tour-exposomics-geofence',
            title: 'Know What\'s in Your Air',
            body: 'Check today\'s air quality and pollen levels where you are. The check happens entirely on your device—your location is never logged, stored, or sent to anyone.',
            position: 'top',
            badge: 'Exposomics'
          },
          {
            targetId: 'tour-purge-state',
            title: 'Erase Everything, Anytime',
            body: 'Your health data belongs to you and only you. One tap wipes every trace—symptoms, notes, session history—completely and permanently. No backups. No lingering copies. Gone.',
            position: 'top',
            badge: 'Data Sovereignty'
          }
        ];

      case 'clinical-provider':
      default:
        return [
          {
            targetId: 'tour-patient-dropdown',
            title: 'Choose Your Patient',
            body: 'Start here. Select a patient to open their chart. Patients flagged with amber Sentinel tags need immediate attention—they have active outbreak risks or critical triage alerts waiting for you.',
            position: 'bottom',
            badge: 'EHR'
          },
          {
            targetId: 'tour-body-chart',
            title: 'Explore the Body',
            body: 'Tap any organ on the 3D model to zoom in—skin, muscle, bone, or viscera. The relevant lab panels and symptom clusters filter automatically, so you see exactly what matters for that region.',
            position: 'right',
            badge: '3D Anatomy'
          },
          {
            targetId: 'tour-ambient-scribe',
            title: 'Just Talk to Your Patient',
            body: 'Turn this on and forget about it. Pocket-Gull listens quietly, figures out who\'s speaking, and writes a structured SOAP note with billing codes in the background—so you never have to look away from the person in front of you.',
            position: 'bottom',
            badge: 'Ambient AI'
          },
          {
            targetId: 'tour-generate-btn',
            title: 'Ask for a Second Opinion',
            body: 'One tap. Gemini analyzes the full clinical picture and streams back evidence-grounded insights across Western, Traditional Chinese, and Ayurvedic perspectives—each clearly sourced and tagged by confidence level.',
            position: 'bottom',
            badge: 'Intelligence'
          },
          {
            targetId: 'tour-lens-tabs',
            title: 'See Every Angle',
            body: 'Eleven specialized lenses—from treatment protocols and precision nutrition to maternal health and longevity—let you examine the same patient through different clinical perspectives without losing context.',
            position: 'bottom',
            badge: 'Multi-Lens'
          },
          {
            targetId: 'tour-report-node',
            title: 'Go Deeper When You Need To',
            body: 'Tap a card to expand it. Double-tap to cycle through detail levels. Right-click or long-press for advanced actions—export to FHIR, consult Gemini on that specific finding, attach a note, or pin it to your telemetry dashboard.',
            position: 'left',
            badge: 'Progressive Disclosure'
          },
          {
            targetId: 'tour-epistemic-falsification',
            title: 'Challenge Before You Commit',
            body: 'Combat confirmation bias: Popperian disconfirmation presents 3 orthogonal counter-hypotheses and bedside physical exam checklists to verify before sealing diagnostic assertions.',
            position: 'left',
            badge: 'Epistemic CDS'
          },
          {
            targetId: 'tour-voice-agent-window',
            title: 'Talk It Through With Gulliver',
            body: 'Open a live voice conversation with your AI clinical companion. Ask questions out loud, think through differentials together, or have it explain a finding in plain language for your patient. It listens, responds, and you can interrupt anytime.',
            position: 'left',
            badge: 'Voice Stream'
          },
          {
            targetId: 'tour-research-frame-window',
            title: 'Check the Literature',
            body: 'Drag this panel wherever you need it. Search PubMed, browse preprints, and see how your clinical reasoning stacks up against the latest published evidence—without leaving the patient\'s chart.',
            position: 'left',
            badge: 'Research'
          },
          {
            targetId: 'tour-theme-trigger',
            title: 'Make It Comfortable',
            body: 'Choose a visual theme that suits your eyes and your environment—warm paper tones for bright exam rooms, deep obsidian for late-night charting. Every option maintains clinical-grade contrast and readability.',
            position: 'bottom',
            badge: 'Aesthetic'
          },
          {
            targetId: 'tour-footer-lens-navigation',
            title: 'Step Through the Lenses',
            body: 'Use the footer bar to move sequentially through each clinical lens. The governance indicators alongside show you the AI\'s confidence level and any suppressed alerts, so you always know what\'s under the hood.',
            position: 'top',
            badge: 'Governance'
          },
          {
            targetId: 'tour-finalize-btn',
            title: 'Hand It Off',
            body: 'You\'re done. Archive the care plan, export it as a standards-compliant FHIR R4 bundle, and generate a QR code your patient can scan to carry their plan home on their phone. The loop is complete.',
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
