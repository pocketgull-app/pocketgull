import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { AlphaStemViewerComponent } from './alpha-stem-viewer.component';
import { AlphaStemService } from '../../services/alpha-stem.service';

describe('AlphaStemViewerComponent UI Suite', () => {
  let component: AlphaStemViewerComponent;
  let service: AlphaStemService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        AlphaStemService,
        AlphaStemViewerComponent
      ]
    });

    service = injector.get(AlphaStemService);
    component = runInInjectionContext(injector, () => injector.get(AlphaStemViewerComponent));
  });

  it('should initialize AlphaStem viewer with service', () => {
    expect(component).toBeTruthy();
    expect(component.stem).toBeTruthy();
    expect(service.biologicalAgeYears()).toBe(54);
  });

  it('should update substrate stiffness on input event', () => {
    const mockEvent = {
      target: { value: '28' }
    } as unknown as Event;

    component.onStiffnessChange(mockEvent);
    expect(service.substrateStiffnessKpa()).toBe(28);
    expect(service.lineageProbability().dominantLineage).toBe('Osteogenic (Cortical Bone/Osteoblast)');
  });

  it('should trigger and reset Yamanaka reprogramming through service', () => {
    service.triggerYamanakaReprogramming(35);
    expect(service.yamanakaFactorsActive()).toBe(true);
    expect(service.biologicalAgeYears()).toBe(35);

    service.resetReprogramming();
    expect(service.yamanakaFactorsActive()).toBe(false);
  });
});
