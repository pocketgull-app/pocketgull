import { Injectable, signal, computed } from '@angular/core';

export type TourPersona = 'PATIENT' | 'CLINICIAN' | 'RESEARCHER' | 'ALL';

export interface ITourStep {
  id: string;
  stepIndex: number;
  title: string;
  description: string;
  targetElementSelector: string; // CSS selector for spotlighting
  persona: TourPersona;
  actionHint?: string;
}

export interface IOnboardingProgress {
  persona: TourPersona;
  currentStepIndex: number;
  totalSteps: number;
  completed: boolean;
  activeStep: ITourStep | null;
}

@Injectable({
  providedIn: 'root'
})
export class InteractiveOnboardingTourService {

  public selectedPersona = signal<TourPersona>('PATIENT');
  public currentStepIndex = signal<number>(0);
  public isTourActive = signal<boolean>(false);

  private readonly tourSteps: ITourStep[] = [
    {
      id: 'step_joy_matrix',
      stepIndex: 0,
      title: '☀️ Joy & Playful Flourishing Matrix',
      description: 'Prescribe 10-minute micro-joy activities based on Seligman PERMA+ daily flourishing metrics to support holistic mental & emotional well-being.',
      targetElementSelector: '[data-testid="tab-joy-matrix"]',
      persona: 'PATIENT',
      actionHint: 'Click to explore micro-joy activities!'
    },
    {
      id: 'step_3d_organ_twin',
      stepIndex: 1,
      title: '🧬 WebGPU 3D Organ Digital Twin',
      description: 'Visualize real-time WebGPU 3D biophysical organ stress, cardiac ventricular displacement, and vascular perfusion shaders.',
      targetElementSelector: '[data-testid="tab-spatial-3d"]',
      persona: 'RESEARCHER',
      actionHint: 'Try dragging the 3D organ viewport!'
    },
    {
      id: 'step_statutory_will',
      stepIndex: 2,
      title: '🏛️ 50-State Statutory Advance Directive Hub',
      description: 'Access 100% free U.S. State-approved living wills, healthcare power of attorney forms, and FHIR R4 Consent JSON exports.',
      targetElementSelector: '[data-testid="tab-living-will"]',
      persona: 'PATIENT',
      actionHint: 'Export your digital data directive bundle!'
    },
    {
      id: 'step_irmaa_appeals',
      stepIndex: 3,
      title: '⚖️ Medicare IRMAA & SSA-44 Appeals',
      description: 'Calculate 2026 Medicare Part B/D income surcharges based on MAGI and evaluate Form SSA-44 Life-Changing Event appeal savings.',
      targetElementSelector: '[data-testid="tab-irmaa"]',
      persona: 'CLINICIAN',
      actionHint: 'Enter your MAGI to check surcharge tiers!'
    },
    {
      id: 'step_smart_on_fhir',
      stepIndex: 4,
      title: '🏥 SMART-on-FHIR EHR Launch Engine',
      description: 'Initiate certified SMART-on-FHIR OAuth2 launches with PKCE S256 challenge for Epic MyChart, Cerner, and AthenaHealth.',
      targetElementSelector: '[data-testid="tab-smart-launch"]',
      persona: 'CLINICIAN',
      actionHint: 'Select your target EHR vendor!'
    }
  ];

  /** Reactive tour progress state */
  public progress = computed<IOnboardingProgress>(() => {
    const persona = this.selectedPersona();
    const filteredSteps = persona === 'ALL' 
      ? this.tourSteps 
      : this.tourSteps.filter(s => s.persona === persona || s.persona === 'ALL');

    const totalSteps = filteredSteps.length;
    const stepIdx = Math.max(0, Math.min(this.currentStepIndex(), totalSteps - 1));
    const activeStep = totalSteps > 0 ? filteredSteps[stepIdx] || null : null;
    const completed = totalSteps > 0 && this.currentStepIndex() >= totalSteps;

    return {
      persona,
      currentStepIndex: stepIdx,
      totalSteps,
      completed,
      activeStep
    };
  });

  public startTour(persona: TourPersona = 'PATIENT'): void {
    this.selectedPersona.set(persona);
    this.currentStepIndex.set(0);
    this.isTourActive.set(true);
  }

  public nextStep(): void {
    const p = this.progress();
    if (this.currentStepIndex() < p.totalSteps - 1) {
      this.currentStepIndex.update(idx => idx + 1);
    } else {
      this.completeTour();
    }
  }

  public previousStep(): void {
    if (this.currentStepIndex() > 0) {
      this.currentStepIndex.update(idx => idx - 1);
    }
  }

  public completeTour(): void {
    this.isTourActive.set(false);
  }
}
