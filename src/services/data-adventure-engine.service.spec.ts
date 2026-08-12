import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { DataAdventureEngineService } from './data-adventure-engine.service';

describe('DataAdventureEngineService (Telemetry Data-to-Quest Conversion)', () => {
  let service: DataAdventureEngineService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [DataAdventureEngineService]
    });
    service = runInInjectionContext(injector, () => injector.get(DataAdventureEngineService));
  });

  it('1. Initializes default bio-adventure quests and active count', () => {
    const adventures = service.adventures();
    expect(adventures.length).toBe(3);
    expect(adventures[0].adventureTitle).toContain('Nocturnal REM');
  });

  it('2. Unlocks a new bio-adventure expedition when a user uploads telemetry data', () => {
    const newAdv = service.unlockAdventureFromUpload('lab_results_2026.csv', 'Blood Biomarker');
    expect(newAdv.unlockedByDataSource).toBe('lab_results_2026.csv');
    expect(service.activeCount()).toBe(4);
  });
});
