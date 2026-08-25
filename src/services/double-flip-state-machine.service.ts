import { Injectable, signal, computed } from '@angular/core';

export type DoubleClickState = 'IDLE' | 'PENDING_SECOND_CLICK' | 'CONFIRMED_ACTION' | 'EXPIRED_RESET';
export type DoubleFlipBiologicalState = 'STATE_A_DOMINANT' | 'SUPERPOSITION_TRANSITION' | 'STATE_B_DOMINANT';

export interface IDoubleClickEventResult {
  state: DoubleClickState;
  targetId: string;
  timeRemainingMs: number;
  isConfirmed: boolean;
}

export interface IDoubleFlipBistableTelemetry {
  currentState: DoubleFlipBiologicalState;
  stateAName: string;
  stateBName: string;
  flipCount: number;
  hysteresisRatio: number; // 0.0 - 1.0 (Stability metric)
  vagalSympatheticBalance: string;
}

@Injectable({
  providedIn: 'root'
})
export class DoubleFlipStateMachineService {
  // 1. Double-Click Safety Interlock State Signals
  private clickState = signal<DoubleClickState>('IDLE');
  private clickTargetId = signal<string | null>(null);
  private clickTimeoutId: any = null;

  readonly doubleClickStatus = computed<IDoubleClickEventResult>(() => ({
    state: this.clickState(),
    targetId: this.clickTargetId() || '',
    timeRemainingMs: this.clickState() === 'PENDING_SECOND_CLICK' ? 300 : 0,
    isConfirmed: this.clickState() === 'CONFIRMED_ACTION'
  }));

  // 2. Double-Flip Biological Bistability State Signals
  private bistableState = signal<DoubleFlipBiologicalState>('STATE_A_DOMINANT');
  private flipCounter = signal<number>(0);

  readonly doubleFlipTelemetry = computed<IDoubleFlipBistableTelemetry>(() => {
    const state = this.bistableState();
    const count = this.flipCounter();
    const hysteresisRatio = parseFloat((1 / (1 + (count * 0.1))).toFixed(2));

    let balance = 'Sympathetic Dominant (High Stress)';
    if (state === 'STATE_A_DOMINANT') balance = 'Parasympathetic Coherent (Rest & Digest)';
    if (state === 'SUPERPOSITION_TRANSITION') balance = 'Autonomic Transition Phase';

    return {
      currentState: state,
      stateAName: 'Parasympathetic Coherence (Vagal Tone)',
      stateBName: 'Sympathetic Hyper-Arousal (Fight-or-Flight)',
      flipCount: count,
      hysteresisRatio,
      vagalSympatheticBalance: balance
    };
  });

  /**
   * Triggers a click event in the Double-Click State Machine.
   * If a second click occurs within 300ms, transitions to CONFIRMED_ACTION.
   */
  registerClick(targetId: string): DoubleClickState {
    if (this.clickState() === 'PENDING_SECOND_CLICK' && this.clickTargetId() === targetId) {
      if (this.clickTimeoutId) clearTimeout(this.clickTimeoutId);
      this.clickState.set('CONFIRMED_ACTION');
      return 'CONFIRMED_ACTION';
    }

    this.clickTargetId.set(targetId);
    this.clickState.set('PENDING_SECOND_CLICK');

    if (this.clickTimeoutId) clearTimeout(this.clickTimeoutId);
    this.clickTimeoutId = setTimeout(() => {
      if (this.clickState() === 'PENDING_SECOND_CLICK') {
        this.clickState.set('EXPIRED_RESET');
        setTimeout(() => this.clickState.set('IDLE'), 100);
      }
    }, 300);

    return 'PENDING_SECOND_CLICK';
  }

  /**
   * Triggers a Flip event in the Double-Flip Bistable State Machine.
   * Toggles state between STATE_A and STATE_B via SUPERPOSITION_TRANSITION.
   */
  triggerDoubleFlip(): DoubleFlipBiologicalState {
    this.flipCounter.update(c => c + 1);

    if (this.bistableState() === 'STATE_A_DOMINANT') {
      this.bistableState.set('SUPERPOSITION_TRANSITION');
      setTimeout(() => this.bistableState.set('STATE_B_DOMINANT'), 150);
      return 'STATE_B_DOMINANT';
    } else {
      this.bistableState.set('SUPERPOSITION_TRANSITION');
      setTimeout(() => this.bistableState.set('STATE_A_DOMINANT'), 150);
      return 'STATE_A_DOMINANT';
    }
  }

  resetClickMachine(): void {
    if (this.clickTimeoutId) clearTimeout(this.clickTimeoutId);
    this.clickState.set('IDLE');
    this.clickTargetId.set(null);
  }
}
