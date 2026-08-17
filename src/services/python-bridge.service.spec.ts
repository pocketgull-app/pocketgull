import '@angular/compiler';
import { Injector, runInInjectionContext, signal, PLATFORM_ID } from '@angular/core';
import { PythonBridgeService } from './python-bridge.service';
import { PatientStateService } from './patient-state.service';
import { expect, vi } from 'vitest';

// Mock Angular's effect to avoid ChangeDetectionScheduler requirement in headless Vitest tests
vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    effect: () => {
      return {
        destroy: () => {}
      };
    }
  };
});

describe('PythonBridgeService', () => {
  let service: PythonBridgeService;
  let mockPatientState: any;
  let injector: Injector;
  let fetchSpy: any;

  beforeEach(() => {
    mockPatientState = {
      vitals: signal({ hr: '80', bp: '130/80', spO2: '96' }),
      patientAge: signal(45),
      issues: signal({
        head: [{ name: 'Migraine' }]
      })
    };

    // Spy on global fetch
    fetchSpy = vi.fn().mockImplementation((url: string) => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(url.includes('readmission-sepsis') ? {
          readmission_30d_probability: 0.22,
          readmission_risk_level: 'Moderate',
          lace_index_score: 8,
          qsofa_sepsis_score: 1,
          sepsis_escalation_risk: 'Moderate Sepsis Risk',
          conformal_confidence_interval: [0.14, 0.30],
          primary_driving_features: ['Elevated Serum Lactate']
        } : {
          risk_level: 'moderate',
          risk_score: 0.35,
          confidence: 0.85,
          contributing_factors: ['BP deviation'],
          note: 'ML model'
        })
      })
    );
    vi.stubGlobal('fetch', fetchSpy);

    // Mock platform ID browser detection
    injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    runInInjectionContext(injector, () => {
      service = new PythonBridgeService();
    });

    // Clear initial health check call to isolate tests
    fetchSpy.mockClear();
  });

  it('should fetch readmission and sepsis score from Python bridge or use fallback', async () => {
    const result = await service.fetchReadmissionSepsisScore();
    expect(result).toBeTruthy();
    expect(result.readmission_30d_probability).toBeGreaterThanOrEqual(0.0);
    expect(result.qsofa_sepsis_score).toBeGreaterThanOrEqual(0);
  });

  it('should format payload correctly and fetch risk score', async () => {
    const result = await service.fetchRiskScore();

    expect(fetchSpy).toHaveBeenCalled();
    const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    
    // Check request URL
    expect(url).toContain('/ml/risk-score');
    
    // Check payload details
    const body = JSON.parse(options.body as string);
    expect(body.hr).toBe(80);
    expect(body.bp_systolic).toBe(130);
    expect(body.bp_diastolic).toBe(80);
    expect(body.spo2).toBe(96);
    expect(body.age).toBe(45);
    expect(body.conditions).toContain('Migraine');

    // Check response parsing
    expect(result).not.toBeNull();
    expect(result?.risk_level).toBe('moderate');
    expect(result?.risk_score).toBe(0.35);
  });

  it('should use local fallback if service is unavailable', async () => {
    // Set service to unavailable
    service.isAvailable.set(false);

    // Set hypoxia vitals to test fallback logic
    mockPatientState.vitals.set({ hr: '85', bp: '145/85', spO2: '91' }); // SpO2 < 94

    const result = await service.fetchRiskScore();

    // Fetch should not have been called
    expect(fetchSpy).not.toHaveBeenCalled();

    // Check fallback calculations
    expect(result).not.toBeNull();
    expect(result?.risk_score).toBeGreaterThan(0.40); // SpO2 hypoxia adds 0.40
    expect(result?.contributing_factors).toContain('Hypoxia detected (SpO2: 91%)');
    expect(result?.risk_level).toBe('high'); // 0.65 falls in high category
  });

  it('should use local fallback if server fetch fails', async () => {
    // Mock fetch error
    fetchSpy.mockRejectedValue(new Error('Server offline'));

    // Set high workload vitals to test fallback logic
    mockPatientState.vitals.set({ hr: '130', bp: '150/95', spO2: '98' }); // RPP = 130 * 150 = 19500 (>12000)

    const result = await service.fetchRiskScore();

    // Fetch was called but failed
    expect(fetchSpy).toHaveBeenCalled();

    // Fallback logic check
    expect(result).not.toBeNull();
    expect(result?.contributing_factors).toContain('High Myocardial Workload (RPP: 19500)');
    expect(result?.note).toContain('Client-side Medical Indices Fallback');
  });

  it('should trigger hypoxia factors and adjust risk levels dynamically at different SpO2 thresholds', async () => {
    service.isAvailable.set(false);

    // 1. Normal SpO2 (e.g., 98%)
    mockPatientState.vitals.set({ hr: '75', bp: '120/80', spO2: '98' });
    let result = await service.fetchRiskScore();
    expect(result?.risk_score).toBe(0.0);
    expect(result?.contributing_factors).not.toContain(expect.stringContaining('Hypoxia'));
    expect(result?.risk_level).toBe('low');

    // 2. Hypoxia boundary (e.g., 93%)
    mockPatientState.vitals.set({ hr: '75', bp: '120/80', spO2: '93' });
    result = await service.fetchRiskScore();
    expect(result?.risk_score).toBe(0.40);
    expect(result?.contributing_factors).toContain('Hypoxia detected (SpO2: 93%)');
    expect(result?.risk_level).toBe('moderate');

    // 3. Hypoxia + Heart Rate deviation (e.g., SpO2: 90%, HR: 100 bpm)
    // SBP=120, HR=100 -> SIA = 100 * 45 / 120 = 37.5 (<50)
    // HR dev = (100-75)^2 = 625 (>400) -> adds 0.15. Total = 0.40 + 0.15 = 0.55
    mockPatientState.vitals.set({ hr: '100', bp: '120/80', spO2: '90' });
    result = await service.fetchRiskScore();
    expect(result?.risk_score).toBe(0.55);
    expect(result?.contributing_factors).toContain('Hypoxia detected (SpO2: 90%)');
    expect(result?.contributing_factors).toContain('Heart Rate out of baseline: 100 bpm');
    expect(result?.risk_level).toBe('high');
  });
});
