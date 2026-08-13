import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { MedhaSaktiMatrixComponent } from './medha-sakti-matrix.component';
import { PatientStateService } from '../../services/patient-state.service';
import { ThemeService } from '../../services/theme.service';
import { ActuarialLongevityService } from '../../services/actuarial-longevity.service';

describe('MedhaSaktiMatrixComponent', () => {
  const createComponent = () => {
    const mockThemeService = {
      activeTheme: signal<'light' | 'dark'>('dark')
    };

    const mockPatientState = {
      vitals: signal({ bp: '120/80', hr: '72', temp: '98.6', spO2: '98', weight: '70', height: '175', vitC: '', vitD3: '', magnesium: '', zinc: '', b12: '' }),
      medications: signal([]),
      occupation: signal('Polymath & Renaissance Scholar'),
      occupationalProfile: signal(new ActuarialLongevityService().getOccupationalProfile('Polymath'))
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: ActuarialLongevityService, useValue: new ActuarialLongevityService() }
      ]
    });

    return runInInjectionContext(injector, () => new MedhaSaktiMatrixComponent());
  };

  it('should create MedhaSaktiMatrixComponent', () => {
    const comp = createComponent();
    expect(comp).toBeTruthy();
  });

  it('should calculate Grahana, Dharana, and Smarana Sakti percentages correctly', () => {
    const comp = createComponent();
    expect(comp.grahanaSakti()).toBeGreaterThanOrEqual(80);
    expect(comp.dharanaSakti()).toBeGreaterThanOrEqual(70);
    expect(comp.smaranaSakti()).toBeGreaterThanOrEqual(80);
    expect(comp.overallMedhaIndex()).toBeGreaterThanOrEqual(80);
  });

  it('should toggle Solfeggio 528 Hz sync state', () => {
    const comp = createComponent();
    expect(comp.isSolfeggioActive()).toBe(false);

    comp.toggleSolfeggioSync();
    expect(comp.isSolfeggioActive()).toBe(true);
    expect(comp.smaranaSakti()).toBeGreaterThan(88);

    comp.toggleSolfeggioSync();
    expect(comp.isSolfeggioActive()).toBe(false);
  });

  it('should allow selecting and unselecting a botanical herb card for deep clinical details', () => {
    const comp = createComponent();
    expect(comp.selectedHerb()).toBeNull();

    const brahmi = comp.medhaHerbs[0];
    comp.selectHerb(brahmi);
    expect(comp.selectedHerb()).toEqual(brahmi);
    expect(comp.selectedHerb()?.phytochemicals).toContain('Bacoside A');

    // Toggling off
    comp.selectHerb(brahmi);
    expect(comp.selectedHerb()).toBeNull();
  });
});

