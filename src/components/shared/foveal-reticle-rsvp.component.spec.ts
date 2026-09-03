import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { FovealReticleRsvpComponent } from './foveal-reticle-rsvp.component';
import { BionicReadingService } from '../../services/bionic-reading.service';

describe('FovealReticleRsvpComponent Unit Suite', () => {
  let component: FovealReticleRsvpComponent;
  let bionicService: BionicReadingService;

  const createComponent = (sampleText = 'Patient exhibits sinus bradycardia with predniSONE 20mg.') => {
    bionicService = new BionicReadingService();
    const injector = Injector.create({
      providers: [
        { provide: BionicReadingService, useValue: bionicService }
      ]
    });

    component = runInInjectionContext(injector, () => new FovealReticleRsvpComponent());
    (component as any).text = signal(sampleText);
    (component as any).isOpen = signal(true);
    return component;
  };

  beforeEach(() => {
    createComponent();
  });

  afterEach(() => {
    component?.ngOnDestroy();
  });

  it('1. Tokenizes input text into structured clinical stream', () => {
    expect(component.tokens().length).toBe(7);
    expect(component.tokens()[0].coreWord).toBe('Patient');
    expect(component.tokens()[3].category).toBe('medical-morpheme'); // bradycardia
    expect(component.tokens()[3].fixation).toBe('brady');
    expect(component.tokens()[5].category).toBe('medication-tallman'); // predniSONE
  });

  it('2. Centers the initial ORP character on reticle', () => {
    const token = component.currentToken();
    expect(token).toBeTruthy();
    expect(token!.coreWord).toBe('Patient');
    expect(token!.orpIndex).toBe(2); // 7 letters -> ORP index 2 ('t')
    expect(token!.orpChar).toBe('t');
    expect(token!.leftOfOrp).toBe('Pa');
    expect(token!.rightOfOrp).toBe('ient');
  });

  it('3. Computes progress percentage as stream advances', () => {
    expect(component.progressPercent()).toBe(14); // 1 / 7 = 14%
    component.stepRelative(3);
    expect(component.currentIndex()).toBe(3);
    expect(component.progressPercent()).toBe(57); // 4 / 7 = 57%
  });

  it('4. Toggles stream playback between playing and paused', () => {
    expect(component.isPlaying()).toBe(false);
    component.togglePlay();
    expect(component.isPlaying()).toBe(true);
    component.togglePlay();
    expect(component.isPlaying()).toBe(false);
  });

  it('5. Adjusts WPM velocity within 300 to 1000 WPM range', () => {
    component.setWpm(750);
    expect(component.wpm()).toBe(750);
    expect(bionicService.rsvpSpeedWpm()).toBe(750);
  });

  it('6. Emits close event when requested', () => {
    let closed = false;
    component.close.subscribe(() => {
      closed = true;
    });
    component.closeReader();
    expect(closed).toBe(true);
    expect(component.isPlaying()).toBe(false);
  });
});
