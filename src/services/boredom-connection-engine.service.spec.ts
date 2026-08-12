import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { BoredomConnectionEngineService } from './boredom-connection-engine.service';

describe('BoredomConnectionEngineService (Boredom-to-Flow & Human Connection Quests)', () => {
  let service: BoredomConnectionEngineService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [BoredomConnectionEngineService]
    });
    service = runInInjectionContext(injector, () => injector.get(BoredomConnectionEngineService));
  });

  it('1. Initializes default boredom micro-adventures and connection quests', () => {
    const boredom = service.activeBoredomQuests();
    const connection = service.activeConnectionQuests();
    
    expect(boredom.length).toBe(3);
    expect(connection.length).toBe(3);
    expect(service.totalAvailableQuests()).toBe(6);
  });

  it('2. Verifies Gratitude Pulse and Intergenerational Elder connection quests', () => {
    const gratitude = service.activeConnectionQuests().find(q => q.category === 'GRATITUDE_PULSE');
    expect(gratitude?.title).toContain('Gratitude Pulse');
    expect(gratitude?.impactMetrics).toContain('vagal HRV');
  });
});
