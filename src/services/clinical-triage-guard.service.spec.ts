import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ClinicalTriageGuardService, IPatientTriageInput } from './clinical-triage-guard.service';

describe('ClinicalTriageGuardService', () => {
  let service: ClinicalTriageGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClinicalTriageGuardService]
    });
    service = TestBed.inject(ClinicalTriageGuardService);
  });

  describe('Deterministic Red-Flag Gate (100% Emergency Rule-Outs)', () => {
    it('should deterministically trigger STAT_EMERGENCY for BE-FAST stroke signs', () => {
      const input: IPatientTriageInput = {
        textNarrative: 'Patient suddenly developed right-sided facial droop and severe slurred speech 20 minutes ago.',
        age: 68
      };

      const result = service.evaluateTriageAcuity(input);

      expect(result.acuityLevel).toBe('STAT_EMERGENCY');
      expect(result.isDeterministicOverride).toBe(true);
      expect(result.detectedRedFlags.some(f => f.category === 'STROKE_BE_FAST')).toBe(true);
      expect(result.clinicalDirectives.some(d => d.includes('NPO'))).toBe(true);
    });

    it('should deterministically trigger STAT_EMERGENCY for ACS chest pain in patient with cardiac risk', () => {
      const input: IPatientTriageInput = {
        textNarrative: 'Sudden substernal chest pressure with cold sweat diaphoresis while climbing stairs.',
        age: 54,
        knownConditions: ['Essential Hypertension']
      };

      const result = service.evaluateTriageAcuity(input);

      expect(result.acuityLevel).toBe('STAT_EMERGENCY');
      expect(result.isDeterministicOverride).toBe(true);
      expect(result.detectedRedFlags.some(f => f.category === 'CARDIAC_ACS')).toBe(true);
      expect(result.clinicalDirectives.some(d => d.includes('12-lead ECG'))).toBe(true);
    });

    it('should deterministically trigger STAT_EMERGENCY for C-SSRS suicidal crisis', () => {
      const input: IPatientTriageInput = {
        textNarrative: 'Patient expressing active suicidal ideation with specific lethal plan.',
        age: 22
      };

      const result = service.evaluateTriageAcuity(input);

      expect(result.acuityLevel).toBe('STAT_EMERGENCY');
      expect(result.isDeterministicOverride).toBe(true);
      expect(result.detectedRedFlags.some(f => f.category === 'PSYCH_SUICIDE_RISK')).toBe(true);
      expect(result.detectedRedFlags[0].statutoryHotline).toContain('988');
    });

    it('should trigger STAT_EMERGENCY for severe hypoxemia (SpO2 < 90%)', () => {
      const input: IPatientTriageInput = {
        textNarrative: 'Severe shortness of breath',
        vitals: { spo2Pct: 86, respiratoryRate: 28 }
      };

      const result = service.evaluateTriageAcuity(input);

      expect(result.acuityLevel).toBe('STAT_EMERGENCY');
      expect(result.detectedRedFlags.some(f => f.category === 'RESPIRATORY_FAILURE')).toBe(true);
    });

    it('should classify uncomplicated mild symptoms as ROUTINE', () => {
      const input: IPatientTriageInput = {
        textNarrative: 'Patient requesting refill and routine dietary advice for mild stage 1 hypertension.',
        age: 45,
        vitals: { systolicBp: 132, diastolicBp: 84, heartRate: 72, spo2Pct: 99 }
      };

      const result = service.evaluateTriageAcuity(input);

      expect(result.acuityLevel).toBe('ROUTINE');
      expect(result.isDeterministicOverride).toBe(false);
      expect(result.detectedRedFlags.length).toBe(0);
    });
  });

  describe('ISMP Decimal Safety Sanitizer', () => {
    it('should eliminate trailing zeros to prevent 10-fold overdose errors', () => {
      const raw = 'Prescribe Lisinopril 10.0 mg PO daily and Amlodipine 5.0 mg';
      const sanitized = service.sanitizeIsmpDecimals(raw);
      expect(sanitized).toBe('Prescribe Lisinopril 10 mg PO daily and Amlodipine 5 mg');
    });

    it('should add leading zeros to naked decimals', () => {
      const raw = 'Administer .5 mg Clonazepam at bedtime and .25 mcg Digoxin';
      const sanitized = service.sanitizeIsmpDecimals(raw);
      expect(sanitized).toBe('Administer 0.5 mg Clonazepam at bedtime and 0.25 mcg Digoxin');
    });
  });
});
