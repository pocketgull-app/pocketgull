import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { SmsEquityBridgeService } from './sms-equity-bridge.service';
import { IPatient } from './patient.types';

describe('SmsEquityBridgeService - Health Equity SMS Bridge Suite', () => {
  let service: SmsEquityBridgeService;

  const mockPatient: IPatient = {
    id: 'p001',
    name: 'Homo Sapiens (Male, Metabolic Syndrome, 58y)',
    age: 58,
    gender: 'Male',
    lastVisit: '2026-08-19',
    history: [],
    bookmarks: [],
    issues: {},
    patientGoals: '',
    medications: [],
    dietarySupplements: [],
    vitals: { bp: '148/94', hr: '76', spO2: '98%', temp: '36.6', weight: '82', height: '175' },
    preexistingConditions: ['Essential Hypertension', 'Type 2 Diabetes']
  };

  beforeEach(() => {
    service = new SmsEquityBridgeService();
  });

  it('1. Generates 8th-grade-or-lower reading level daily SMS care prompts', () => {
    const plan = service.getBridgePlan(mockPatient);
    expect(plan.dailyPrompts.length).toBe(3);
    expect(plan.readingGradeLevel).toBeLessThanOrEqual(8.0);
    expect(plan.dailyPrompts[0].charCount).toBeLessThanOrEqual(160);
  });

  it('2. Parses natural language inbound SMS and extracts blood pressure & dizziness symptom', () => {
    const inbound = 'My BP 138/88 pulse 74 feeling dizzy today';
    const parsed = service.parseInboundSms(inbound, 'p001');

    expect(parsed.detectedVitals.bp).toBe('138/88');
    expect(parsed.detectedVitals.hr).toBe(74);
    expect(parsed.detectedSymptoms).toContain('Dizziness');
    expect(parsed.urgencyLevel).toBe('ELEVATED');
    expect(parsed.fhirObservationResource).toBeDefined();
    expect(parsed.fhirObservationResource?.['resourceType']).toBe('Observation');
  });

  it('3. Triggers critical emergency response for severe chest pain text', () => {
    const inbound = 'Having sharp chest pain and my BP 190/110';
    const parsed = service.parseInboundSms(inbound, 'p001');

    expect(parsed.urgencyLevel).toBe('CRITICAL_CALL_911');
    expect(parsed.automatedResponseText).toContain('EMERGENCY ALERT');
  });
});
