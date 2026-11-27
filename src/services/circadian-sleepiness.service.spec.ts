// SPDX-License-Identifier: Apache-2.0
import '@angular/compiler';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { CircadianSleepinessService } from './circadian-sleepiness.service';

describe('CircadianSleepinessService (RSNA Melanopic Scotopic Safety)', () => {
  let service: CircadianSleepinessService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        CircadianSleepinessService
      ]
    });
    service = TestBed.inject(CircadianSleepinessService);
  });

  it('1. Suppresses blue/magenta hues (240°/320°) across ALL nocturnal hours (18:00-05:59) using warm amber/650nm scotopic red (h <= 25°)', () => {
    const nocturnalHours = [18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5];
    for (const hour of nocturnalHours) {
      const d = new Date(2026, 5, 15, hour, 30, 0);
      const ctx = service.getCircadianContext(d);
      expect(ctx.colorHslData.h).toBeLessThanOrEqual(25);
      expect(ctx.colorHslData.h).toBeGreaterThanOrEqual(0);
      expect(ctx.colorHsl).not.toContain('240,');
      expect(ctx.colorHsl).not.toContain('320,');
    }
  });

  it('2. Distinguishes night (21:00-23:59) from graveyard (00:00-04:59) without dead-branch overlap', () => {
    const nightCtx = service.getCircadianContext(new Date(2026, 5, 15, 22, 0, 0));
    expect(nightCtx.phase).toBe('night');
    expect(nightCtx.colorHslData.h).toBeLessThanOrEqual(25);

    const graveyardCtx = service.getCircadianContext(new Date(2026, 5, 15, 2, 0, 0));
    expect(graveyardCtx.phase).toBe('graveyard');
    expect(graveyardCtx.colorHslData.h).toBeLessThanOrEqual(15);
  });
});
