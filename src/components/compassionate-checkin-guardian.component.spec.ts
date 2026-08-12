import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { CompassionateCheckInGuardianComponent } from './compassionate-checkin-guardian.component';
import { CompassionateCheckInGuardianService } from '../services/compassionate-checkin-guardian.service';
import { PeerNetworkService } from '../services/peer-network.service';
import { StorageService } from '../services/storage.service';
import { ThemeService } from '../services/theme.service';
import { ActuarialLongevityService } from '../services/actuarial-longevity.service';
import { GamificationService } from '../services/gamification.service';
import { PatientStateService } from '../services/patient-state.service';

describe('CompassionateCheckInGuardianComponent', () => {
  let component: CompassionateCheckInGuardianComponent;

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
        PeerNetworkService,
        CompassionateCheckInGuardianService,
        CompassionateCheckInGuardianComponent
      ]
    });
    component = runInInjectionContext(injector, () => injector.get(CompassionateCheckInGuardianComponent));
  });

  it('1. Initializes compassionate check-in component with status options and peer feed', () => {
    expect(component.statusOptions.length).toBe(4);
    expect(component.checkinService.peerCheckIns().length).toBeGreaterThan(0);
  });
});
