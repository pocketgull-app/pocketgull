import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { EyesFreeAccessibilityHubComponent } from './eyes-free-accessibility-hub.component';
import { EyesFreeAccessibilityService } from '../services/eyes-free-accessibility.service';

describe('EyesFreeAccessibilityHubComponent Unit Suite', () => {
  let comp: EyesFreeAccessibilityHubComponent;
  let service: EyesFreeAccessibilityService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        EyesFreeAccessibilityHubComponent,
        EyesFreeAccessibilityService
      ]
    });
    comp = runInInjectionContext(injector, () => injector.get(EyesFreeAccessibilityHubComponent));
    service = comp.service;
  });

  it('1. Initializes cleanly with service injection', () => {
    expect(comp).toBeTruthy();
    expect(service.isEyesFreeModeActive()).toBe(false);
  });

  it('2. Triggers biometric sonification for heart rate and updates service state', () => {
    comp.sonifyHeartRate();
    expect(service.activeSonificationStatus()).toContain('72 beats per minute');
  });

  it('3. Triggers medication earcon and reads description aloud', () => {
    const med = service.tactileMedications()[0];
    comp.playEarcon(med);
    expect(service.lastScreenReaderAnnouncement()).toContain('Played audio earcon chime');

    comp.describeMedication(med);
    expect(service.lastScreenReaderAnnouncement()).toContain('Metformin HCl');
  });
});
