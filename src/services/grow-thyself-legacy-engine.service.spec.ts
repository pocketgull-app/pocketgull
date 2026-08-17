import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { GrowThyselfLegacyEngineService } from './grow-thyself-legacy-engine.service';
import { PatientStateService } from './patient-state.service';
import { StorageService } from './storage.service';
import { ThemeService } from './theme.service';
import { ActuarialLongevityService } from './actuarial-longevity.service';
import { GamificationService } from './gamification.service';

describe('GrowThyselfLegacyEngineService', () => {
  let service: GrowThyselfLegacyEngineService;

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
        GrowThyselfLegacyEngineService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(GrowThyselfLegacyEngineService));
  });

  it('1. Initializes default open science archetype and posthumous directive', () => {
    expect(service.activeArchetype()).toBe('OPEN_SCIENCE_CONTRIBUTOR');
    expect(service.activeArchetypeDetails().label).toContain('Open-Science');
    expect(service.posthumousDirective().openScienceConsent).toBe(true);
  });

  it('2. Supports toggling active archetype and computing purpose quest impact', () => {
    service.setArchetype('LAND_STEWARD');
    expect(service.activeArchetype()).toBe('LAND_STEWARD');
    expect(service.activeArchetypeDetails().label).toContain('Land Steward');

    const initialScore = service.totalLegacyImpactScore();
    service.toggleQuest('q_002');
    expect(service.totalLegacyImpactScore()).toBeGreaterThan(initialScore);
  });

  it('3. Updates posthumous data sharing directives', () => {
    service.updatePosthumousDirective({ targetResearchArea: 'NEURODEGENERATION' });
    expect(service.posthumousDirective().targetResearchArea).toBe('NEURODEGENERATION');
  });

  it('4. Submits new living experience reflection to citizen research stream', () => {
    const initialCount = service.livingSubmissions().length;
    service.submitExperience({
      title: 'Zone-2 Aerobic & Phytoncide Recovery',
      narrative: 'Combined morning forest walking with 528Hz Solfeggio bio-theme entrainment.',
      category: 'INTERVENTION_OUTCOME',
      researchConsent: true
    });
    expect(service.livingSubmissions().length).toBe(initialCount + 1);
    expect(service.livingSubmissions()[0].title).toBe('Zone-2 Aerobic & Phytoncide Recovery');
  });
});
