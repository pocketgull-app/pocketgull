import '@angular/compiler';
import { PrecisionNutritionCalculatorComponent } from './precision-nutrition-calculator.component';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { PatientStateService } from '../services/patient-state.service';
import { ThemeService } from '../services/theme.service';

describe('PrecisionNutritionCalculatorComponent', () => {
  let component: PrecisionNutritionCalculatorComponent;
  let mockPatientState: any;
  let mockThemeService: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockPatientState = {
      vitals: signal({ hr: '72', spO2: '98%', cgmGlucoseMgDl: 95 })
    };

    mockThemeService = {
      isDarkMode: signal(true)
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState },
      { provide: ThemeService, useValue: mockThemeService }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new PrecisionNutritionCalculatorComponent();
    });
  });

  it('should initialize with default feeding start hour and functional food list', () => {
    expect(component.feedingStartHour()).toBe(10);
    expect(component.functionalFoods().length).toBeGreaterThanOrEqual(6);
  });

  it('should attenuate predicted peak glucose spike when fiber buffer is active', () => {
    component.carbGrams.set(50);
    
    component.hasFiberBuffer.set(false);
    const spikeWithoutBuffer = component.estimatedPeakGlucose();

    component.hasFiberBuffer.set(true);
    const spikeWithBuffer = component.estimatedPeakGlucose();

    expect(spikeWithBuffer).toBeLessThan(spikeWithoutBuffer);
  });
});
