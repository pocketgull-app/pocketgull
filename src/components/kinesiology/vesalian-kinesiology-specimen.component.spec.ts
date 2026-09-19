import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { VesalianKinesiologySpecimenComponent } from './vesalian-kinesiology-specimen.component';
import { KinesiologyBiomechanicsService } from '../../services/kinesiology-biomechanics.service';

describe('VesalianKinesiologySpecimenComponent', () => {
  let component: VesalianKinesiologySpecimenComponent;
  let biomechanics: KinesiologyBiomechanicsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [VesalianKinesiologySpecimenComponent],
      providers: [KinesiologyBiomechanicsService]
    });
    const fixture = TestBed.createComponent(VesalianKinesiologySpecimenComponent);
    component = fixture.componentInstance;
    biomechanics = TestBed.inject(KinesiologyBiomechanicsService);
  });

  it('should initialize with normal gait preset and playing state', () => {
    expect(component.activePreset()).toBe('normal_gait');
    expect(component.isPlaying()).toBe(true);
    expect(component.showHistology()).toBe(true);
  });

  it('should toggle histology on and off', () => {
    component.toggleHistology();
    expect(component.showHistology()).toBe(false);

    component.toggleHistology();
    expect(component.showHistology()).toBe(true);
  });

  it('should toggle playback state', () => {
    component.togglePlay();
    expect(component.isPlaying()).toBe(false);

    component.togglePlay();
    expect(component.isPlaying()).toBe(true);
  });

  it('should switch to Romberg test preset and set midstance posture', () => {
    component.setPreset('romberg_balance');
    expect(component.activePreset()).toBe('romberg_balance');
    expect(component.isPlaying()).toBe(false);
    expect(biomechanics.activeGaitProgress()).toBe(0.40);
  });

  it('should switch to Tandem Neuro Walk preset', () => {
    component.setPreset('tandem_neuro');
    expect(component.activePreset()).toBe('tandem_neuro');
    expect(component.isPlaying()).toBe(false);
    expect(biomechanics.activeGaitProgress()).toBe(0.05);
  });

  it('should generate sanitized SVG markup for the anatomical figure', () => {
    const svg = component.sanitizedSvg();
    expect(svg).toBeDefined();
  });
});
