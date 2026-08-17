import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { GrowThyselfLegacyVaultComponent } from './grow-thyself-legacy-vault.component';
import { GrowThyselfLegacyEngineService } from '../services/grow-thyself-legacy-engine.service';
import { PatientStateService } from '../services/patient-state.service';
import { StorageService } from '../services/storage.service';
import { ThemeService } from '../services/theme.service';
import { ActuarialLongevityService } from '../services/actuarial-longevity.service';
import { GamificationService } from '../services/gamification.service';

describe('GrowThyselfLegacyVaultComponent', () => {
  let component: GrowThyselfLegacyVaultComponent;

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
        GrowThyselfLegacyVaultComponent
      ]
    });
    component = runInInjectionContext(injector, () => injector.get(GrowThyselfLegacyVaultComponent));
  });

  it('1. Initializes 6 archetype reflection lenses and legacy engine context', () => {
    expect(component.archetypes.length).toBe(6);
    expect(component.legacyEngine.activeArchetype()).toBe('OPEN_SCIENCE_CONTRIBUTOR');
  });

  it('2. Supports switching archetype lens via UI', () => {
    component.legacyEngine.setArchetype('CREATIVE_ARTISAN');
    expect(component.legacyEngine.activeArchetype()).toBe('CREATIVE_ARTISAN');
    expect(component.legacyEngine.activeArchetypeDetails().label).toContain('Creative Artisan');
  });
});
