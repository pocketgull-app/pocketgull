import { Injectable, signal, computed, inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type SleepPhase = 'awake' | 'alpha-descent' | 'spindle-induction' | 'slow-wave-delta' | 'car-awakening';

export interface ISleepProtocolMetrics {
  currentPhase: SleepPhase;
  phaseElapsedSeconds: number;
  phaseDurationSeconds: number;
  targetBrainwaveHz: number;
  breathingRateBpm: number;
  sleepSpindleActive: boolean;
  deltaAmplificationPct: number;
  glymphaticClearanceScore: number;
  estimatedSleepLatencyMin: number;
}

@Injectable({
  providedIn: 'root'
})
export class SleepInsomniaProtocolService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Active Session State
  readonly isSessionRunning = signal<boolean>(false);
  readonly currentPhase = signal<SleepPhase>('alpha-descent');
  readonly phaseElapsedSeconds = signal<number>(0);
  
  // Phase Durations (in seconds)
  readonly phaseDurations: Record<SleepPhase, number> = {
    'awake': 0,
    'alpha-descent': 900,      // 15 minutes (Alpha -> Theta)
    'spindle-induction': 600,  // 10 minutes (12-14Hz Spindle burst generation)
    'slow-wave-delta': 1800,   // 30 minutes (0.5-2Hz Deep SWS & Glymphatic wash)
    'car-awakening': 600       // 10 minutes (40Hz Morning Cortisol Awakening)
  };

  readonly sleepSpindleActive = signal<boolean>(false);
  readonly deltaAmplificationPct = signal<number>(45);
  readonly glymphaticClearanceScore = signal<number>(82);
  readonly estimatedSleepLatencyMin = signal<number>(11.4);

  // Dynamic Frequency Curve based on elapsed phase progress
  readonly dynamicTargetHz = computed(() => {
    const phase = this.currentPhase();
    const elapsed = this.phaseElapsedSeconds();
    const duration = this.phaseDurations[phase] || 1;
    const progress = Math.min(1, elapsed / duration);

    switch (phase) {
      case 'alpha-descent':
        // Smooth logarithmic descent from 10.0 Hz down to 4.5 Hz
        return Number((10.0 - (progress * 5.5)).toFixed(2));
      
      case 'spindle-induction':
        // If a thalamic spindle micro-burst is firing, spike to 13.5 Hz, else stay at 5.0 Hz
        return this.sleepSpindleActive() ? 13.5 : 5.0;

      case 'slow-wave-delta':
        // Deep slow-wave delta oscillation between 0.8 Hz and 1.8 Hz
        return Number((1.2 + Math.sin(elapsed * 0.05) * 0.6).toFixed(2));

      case 'car-awakening':
        // Fast rise from 10.0 Hz to 40.0 Hz Gamma awakening
        return Number((10.0 + (progress * 30.0)).toFixed(2));

      default:
        return 10.0;
    }
  });

  // Dynamic Breathing Pacing (BPM)
  readonly dynamicBreathingBpm = computed(() => {
    const phase = this.currentPhase();
    switch (phase) {
      case 'alpha-descent':
        return 5.5; // Resonant 0.1 Hz vagal breathing
      case 'spindle-induction':
        return 4.5; // Deeper somatic stabilization
      case 'slow-wave-delta':
        return 3.5; // Deep restorative basal respiration
      case 'car-awakening':
        return 8.0; // Invigorating activation
      default:
        return 6.0;
    }
  });

  private sessionTimerId: any = null;
  private spindleTimerId: any = null;

  constructor() {}

  startInsomniaProtocol(): void {
    if (!this.isBrowser) return;
    this.isSessionRunning.set(true);
    this.currentPhase.set('alpha-descent');
    this.phaseElapsedSeconds.set(0);
    this.runTimerLoop();
  }

  startCarAwakeningProtocol(): void {
    if (!this.isBrowser) return;
    this.isSessionRunning.set(true);
    this.currentPhase.set('car-awakening');
    this.phaseElapsedSeconds.set(0);
    this.runTimerLoop();
  }

  setPhase(phase: SleepPhase): void {
    this.currentPhase.set(phase);
    this.phaseElapsedSeconds.set(0);
  }

  pauseSession(): void {
    this.isSessionRunning.set(false);
    this.clearTimers();
  }

  resumeSession(): void {
    if (!this.isBrowser) return;
    this.isSessionRunning.set(true);
    this.runTimerLoop();
  }

  stopSession(): void {
    this.isSessionRunning.set(false);
    this.phaseElapsedSeconds.set(0);
    this.clearTimers();
  }

  private runTimerLoop(): void {
    this.clearTimers();

    this.zone.runOutsideAngular(() => {
      this.sessionTimerId = setInterval(() => {
        const current = this.currentPhase();
        const duration = this.phaseDurations[current];
        const nextElapsed = this.phaseElapsedSeconds() + 1;

        this.zone.run(() => {
          this.phaseElapsedSeconds.set(nextElapsed);

          // Handle automatic phase progression
          if (nextElapsed >= duration && duration > 0) {
            if (current === 'alpha-descent') {
              this.setPhase('spindle-induction');
            } else if (current === 'spindle-induction') {
              this.setPhase('slow-wave-delta');
            }
          }
        });
      }, 1000);

      // Thalamocortical sleep spindle burst generator (fires every 4-8 seconds during spindle-induction)
      this.spindleTimerId = setInterval(() => {
        if (this.currentPhase() === 'spindle-induction' && this.isSessionRunning()) {
          this.zone.run(() => {
            this.sleepSpindleActive.set(true);
            setTimeout(() => {
              this.zone.run(() => this.sleepSpindleActive.set(false));
            }, 1200); // 1.2s physiological spindle burst duration
          });
        }
      }, 5500);
    });
  }

  private clearTimers(): void {
    if (this.sessionTimerId) {
      clearInterval(this.sessionTimerId);
      this.sessionTimerId = null;
    }
    if (this.spindleTimerId) {
      clearInterval(this.spindleTimerId);
      this.spindleTimerId = null;
    }
  }
}
