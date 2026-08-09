import '@angular/compiler';
import * as DOMPurify from 'dompurify';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LifestyleAdjunctService } from './lifestyle-adjunct.service';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { PatientStateService } from './patient-state.service';

describe('LifestyleAdjunctService — Cappuccino & Caffeine Biofeedback Test Suite', () => {
  let service: LifestyleAdjunctService;
  let mockPatientState: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockPatientState = {
      symptoms: signal([
        { id: '1', name: 'Had espresso today', severity: 'moderate', bodyPartId: 'head' }
      ]),
      conditions: signal([
        'caffeine user', 'caffeinated cappuccino morning'
      ]),
      vitals: signal({ hr: '88', bp: '128/82' })
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      service = new LifestyleAdjunctService();
    });
  });

  it('should instantiate successfully', () => {
    expect(service).toBeTruthy();
  });

  it('should detect recent cappuccino/espresso intake and generate caffeine adenosine antagonism recommendations', () => {
    const adjunct = service.generate();
    expect(adjunct.context.hasCaffeine).toBe(true);
    expect(adjunct.recommendations.length).toBeGreaterThan(0);

    const caffeineRec = adjunct.recommendations.find(r => r.emoji === '☕');
    expect(caffeineRec).toBeTruthy();
  });
});
