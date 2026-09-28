import { describe, it, expect } from 'vitest';
import {
  DEFAULT_OREGONATOR_PARAMS,
  oregonatorDerivatives,
  integrateOregonatorRk4,
  computeBioRhythmicRelaxationCurve,
  evaluateCircadianAttractor
} from './oregonator-kinetics.engine';

describe('OregonatorKineticsEngine (Epstein Nonlinear Chemical Dynamics)', () => {
  it('1. Computes valid derivatives without NaN or infinity', () => {
    const initialState = { x: 0.1, y: 0.1, z: 0.1, t: 0.0 };
    const { dx, dy, dz } = oregonatorDerivatives(initialState, DEFAULT_OREGONATOR_PARAMS);

    expect(Number.isFinite(dx)).toBe(true);
    expect(Number.isFinite(dy)).toBe(true);
    expect(Number.isFinite(dz)).toBe(true);
  });

  it('2. RK4 integration advances state stably over multiple iterations', () => {
    let state = { x: 0.5, y: 0.05, z: 0.2, t: 0.0 };
    const dt = 0.01;

    for (let i = 0; i < 50; i++) {
      state = integrateOregonatorRk4(state, dt, DEFAULT_OREGONATOR_PARAMS);
      expect(state.x).toBeGreaterThan(0);
      expect(state.y).toBeGreaterThan(0);
      expect(state.z).toBeGreaterThan(0);
      expect(Number.isFinite(state.x)).toBe(true);
    }

    expect(state.t).toBeCloseTo(0.5, 4);
  });

  it('3. Computes 0.10 Hz autonomic bio-rhythmic relaxation curve (4s inhale / 6s exhale)', () => {
    // At t=0s (start of inhale), curve is 0
    const start = computeBioRhythmicRelaxationCurve(0.0, 10.0);
    expect(start).toBeCloseTo(0.0, 2);

    // At t=4.0s (peak of inhale), curve is 1.0
    const peak = computeBioRhythmicRelaxationCurve(4.0, 10.0);
    expect(peak).toBeCloseTo(1.0, 2);

    // Mid-exhale (t=7.0s), curve has gently decayed
    const midExhale = computeBioRhythmicRelaxationCurve(7.0, 10.0);
    expect(midExhale).toBeLessThan(1.0);
    expect(midExhale).toBeGreaterThan(0.0);

    // End of exhale (t=10.0s), curve approaches 0
    const end = computeBioRhythmicRelaxationCurve(10.0, 10.0);
    expect(end).toBeCloseTo(0.0, 2);
  });

  it('4. Evaluates circadian limit-cycle attractor state correctly', () => {
    // Normal healthy daytime adult with high HRV & coherence
    const healthy = evaluateCircadianAttractor(14.0, 55, 85);
    expect(healthy.isBifurcated).toBe(false);
    expect(healthy.coherenceIndex).toBeGreaterThan(70);
    expect(healthy.vagalToneRatio).toBeGreaterThan(0.4);

    // Arrhythmic desynchrony: very low RMSSD & coherence
    const arrhythmic = evaluateCircadianAttractor(3.0, 12, 10);
    expect(arrhythmic.isBifurcated).toBe(true);
  });
});
