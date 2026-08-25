import '@angular/compiler';
import { EyesFreeAccessibilityService } from './eyes-free-accessibility.service';

describe('EyesFreeAccessibilityService Unit Suite', () => {
  let service: EyesFreeAccessibilityService;

  beforeEach(() => {
    service = new EyesFreeAccessibilityService();
  });

  it('1. Initializes cleanly with Eyes-Free mode disabled and loaded tactile medications', () => {
    expect(service).toBeTruthy();
    expect(service.isEyesFreeModeActive()).toBe(false);
    expect(service.tactileMedications().length).toBeGreaterThanOrEqual(3);
  });

  it('2. Toggles Eyes-Free Mode and broadcasts screen reader announcement', () => {
    service.toggleEyesFreeMode();
    expect(service.isEyesFreeModeActive()).toBe(true);
    expect(service.lastScreenReaderAnnouncement()).toContain('Eyes-Free Accessibility Mode is now Active');

    service.toggleEyesFreeMode();
    expect(service.isEyesFreeModeActive()).toBe(false);
    expect(service.lastScreenReaderAnnouncement()).toContain('turned off');
  });

  it('3. Generates biometric sonification status for heart rate, glucose, and respiration', () => {
    service.sonifyVitalSign('heartRate', 72);
    expect(service.activeSonificationStatus()).toContain('Heart rate sonification: 72 beats per minute');

    service.sonifyVitalSign('glucose', 115);
    expect(service.activeSonificationStatus()).toContain('Blood glucose sonification: 115 milligrams per deciliter');

    service.sonifyVitalSign('respiration', 14);
    expect(service.activeSonificationStatus()).toContain('Respiration cadence sonification: 14 breaths per minute');
  });

  it('4. Handles tactile shape descriptions and earcon frequencies cleanly', () => {
    const med = service.tactileMedications()[0];
    expect(med.medicationName).toBe('Metformin HCl');
    expect(med.tactileShapeDescription).toContain('tactile centerline score');
    expect(med.audioEarconFrequencyHz).toBeGreaterThan(200);
  });
});
