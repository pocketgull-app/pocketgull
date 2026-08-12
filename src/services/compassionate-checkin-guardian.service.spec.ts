import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { CompassionateCheckInGuardianService } from './compassionate-checkin-guardian.service';
import { PeerNetworkService } from './peer-network.service';
import { StorageService } from './storage.service';
import { ThemeService } from './theme.service';
import { ActuarialLongevityService } from './actuarial-longevity.service';
import { GamificationService } from './gamification.service';
import { PatientStateService } from './patient-state.service';

describe('CompassionateCheckInGuardianService (Peer Check-Ins & Well-Being Safeguards)', () => {
  let service: CompassionateCheckInGuardianService;

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
        CompassionateCheckInGuardianService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(CompassionateCheckInGuardianService));
  });

  it('1. Initializes default personal status and peer check-in prompts', () => {
    expect(service.myStatus()).toBe('ENERGIZED');
    expect(service.peerCheckIns().length).toBe(2);
    expect(service.activeCheckInPromptsCount()).toBeGreaterThan(0);
  });

  it('2. Updates personal well-being status and sends compassionate ping to peer', () => {
    service.setMyStatus('WANTS_TALK', 'Looking for a warm voice call.');
    expect(service.myStatus()).toBe('WANTS_TALK');

    service.sendCompassionatePing('peer-102', 'Thinking of you! How are you feeling today?');
    expect(service.peerCheckIns().find(p => p.peerId === 'peer-102')?.hasUnreadCheckInPrompt).toBe(false);
  });
});
