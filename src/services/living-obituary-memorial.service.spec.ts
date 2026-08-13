import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { LivingObituaryMemorialService } from './living-obituary-memorial.service';
import { GrowThyselfLegacyEngineService } from './grow-thyself-legacy-engine.service';
import { BioThemeSongEngineService } from './bio-theme-song-engine.service';
import { PatientStateService } from './patient-state.service';
import { StorageService } from './storage.service';
import { ThemeService } from './theme.service';
import { ActuarialLongevityService } from './actuarial-longevity.service';
import { GamificationService } from './gamification.service';

describe('LivingObituaryMemorialService (Obituarial Innovations)', () => {
  let service: LivingObituaryMemorialService;

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
        LivingObituaryMemorialService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(LivingObituaryMemorialService));
  });

  it('1. Initializes active living obituary memorial with 528Hz Solfeggio bio-theme', () => {
    const mem = service.activeMemorial();
    expect(mem.fullName).toContain('Eleanor Vance');
    expect(mem.themeSongFrequencyHz).toBe(528);
    expect(mem.openScienceContributionsCount).toBeGreaterThan(1000);
  });

  it('2. Triggers playing memorial bio-theme fanfare and peer tributes', () => {
    const initialTributes = service.activeMemorial().peerTributesCount;
    service.addPeerTribute();
    expect(service.activeMemorial().peerTributesCount).toBe(initialTributes + 1);
  });
});
