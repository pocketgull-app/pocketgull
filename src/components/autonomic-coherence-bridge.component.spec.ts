import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { AutonomicCoherenceBridgeComponent } from './autonomic-coherence-bridge.component';
import { AutonomicCoherenceBridgeService } from '../services/autonomic-coherence-bridge.service';
import { PeerNetworkService } from '../services/peer-network.service';
import { VisualHapticEntrainmentService } from '../services/visual-haptic-entrainment.service';
import { OpticalCameraVisionService } from '../services/optical-camera-vision.service';
import { PatientStateService } from '../services/patient-state.service';
import { StorageService } from '../services/storage.service';
import { ThemeService } from '../services/theme.service';
import { ActuarialLongevityService } from '../services/actuarial-longevity.service';
import { GamificationService } from '../services/gamification.service';

describe('AutonomicCoherenceBridgeComponent', () => {
  let component: AutonomicCoherenceBridgeComponent;

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
        AutonomicCoherenceBridgeService,
        AutonomicCoherenceBridgeComponent
      ]
    });
    component = runInInjectionContext(injector, () => injector.get(AutonomicCoherenceBridgeComponent));
  });

  it('1. Initializes autonomic coherence bridge component with active resonance session', () => {
    expect(component.coherenceService.isResonanceActive()).toBe(true);
    expect(component.peerNetwork.peers().length).toBeGreaterThan(0);
  });
});
