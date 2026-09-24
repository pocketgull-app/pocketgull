/**
 * PocketGull Bio-Rhythmic Typography Service
 * 
 * Bridges clinical vagal autonomic pacing (0.1 Hz Rachel Nabors Parasympathetic Standard)
 * to live CSS variable font axes (--pg-live-wght, --pg-live-opsz, --pg-live-breathe-scale).
 * 
 * Architecture:
 * - Angular 22 Signals reactivity
 * - Direct CSS Custom Property dispatch to :root (zero DOM tree recalculation)
 * - Safe Harbor for prefers-reduced-motion
 * - SSR compatible (safe window/document guards)
 */

import { Injectable, signal, computed, effect, inject, OnDestroy } from '@angular/core';
import { ClinicalVagalResonantPacingService, ILivePacingState } from './clinical-vagal-resonant-pacing.service';

export interface IBioRhythmicTypographyConfig {
  baseWeight: number;       // e.g. 400 (Regular/Fineliner)
  maxWeightDelta: number;   // e.g. 35 (oscillates between 385 and 420)
  baseOpticalSize: number;  // e.g. 14 pt
  maxOpszDelta: number;     // e.g. 1.0 pt
  maxScaleDelta: number;    // e.g. 0.02 (1.000 to 1.020)
  enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BioRhythmicTypographyService implements OnDestroy {
  private readonly vagalPacing = inject(ClinicalVagalResonantPacingService);

  // Configuration signal
  readonly config = signal<IBioRhythmicTypographyConfig>({
    baseWeight: 400,
    maxWeightDelta: 30,
    baseOpticalSize: 14,
    maxOpszDelta: 1.0,
    maxScaleDelta: 0.02,
    enabled: true
  });

  // Reduced motion detection signal
  readonly isReducedMotion = signal<boolean>(false);

  // Computed kinetic weight (385 to 430 in sync with respiratory phase)
  readonly currentWeight = computed<number>(() => {
    if (!this.config().enabled || this.isReducedMotion()) {
      return this.config().baseWeight;
    }
    const state = this.vagalPacing.liveState();
    // Normalized expansion factor: 0.0 (baseline) to 1.0 (full inhale)
    const factor = Math.max(0, Math.min(1, (state.expansionScale - 1.0) / 0.25));
    return Math.round(this.config().baseWeight + factor * this.config().maxWeightDelta);
  });

  // Computed kinetic optical size
  readonly currentOpticalSize = computed<number>(() => {
    if (!this.config().enabled || this.isReducedMotion()) {
      return this.config().baseOpticalSize;
    }
    const state = this.vagalPacing.liveState();
    const factor = Math.max(0, Math.min(1, (state.expansionScale - 1.0) / 0.25));
    return Number((this.config().baseOpticalSize + factor * this.config().maxOpszDelta).toFixed(1));
  });

  // Computed respiratory breathe scale (1.000 to 1.020)
  readonly currentBreatheScale = computed<number>(() => {
    if (!this.config().enabled || this.isReducedMotion()) {
      return 1.0;
    }
    const state = this.vagalPacing.liveState();
    const factor = Math.max(0, Math.min(1, (state.expansionScale - 1.0) / 0.25));
    return Number((1.0 + factor * this.config().maxScaleDelta).toFixed(4));
  });

  // Telemetry status
  readonly kineticTelemetry = computed(() => ({
    activeWeight: this.currentWeight(),
    activeOpticalSize: this.currentOpticalSize(),
    breatheScale: this.currentBreatheScale(),
    pacingPhase: this.vagalPacing.liveState().phase,
    vagalCoherenceIndex: this.vagalPacing.pacingProfile().rsaEfficiencyIndex,
    isSuppressedByAccessibility: this.isReducedMotion()
  }));

  private rafId?: number;
  private mediaQueryListener?: (e: MediaQueryListEvent) => void;

  constructor() {
    this.initAccessibilityListener();

    // Reactive effect: continuously dispatch updated CSS properties to :root
    effect(() => {
      const weight = this.currentWeight();
      const opsz = this.currentOpticalSize();
      const scale = this.currentBreatheScale();
      const vagalTone = this.vagalPacing.pacingProfile().rsaEfficiencyIndex / 100.0;
      this.applyToDom(weight, opsz, scale, vagalTone);
    });
  }

  /**
   * Toggles the live bio-rhythmic typography kinetic engine on or off.
   */
  public setKineticEnabled(enabled: boolean): void {
    this.config.update(c => ({ ...c, enabled }));
  }

  /**
   * Updates base typographic parameters for different clinical UI views.
   */
  public updateConfig(partial: Partial<IBioRhythmicTypographyConfig>): void {
    this.config.update(c => ({ ...c, ...partial }));
  }

  /**
   * Injects CSS custom properties into document.documentElement for pure hardware acceleration.
   */
  private applyToDom(weight: number, opsz: number, scale: number, vagalTone: number): void {
    if (typeof document === 'undefined' || !document.documentElement) {
      return;
    }
    const root = document.documentElement.style;
    root.setProperty('--pg-live-wght', weight.toString());
    root.setProperty('--pg-live-opsz', opsz.toString());
    root.setProperty('--pg-live-breathe-scale', scale.toString());
    root.setProperty('--pg-live-vagal-tone', vagalTone.toFixed(2));
  }

  private initAccessibilityListener(): void {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.isReducedMotion.set(query.matches);

    this.mediaQueryListener = (e: MediaQueryListEvent) => {
      this.isReducedMotion.set(e.matches);
    };

    if (query.addEventListener) {
      query.addEventListener('change', this.mediaQueryListener);
    } else if ((query as any).addListener) {
      (query as any).addListener(this.mediaQueryListener);
    }
  }

  ngOnDestroy(): void {
    if (this.rafId && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.rafId);
    }
    if (typeof window !== 'undefined' && window.matchMedia && this.mediaQueryListener) {
      const query = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (query.removeEventListener) {
        query.removeEventListener('change', this.mediaQueryListener);
      } else if ((query as any).removeListener) {
        (query as any).removeListener(this.mediaQueryListener);
      }
    }
  }
}
