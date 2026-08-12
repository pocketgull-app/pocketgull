import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { LivingObituaryMemorialComponent } from './living-obituary-memorial.component';
import { LivingObituaryMemorialService } from '../services/living-obituary-memorial.service';
import { LegacySwarmAgentsService } from '../services/ai/legacy-swarm-agents.service';
import { GrowThyselfLegacyEngineService } from '../services/grow-thyself-legacy-engine.service';
import { BioThemeSongEngineService } from '../services/bio-theme-song-engine.service';
import { PatientStateService } from '../services/patient-state.service';
import { StorageService } from '../services/storage.service';
import { ThemeService } from '../services/theme.service';
import { ActuarialLongevityService } from '../services/actuarial-longevity.service';
import { GamificationService } from '../services/gamification.service';

describe('LivingObituaryMemorialComponent', () => {
  let component: LivingObituaryMemorialComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: ChangeDetectionScheduler, useValue: { schedule: () => {}, notify: () => {} } },
        { provide: PLATFORM_ID, useValue: 'server' },
        ThemeService,
        StorageService,
        GamificationService,
        ActuarialLongevityService,
        PatientStateService,
        GrowThyselfLegacyEngineService,
        BioThemeSongEngineService,
        LivingObituaryMemorialService,
        LegacySwarmAgentsService,
        LivingObituaryMemorialComponent
      ]
    });
    component = runInInjectionContext(injector, () => injector.get(LivingObituaryMemorialComponent));
  });

  it('1. Initializes living obituary memorial component with active memorial data', () => {
    expect(component.memorialService.activeMemorial().fullName).toContain('Eleanor Vance');
    expect(component.agentService.activeAgentsCount()).toBe(3);
  });
});
