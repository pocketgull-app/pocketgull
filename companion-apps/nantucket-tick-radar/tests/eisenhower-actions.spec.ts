import { describe, it, expect } from 'vitest';
import { EISENHOWER_ACTIONS } from '../src/data/eisenhower-actions.js';

describe('Eisenhower Actions Dataset', () => {
  it('1. Contains actions for all 4 quadrants and all 4 clinical phases', () => {
    const quadrants = new Set(EISENHOWER_ACTIONS.map(a => a.quadrant));
    const phases = new Set(EISENHOWER_ACTIONS.map(a => a.phase));

    expect(quadrants.has('q1_urgent_important')).toBe(true);
    expect(quadrants.has('q2_plan_decide')).toBe(true);
    expect(quadrants.has('q3_delegate_deescalate')).toBe(true);
    expect(quadrants.has('q4_eliminate_waste')).toBe(true);

    expect(phases.has('bite_acute_0_2h')).toBe(true);
    expect(phases.has('prophylaxis_window_2_72h')).toBe(true);
    expect(phases.has('symptom_watch_3_30d')).toBe(true);
    expect(phases.has('prevention_ecology')).toBe(true);
  });

  it('2. Properly flags emergency red flags under Q1', () => {
    const redFlags = EISENHOWER_ACTIONS.filter(a => a.isRedFlag);
    expect(redFlags.length).toBeGreaterThan(0);
    expect(redFlags[0].quadrant).toBe('q1_urgent_important');
  });

  it('3. Confirms folk remedy elimination under Q4', () => {
    const folk = EISENHOWER_ACTIONS.find(a => a.id === 'folk-remedies-smothering');
    expect(folk?.quadrant).toBe('q4_eliminate_waste');
    expect(folk?.actionSteps.some(s => s.includes('DO NOT burn'))).toBe(true);
  });
});
