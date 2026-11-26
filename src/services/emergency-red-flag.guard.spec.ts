// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EmergencyRedFlagGuard } from './emergency-red-flag.guard';
import { GlobalJurisdictionMatrixService } from './global-jurisdiction-matrix.service';

describe('EmergencyRedFlagGuard', () => {
  let guard: EmergencyRedFlagGuard;
  let jurisdictionMatrix: GlobalJurisdictionMatrixService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EmergencyRedFlagGuard, GlobalJurisdictionMatrixService]
    });
    guard = TestBed.inject(EmergencyRedFlagGuard);
    jurisdictionMatrix = TestBed.inject(GlobalJurisdictionMatrixService);
  });

  it('1. Intercepts BE-FAST stroke signs synchronously and halts stochastic generation', () => {
    const res = guard.evaluate('Patient has sudden facial droop, right arm weakness, slurred speech, and acute ataxia.');
    expect(res.isTriggered).toBe(true);
    expect(res.acuity).toBe('STAT_EMERGENCY');
    expect(res.haltStochasticGeneration).toBe(true);
    expect(res.matches.some(m => m.category === 'BE_FAST_STROKE')).toBe(true);
    expect(res.deterministicProtocolMarkdown).toContain('911');
    expect(res.integritySeal).toMatch(/^SHA256-ERFG-[0-9a-f]{64}$/);
  });

  it('2. Intercepts ACS / STEMI / NSTEMI chest pain radiating to jaw or arm', () => {
    const res = guard.evaluate('62yo with substernal chest pain radiating to left arm and jaw with diaphoresis; suspect NSTEMI.');
    expect(res.isTriggered).toBe(true);
    expect(res.matches.some(m => m.category === 'ACS_STEMI_NSTEMI')).toBe(true);
  });

  it('3. Intercepts severe hypoxemia (SpO2 < 90%) from vitals or narrative text', () => {
    const fromVitals = guard.evaluate({ vitals: { spo2: 88 } });
    expect(fromVitals.isTriggered).toBe(true);
    expect(fromVitals.matches.some(m => m.category === 'SEVERE_HYPOXEMIA')).toBe(true);

    const fromText = guard.evaluate('Pulse oximetry reading SpO2 89% on room air');
    expect(fromText.isTriggered).toBe(true);
    expect(fromText.matches.some(m => m.category === 'SEVERE_HYPOXEMIA')).toBe(true);

    const safeSpo2 = guard.evaluate({ vitals: { spo2: 96 } });
    expect(safeSpo2.isTriggered).toBe(false);
  });

  it('4. Intercepts critical blood pressure extremes (SBP <= 85 or >= 220 mmHg)', () => {
    const lowBp = guard.evaluate({ vitals: { bp: '82/50' } });
    expect(lowBp.isTriggered).toBe(true);
    expect(lowBp.matches.some(m => m.category === 'CRITICAL_BP_EXTREME')).toBe(true);

    const highBp = guard.evaluate({ vitals: { bp: '224/122' } });
    expect(highBp.isTriggered).toBe(true);
    expect(highBp.matches.some(m => m.category === 'CRITICAL_BP_EXTREME')).toBe(true);
  });

  it('5. Intercepts severe hypoglycemia (CGM / glucose < 54 mg/dL)', () => {
    const lowGlucose = guard.evaluate({ vitals: { cgm: 49 } });
    expect(lowGlucose.isTriggered).toBe(true);
    expect(lowGlucose.matches.some(m => m.category === 'SEVERE_HYPOGLYCEMIA')).toBe(true);

    const textGlucose = guard.evaluate('CGM alert: blood glucose 46 mg/dL with tremor');
    expect(textGlucose.isTriggered).toBe(true);
    expect(textGlucose.matches.some(m => m.category === 'SEVERE_HYPOGLYCEMIA')).toBe(true);
  });

  it('6. Intercepts severe postpartum preeclampsia (BP >= 160/110 + headache/scotoma)', () => {
    const preeclampsia = guard.evaluate({
      text: '5 days postpartum with severe headache and flashing scotoma',
      vitals: { bp: '166/112' },
      postpartum: true
    });
    expect(preeclampsia.isTriggered).toBe(true);
    expect(preeclampsia.matches.some(m => m.category === 'SEVERE_POSTPARTUM_PREECLAMPSIA')).toBe(true);
  });

  it('7. Intercepts C-SSRS / PHQ-9 Item 9 > 0 suicidal ideation and maps all Five Eyes (FVEY) dispatch lines', () => {
    // US: 911 / 988
    const usEval = guard.evaluate({ phq9Item9Score: 1, countryCode: 'US', stateCode: 'CA' });
    expect(usEval.isTriggered).toBe(true);
    expect(usEval.matches.some(m => m.category === 'SUICIDAL_IDEATION_CRISIS')).toBe(true);
    expect(usEval.dispatch.emergencyNumber).toBe('911');
    expect(usEval.dispatch.crisisNumber).toBe('988');

    // CA: 911 / 988
    const caEval = guard.evaluate({ phq9Item9Score: 2, countryCode: 'CA' });
    expect(caEval.dispatch.emergencyNumber).toBe('911');
    expect(caEval.dispatch.crisisNumber).toBe('988');

    // UK (GB): 999 / 111
    const ukEval = guard.evaluate({ cssrsPositive: true, countryCode: 'GB' });
    expect(ukEval.dispatch.emergencyNumber).toBe('999');
    expect(ukEval.dispatch.crisisNumber).toBe('111');

    // AU: 000 / 13 11 14
    const auEval = guard.evaluate({ cssrsScore: 2, countryCode: 'AU' });
    expect(auEval.dispatch.emergencyNumber).toBe('000');
    expect(auEval.dispatch.crisisNumber).toBe('13 11 14');

    // NZ: 111 / 1737
    jurisdictionMatrix.setLocation('NZ');
    const nzEval = guard.evaluate({ phq9Item9Score: 1 });
    expect(nzEval.dispatch.emergencyNumber).toBe('111');
    expect(nzEval.dispatch.crisisNumber).toBe('1737');
    expect(nzEval.deterministicProtocolMarkdown).toContain('1737');
  });

  it('8. Does not false-trigger on routine benign encounters or explicitly negated ROS statements', () => {
    const benign = guard.evaluate({
      text: '45yo follow-up for mild knee stiffness. Denies chest pain, no facial droop, denies suicidal ideation.',
      vitals: { bp: '122/78', spo2: 98, glucose: 96, hr: 70 },
      phq9Item9Score: 0,
      cssrsScore: 0
    });
    expect(benign.isTriggered).toBe(false);
    expect(benign.acuity).toBe('NON_STAT');
    expect(benign.haltStochasticGeneration).toBe(false);
  });
});
