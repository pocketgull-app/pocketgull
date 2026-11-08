// SPDX-License-Identifier: Apache-2.0
import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { UiSelfRepairService } from './ui-self-repair.service';
import { PatientStateService } from './patient-state.service';
import { MOCK_PATIENTS } from '../mock-patients';
import { runInInjectionContext, createEnvironmentInjector, EnvironmentInjector, PLATFORM_ID, NgZone, signal } from '@angular/core';

describe('UiSelfRepairService SMoE Patient Cohort Test Suite', () => {
  let service: UiSelfRepairService;
  let injector: EnvironmentInjector;
  let mockPatientState: any;

  beforeEach(() => {
    const mockNgZone = {
      runOutsideAngular: (fn: Function) => fn(),
      run: (fn: Function) => fn()
    };

    mockPatientState = {
      issues: signal<any>({}),
      vitals: signal<any>({})
    };

    injector = createEnvironmentInjector([
      { provide: PLATFORM_ID, useValue: 'browser' },
      { provide: NgZone, useValue: mockNgZone },
      { provide: PatientStateService, useValue: mockPatientState }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      service = new UiSelfRepairService();
    });
  });

  it('should test and verify all 21 SMoE patient cohorts without corruption', () => {
    expect(MOCK_PATIENTS.length).toBeGreaterThanOrEqual(21);

    for (const patient of MOCK_PATIENTS) {
      // Hydrate patient into reactive state signals
      mockPatientState.issues.set(patient.issues || {});
      mockPatientState.vitals.set(patient.vitals || {});

      // Execute self-repair diagnostic audit
      service.auditPatientStateAndSymptoms();

      // Verify that after audit, issues and vitals remain healthy and well-formed
      const issues = mockPatientState.issues();
      expect(typeof issues).toBe('object');

      for (const [bodyPartId, issueList] of Object.entries(issues as Record<string, any[]>)) {
        expect(Array.isArray(issueList)).toBe(true);
        for (const issue of issueList) {
          expect(issue.painLevel).toBeGreaterThanOrEqual(1);
          expect(issue.painLevel).toBeLessThanOrEqual(10);
          expect(Array.isArray(issue.symptoms)).toBe(true);
        }
      }

      // Check metrics
      const metrics = service.healthMetrics();
      expect(metrics.healthScore).toBeGreaterThanOrEqual(0);
      expect(metrics.healthScore).toBeLessThanOrEqual(100);
    }
  });

  it('should autonomously auto-repair deliberate anomalies injected into a patient case', () => {
    // Inject corruptions into p_charles_darwin style case
    mockPatientState.issues.set({
      abdomen: [
        {
          id: 'abdomen',
          painLevel: 999, // deliberate overflow
          symptoms: ['Dyspepsia', '', null as any],
          description: 'Recurrent sea-sickness and abdominal spasms'
        }
      ]
    });
    mockPatientState.vitals.set({
      hr: 'invalid_text',
      spO2: '200%'
    });

    service.auditPatientStateAndSymptoms();

    const repairedIssues = mockPatientState.issues();
    expect(repairedIssues['abdomen'][0].painLevel).toBe(10); // clamped
    expect(repairedIssues['abdomen'][0].symptoms.length).toBe(3);
    expect(repairedIssues['abdomen'][0].symptoms[0]).toBe('Dyspepsia');
    expect(repairedIssues['abdomen'][0].symptoms[1]).toBe('Unspecified Symptom');
    expect(repairedIssues['abdomen'][0].symptoms[2]).toBe('Unspecified Symptom');

    const repairedVitals = mockPatientState.vitals();
    expect(repairedVitals.hr).toBe('72');
    expect(repairedVitals.spO2).toBe('98%');

    const metrics = service.healthMetrics();
    expect(metrics.patientStateRepairsExecuted).toBeGreaterThan(0);
  });
});
