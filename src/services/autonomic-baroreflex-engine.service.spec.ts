import { describe, it, expect, beforeEach } from 'vitest';
import { AutonomicBaroreflexEngineService } from './autonomic-baroreflex-engine.service';

describe('AutonomicBaroreflexEngineService (Clinical Model P10)', () => {
  let service: AutonomicBaroreflexEngineService;

  beforeEach(() => {
    service = new AutonomicBaroreflexEngineService();
  });

  it('1. Evaluates healthy homeostasis autonomic baseline', () => {
    service.applyPreset('homeostasis');

    const hrv = service.hrvReport();
    expect(hrv.rmssdMs).toBe(42);
    expect(hrv.lfHfRatio).toBeCloseTo(1.35, 1);
    expect(hrv.autonomicState).toBe('Sympathovagal Equilibrium');

    const brs = service.brsReport();
    expect(brs.brsGainMsMmHg).toBe(14.2);
    expect(brs.classification).toBe('Normal High-Gain Baroreflex');
    expect(brs.cardiovascularRiskStratum).toBe('Low Risk');

    const orth = service.orthostaticReport();
    expect(orth.phenotype).toBe('Hemodynamically Stable Orthostasis');
    expect(orth.orthostaticHypotensionPresent).toBe(false);
    expect(orth.deltaHrBpm).toBe(12);

    expect(service.compositeReport().vagalToneScore).toBeGreaterThanOrEqual(60);
  });

  it('2. Detects Neurogenic Orthostatic Hypotension (nOH) with blunted heart rate ratio (< 0.5 bpm/mmHg)', () => {
    service.applyPreset('neurogenic_oh');

    const orth = service.orthostaticReport();
    expect(orth.orthostaticHypotensionPresent).toBe(true);
    expect(orth.deltaSbpMmhg).toBe(-35);
    expect(orth.deltaHrBpm).toBe(6);
    expect(orth.hrToSbpRatio).toBeLessThan(0.5);
    expect(orth.phenotype).toBe('Neurogenic Orthostatic Hypotension (nOH)');
    expect(orth.clinicalActionDirective).toContain('Sympathetic baroreflex failure');

    const brs = service.brsReport();
    expect(brs.classification).toBe('Depressed Baroreflex Failure');
    expect(brs.cardiovascularRiskStratum).toBe('Elevated Arrhythmogenic / Syncope Hazard');
  });

  it('3. Identifies Postural Orthostatic Tachycardia Syndrome (POTS) with delta HR >= 30 bpm', () => {
    service.applyPreset('pots_syndrome');

    const orth = service.orthostaticReport();
    expect(orth.deltaHrBpm).toBe(38);
    expect(orth.orthostaticHypotensionPresent).toBe(false);
    expect(orth.phenotype).toBe('Postural Orthostatic Tachycardia Syndrome (POTS)');
    expect(orth.clinicalActionDirective).toContain('Excessive orthostatic tachycardia');

    const hrv = service.hrvReport();
    expect(hrv.lfHfRatio).toBeGreaterThan(3.0);
    expect(hrv.autonomicState).toBe('Sympathetic Hyperarousal / Vagal Withdrawal');
  });

  it('4. Assesses severe Cardiovascular Autonomic Neuropathy (CAN) in diabetes with fixed heart rate', () => {
    service.applyPreset('diabetic_autonomic_neuropathy');

    const hrv = service.hrvReport();
    expect(hrv.rmssdMs).toBeLessThan(15);
    expect(hrv.normalizedHfNu).toBeLessThan(25);

    const brs = service.brsReport();
    expect(brs.brsGainMsMmHg).toBe(2.4);
    expect(brs.classification).toBe('Depressed Baroreflex Failure');

    const comp = service.compositeReport();
    expect(comp.vagalToneScore).toBeLessThan(25);
  });

  it('5. Evaluates high vagal tone in athletic endurance physiology', () => {
    service.applyPreset('vagal_hypertonia');

    const hrv = service.hrvReport();
    expect(hrv.autonomicState).toBe('Vagal Predominant');
    expect(hrv.rmssdMs).toBe(85);

    const brs = service.brsReport();
    expect(brs.brsGainMsMmHg).toBe(22.5);

    expect(service.compositeReport().vagalToneScore).toBeGreaterThanOrEqual(90);
  });

  it('6. Differentiates Non-Neurogenic OH with intact reflex tachycardia (ratio >= 0.5)', () => {
    // SBP drops by 26 mmHg, but HR accelerates vigorously by 22 bpm (ratio 0.85 >= 0.5)
    service.supineHrBpm.set(70);
    service.supineSbpMmhg.set(130);
    service.supineDbpMmhg.set(80);

    service.standingHrBpm.set(92);
    service.standingSbpMmhg.set(104); // -26 mmHg drop
    service.standingDbpMmhg.set(68);

    const orth = service.orthostaticReport();
    expect(orth.orthostaticHypotensionPresent).toBe(true);
    expect(orth.hrToSbpRatio).toBeGreaterThanOrEqual(0.5);
    expect(orth.phenotype).toBe('Non-Neurogenic Orthostatic Hypotension (Hypovolemic/Vasodilatory)');
    expect(orth.clinicalActionDirective).toContain('Intact compensatory baroreflex tachycardia');
  });

  it('7. Synthesizes complete master report with clinical narrative', () => {
    service.applyPreset('neurogenic_oh');
    const comp = service.compositeReport();

    expect(comp.clinicalSummary).toContain('Neurogenic Orthostatic Hypotension');
    expect(comp.clinicalSummary).toContain('BRS: 3.8 ms/mmHg');
    expect(comp.vagalToneScore).toBeDefined();
  });
});
