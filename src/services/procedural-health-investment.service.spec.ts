// SPDX-License-Identifier: Apache-2.0
import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { ProceduralHealthInvestmentService } from './procedural-health-investment.service';
import { PatientStateService } from './patient-state.service';

describe('ProceduralHealthInvestmentService (Popperian Exploratory Badging)', () => {
  let service: ProceduralHealthInvestmentService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: {} },
        ProceduralHealthInvestmentService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(ProceduralHealthInvestmentService));
  });

  it('1. Badges all exploratory projections as [EXPLORATORY IN SILICO MODEL • NON-DIAGNOSTIC] with Cochrane Level C and zero unfalsified claims', () => {
    const items = service.calculateProceduralInvestments();
    expect(items.length).toBeGreaterThanOrEqual(4);

    for (const item of items) {
      expect(item.epistemicBadge).toBe('[EXPLORATORY IN SILICO MODEL • NON-DIAGNOSTIC]');
      expect(item.evidenceTier).toBe('Level C');
      expect(item.roiBreakdown).toContain('[EXPLORATORY IN SILICO MODEL • NON-DIAGNOSTIC]');
    }

    const serialized = JSON.stringify(items);
    expect(serialized).not.toContain('84%');
    expect(serialized).not.toContain('186.6');
    expect(serialized).not.toMatch(/karaoke/i);
    expect(serialized).not.toContain('+2.8 QALYs');
  });
});
