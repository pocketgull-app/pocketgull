import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { ClinicalTrajectoryReaderModalComponent } from './clinical-trajectory-reader-modal.component';
import { ClinicalTrajectoryReaderService } from '../../services/clinical-trajectory-reader.service';
import { BionicReadingService } from '../../services/bionic-reading.service';

describe('ClinicalTrajectoryReaderModalComponent Unit Suite', () => {
  let component: ClinicalTrajectoryReaderModalComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: ClinicalTrajectoryReaderService, useClass: ClinicalTrajectoryReaderService },
        { provide: BionicReadingService, useClass: BionicReadingService }
      ]
    });
    component = runInInjectionContext(injector, () => new ClinicalTrajectoryReaderModalComponent());
  });

  it('1. Initializes with default clinician persona and speed', () => {
    expect(component.trajectoryService.persona()).toBe('clinician');
    expect(component.speedWpm()).toBe(450);
    expect(component.isPlaying()).toBe(false);
  });

  it('2. Switches persona and updates tokens', () => {
    component.setPersona('patient');
    expect(component.trajectoryService.persona()).toBe('patient');
    expect(component.tokens().length).toBeGreaterThan(0);
  });

  it('3. Controls RSVP playback stream', () => {
    component.toggleRsvpPlay();
    expect(component.isPlaying()).toBe(true);
    component.toggleRsvpPlay();
    expect(component.isPlaying()).toBe(false);
  });
});
