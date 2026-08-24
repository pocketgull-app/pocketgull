import { Injector, runInInjectionContext } from '@angular/core';
import { AkovosLongevityHubComponent } from './akovos-longevity-hub.component';
import { AkovosLongevityService } from '../services/akovos-longevity.service';

describe('AkovosLongevityHubComponent Invariant & Tab Flow Suite', () => {
  let component: AkovosLongevityHubComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: AkovosLongevityService, useClass: AkovosLongevityService }
      ]
    });

    component = runInInjectionContext(injector, () => new AkovosLongevityHubComponent());
  });

  it('1. Initializes on Botanicals tab by default with full Taygetos pharmacopoeia', () => {
    expect(component.activeTab()).toBe('botanicals');
    expect(component.longevityService.botanicals().length).toBeGreaterThan(0);
  });

  it('2. Computes reactive incline biomechanics calculations when sliders change', () => {
    component.userWeightKg.set(80);
    component.walkMinutes.set(60);
    component.inclineGrade.set(20);

    const result = component.currentInclineResult();
    expect(result.durationMinutes).toBe(60);
    expect(result.inclineGradePercent).toBe(20);
    expect(result.estimatedCaloriesBurned).toBeGreaterThan(300);
    expect(result.postprandialGlucoseDropMgDl).toBeGreaterThan(30);
  });

  it('3. Supports switching tabs across all 4 Arcadian longevity pillars', () => {
    component.activeTab.set('incline');
    expect(component.activeTab()).toBe('incline');

    component.activeTab.set('evoo');
    expect(component.activeTab()).toBe('evoo');

    component.activeTab.set('circadian');
    expect(component.activeTab()).toBe('circadian');
  });
});
