// SPDX-License-Identifier: Apache-2.0
import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
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
        hr: '-10', // invalid negative HR
        spO2: '150%' // invalid SpO2 > 100%
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

  it('should initialize with default health and auto-repair active', () => {
    const metrics = service.healthMetrics();
    expect(metrics.isAutoRepairEnabled).toBe(true);
  });

  it('should detect and auto-repair corrupted patient issues and symptoms', () => {
    service.auditPatientStateAndSymptoms();

    // Verify sanitized issue
    const repairedIssues = mockPatientState.issues();
    expect(repairedIssues['head']).toBeDefined();
    expect(repairedIssues['head'][0].painLevel).toBe(10); // clamped from 45 to 10
    expect(repairedIssues['head'][0].symptoms.length).toBe(3);
    expect(repairedIssues['head'][0].symptoms[0]).toBe('Throbbing migraine');

    // Verify sanitized vitals
    const repairedVitals = mockPatientState.vitals();
    expect(repairedVitals.hr).toBe('72'); // restored from -10 to 72
    expect(repairedVitals.spO2).toBe('98%'); // restored from 150% to 98%

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

  it('should rollback patches on request', () => {
    service.applyCssPatch('patch-1', '.selector-1', '.selector-1 { color: red; }', 'test patch');
    expect(service.activePatches().length).toBe(1);
    
    service.revertAllPatches();
    expect(service.activePatches()[0].status).toBe('reverted');
  });
});
