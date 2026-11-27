// SPDX-License-Identifier: Apache-2.0
import '@angular/compiler';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UiSelfRepairService } from './ui-self-repair.service';
import { PatientStateService } from './patient-state.service';
import { runInInjectionContext, createEnvironmentInjector, EnvironmentInjector, PLATFORM_ID, NgZone, signal } from '@angular/core';

describe('UiSelfRepairService', () => {
  let service: UiSelfRepairService;
  let injector: EnvironmentInjector;
  let mockPatientState: any;

  beforeEach(() => {
    const mockNgZone = {
      runOutsideAngular: (fn: Function) => fn(),
      run: (fn: Function) => fn()
    };

    mockPatientState = {
      issues: signal<any>({
        head: [
          {
            id: 'head',
            painLevel: 45, // invalid pain level > 10
            symptoms: ['Throbbing migraine', null, { name: '' }],
            description: 'Severe headache'
          }
        ]
      }),
      vitals: signal<any>({
        hr: '-10', // physically impossible negative HR
        spO2: '150%' // physically impossible SpO2 > 100%
      })
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

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should initialize with default health and auto-repair active', () => {
    const metrics = service.healthMetrics();
    expect(metrics.isAutoRepairEnabled).toBe(true);
  });

  it('should quarantine physically impossible vitals to "--" without fabricating healthy numbers and preserve critical low vitals', () => {
    service.auditPatientStateAndSymptoms();

    // Verify sanitized issue
    const repairedIssues = mockPatientState.issues();
    expect(repairedIssues['head']).toBeDefined();
    expect(repairedIssues['head'][0].painLevel).toBe(10); // clamped from 45 to 10
    expect(repairedIssues['head'][0].symptoms.length).toBe(3);
    expect(repairedIssues['head'][0].symptoms[0]).toBe('Throbbing migraine');

    // Clinical Safety: NEVER fabricate reassuring '72' or '98%'
    const repairedVitals = mockPatientState.vitals();
    expect(repairedVitals.hr).toBe('--');
    expect(repairedVitals.spO2).toBe('--');

    // Critical real emergencies (e.g. HR=0 asystole, SpO2=84% hypoxia) MUST remain untouched
    mockPatientState.vitals.set({ hr: '0', spO2: '84%' });
    service.auditPatientStateAndSymptoms();
    expect(mockPatientState.vitals().hr).toBe('0');
    expect(mockPatientState.vitals().spO2).toBe('84%');

    const metrics = service.healthMetrics();
    expect(metrics.patientStateRepairsExecuted).toBeGreaterThan(0);
  });

  it('should toggle HUD and auto-repair states', () => {
    expect(service.isHudOpen()).toBe(false);
    service.toggleHud();
    expect(service.isHudOpen()).toBe(true);

    expect(service.isAutoRepairEnabled()).toBe(true);
    service.toggleAutoRepair();
    expect(service.isAutoRepairEnabled()).toBe(false);
  });

  it('should deduplicate identical CSS patches across repeat audits and rollback cleanly', () => {
    service.applyCssPatch('patch-1', '.selector-1', '.selector-1 { color: #ede3d2; }', 'test patch');
    // Repeat audit with different anomalyId but same selector + style MUST NOT duplicate patch
    service.applyCssPatch('patch-2', '.selector-1', '.selector-1 { color: #ede3d2; }', 'test patch');
    expect(service.activePatches().length).toBe(1);

    service.revertAllPatches();
    expect(service.activePatches()[0].status).toBe('reverted');
  });

  it('should not inject min-height blowup patches onto hidden or plain sparkline canvases', () => {
    const hiddenWrap = document.createElement('div');
    hiddenWrap.className = 'hidden';
    const canvas = document.createElement('canvas');
    hiddenWrap.appendChild(canvas);
    document.body.appendChild(hiddenWrap);

    service.repairBiophysicalLenses();
    expect(service.activePatches().length).toBe(0);
    document.body.removeChild(hiddenWrap);
  });
});
