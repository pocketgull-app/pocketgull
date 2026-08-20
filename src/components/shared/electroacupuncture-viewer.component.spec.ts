import '@angular/compiler';
import { vi } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';

// Mock Angular effect to avoid ChangeDetectionScheduler requirement in headless Vitest tests
vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    effect: () => ({ destroy: () => {} }),
    afterNextRender: () => {}
  };
});

import { ElectroacupunctureViewerComponent } from './electroacupuncture-viewer.component';
import { ElectroacupunctureService } from '../../services/electroacupuncture.service';

describe('ElectroacupunctureViewerComponent', () => {
  let component: ElectroacupunctureViewerComponent;
  let service: ElectroacupunctureService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        ElectroacupunctureService,
        ElectroacupunctureViewerComponent
      ]
    });

    service = injector.get(ElectroacupunctureService);
    component = runInInjectionContext(injector, () => injector.get(ElectroacupunctureViewerComponent));
  });

  it('should initialize Electroacupuncture viewer with service', () => {
    expect(component).toBeTruthy();
    expect(component.ea).toBeTruthy();
    expect(service.frequencyHz()).toBe(10);
  });

  it('should toggle stimulation on button click', () => {
    component.toggleStimulation();
    expect(service.isRunning()).toBe(true);

    component.toggleStimulation();
    expect(service.isRunning()).toBe(false);
  });

  it('should update current intensity and frequency via input events', () => {
    const intensityEvent = {
      target: { value: '3.2' }
    } as unknown as Event;
    component.onIntensityChange(intensityEvent);
    expect(service.intensityMa()).toBe(3.2);

    const freqEvent = {
      target: { value: '80' }
    } as unknown as Event;
    component.onFrequencyChange(freqEvent);
    expect(service.frequencyHz()).toBe(80);
  });

  it('should format seconds into MM:SS format correctly', () => {
    expect(component.formatTime(0)).toBe('00:00');
    expect(component.formatTime(65)).toBe('01:05');
    expect(component.formatTime(600)).toBe('10:00');
  });
});
