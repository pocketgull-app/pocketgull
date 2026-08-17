import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { AutonomicCoherenceBridgeService } from './autonomic-coherence-bridge.service';
import { PeerNetworkService } from './peer-network.service';
import { VisualHapticEntrainmentService } from './visual-haptic-entrainment.service';
import { OpticalCameraVisionService } from './optical-camera-vision.service';
import { PatientStateService } from './patient-state.service';
import { StorageService } from './storage.service';
import { ThemeService } from './theme.service';
import { ActuarialLongevityService } from './actuarial-longevity.service';
import { GamificationService } from './gamification.service';

describe('AutonomicCoherenceBridgeService (Human Connection & Dual Cardiac Entrainment)', () => {
  let service: AutonomicCoherenceBridgeService;

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
        OpticalCameraVisionService,
        VisualHapticEntrainmentService,
        PeerNetworkService,
        AutonomicCoherenceBridgeService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(AutonomicCoherenceBridgeService));
  });

  it('1. Initializes default dual cardiac coherence session and resonance quality label', () => {
    expect(service.isResonanceActive()).toBe(true);
    expect(service.resonanceQualityLabel()).toContain('Coherence');
    expect(service.activeResonanceSession()?.coherenceScorePercent).toBeGreaterThan(90);
  });

  it('2. Starts new dual cardiac entrainment session with a peer', () => {
    service.startResonanceSession({
      peerId: 'peer-102',
      aliasName: 'Dr. Marcus Vance',
      schoolAffiliation: 'Harvard Medical School',
      mascotEmoji: '🩺',
      coherenceScore: 92,
      qrPayloadUrl: '',
      dateConnected: '2026-08-11T12:00:00Z',
      status: 'ONLINE',
      sharingConsent: {
        shareAcousticThemeSong: true,
        shareHapticPulse: true,
        shareSchoolAffiliation: true,
        shareCoherenceScore: true,
        shareJointQuests: true
      }
    }, 72, 74);

    expect(service.activeResonanceSession()?.peerName).toBe('Dr. Marcus Vance');
    expect(service.activeResonanceSession()?.coherenceScorePercent).toBeGreaterThan(90);

    service.endResonanceSession();
    expect(service.isResonanceActive()).toBe(false);
  });
});
