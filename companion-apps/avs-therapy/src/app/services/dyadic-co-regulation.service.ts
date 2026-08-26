import { Injectable, signal, computed, inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface IDyadicSessionState {
  isPaired: boolean;
  participant1Name: string;
  participant2Name: string;
  p1BreathingBpm: number;
  p2BreathingBpm: number;
  p1HeartRateBpm: number;
  p2HeartRateBpm: number;
  p1HrvRmssd: number;
  p2HrvRmssd: number;
  dyadicCoherenceIndex: number; // 0 - 100%
  phaseLockDegree: number; // 0 - 360 deg
  entrainmentHarmonyState: 'Synchronizing' | 'Resonant Coherence' | 'High Entrainment' | 'Baseline Alignment';
}

@Injectable({
  providedIn: 'root'
})
export class DyadicCoRegulationService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Dyadic State Signals
  readonly isPaired = signal<boolean>(true);
  readonly participant1Name = signal<string>('Client / Patient');
  readonly participant2Name = signal<string>('Therapist / Partner');

  readonly p1BreathingBpm = signal<number>(5.8);
  readonly p2BreathingBpm = signal<number>(6.0);
  readonly p1HeartRateBpm = signal<number>(68);
  readonly p2HeartRateBpm = signal<number>(70);
  readonly p1HrvRmssd = signal<number>(56);
  readonly p2HrvRmssd = signal<number>(52);

  readonly dyadicCoherenceIndex = signal<number>(88); // 88% shared coherence
  readonly phaseLockDegree = signal<number>(12); // Phase difference

  readonly harmonyState = computed(() => {
    const coherence = this.dyadicCoherenceIndex();
    if (coherence >= 85) return 'High Entrainment';
    if (coherence >= 70) return 'Resonant Coherence';
    if (coherence >= 50) return 'Synchronizing';
    return 'Baseline Alignment';
  });

  private syncTimerId: any = null;

  constructor() {
    if (this.isBrowser) {
      this.startDyadicSyncLoop();
    }
  }

  startDyadicSyncLoop(): void {
    if (this.syncTimerId) return;

    this.zone.runOutsideAngular(() => {
      this.syncTimerId = setInterval(() => {
        const time = Date.now() / 1000;
        
        // P1 & P2 cross-coupling dynamics
        const p1Breath = Number((5.8 + Math.sin(time * 0.2) * 0.4).toFixed(1));
        const p2Breath = Number((5.8 + Math.sin(time * 0.2 + 0.1) * 0.4).toFixed(1));

        const p1Hr = Math.round(68 + Math.sin(time * 0.5) * 4);
        const p2Hr = Math.round(69 + Math.sin(time * 0.5 + 0.15) * 4);

        const coherence = Math.round(86 + Math.cos(time * 0.1) * 8);
        const phase = Math.round(Math.abs(Math.sin(time * 0.15) * 20));

        this.zone.run(() => {
          this.p1BreathingBpm.set(p1Breath);
          this.p2BreathingBpm.set(p2Breath);
          this.p1HeartRateBpm.set(p1Hr);
          this.p2HeartRateBpm.set(p2Hr);
          this.dyadicCoherenceIndex.set(Math.max(40, Math.min(99, coherence)));
          this.phaseLockDegree.set(phase);
        });
      }, 500);
    });
  }

  stopDyadicSync(): void {
    if (this.syncTimerId) {
      clearInterval(this.syncTimerId);
      this.syncTimerId = null;
    }
  }
}
