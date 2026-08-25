import { describe, it, expect } from 'vitest';
import { assessDwellTimeAndProphylaxis } from '../src/engine/dwell-time-calculator.js';

describe('Dwell Time & Prophylaxis Calculator', () => {
  it('1. Confirms eligibility for Doxycycline when blacklegged tick attached >= 36h and removed within 72h', () => {
    const result = assessDwellTimeAndProphylaxis(48, 12, 'ixodes_nymph');

    expect(result.doxycyclineProphylaxisEligible).toBe(true);
    expect(result.prophylaxisCriteriaMet.attachedAtLeast36h).toBe(true);
    expect(result.prophylaxisCriteriaMet.removedWithin72h).toBe(true);
    expect(result.hoursRemainingIn72hWindow).toBe(60);
    expect(result.clinicalRecommendation).toContain('High Clinical Indication for Prophylaxis');
  });

  it('2. Disallows prophylaxis when tick was attached < 36h (low transmission risk)', () => {
    const result = assessDwellTimeAndProphylaxis(18, 6, 'ixodes_nymph');

    expect(result.doxycyclineProphylaxisEligible).toBe(false);
    expect(result.lymeTransmissionProbability).toBeLessThan(5);
    expect(result.clinicalRecommendation).toContain('Attachment < 36 Hours');
  });

  it('3. Disallows prophylaxis when more than 72h have elapsed since removal', () => {
    const result = assessDwellTimeAndProphylaxis(48, 80, 'ixodes_nymph');

    expect(result.doxycyclineProphylaxisEligible).toBe(false);
    expect(result.hoursRemainingIn72hWindow).toBe(0);
    expect(result.clinicalRecommendation).toContain('Past 72-Hour Prophylaxis Window');
  });

  it('4. Disallows Lyme prophylaxis for Dog ticks (Dermacentor)', () => {
    const result = assessDwellTimeAndProphylaxis(48, 12, 'dermacentor_dog');

    expect(result.doxycyclineProphylaxisEligible).toBe(false);
    expect(result.prophylaxisCriteriaMet.speciesIsBlacklegged).toBe(false);
    expect(result.clinicalRecommendation).toContain('Non-Blacklegged Ticks');
  });
});
