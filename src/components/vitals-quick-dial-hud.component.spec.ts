import '@angular/compiler';
import { vi } from 'vitest';
import { VitalsQuickDialHudComponent } from './vitals-quick-dial-hud.component';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { PatientStateService } from '../services/patient-state.service';

describe('VitalsQuickDialHudComponent - 1-Thumb Touch Data Entry HUD', () => {
  let component: VitalsQuickDialHudComponent;
  let mockPatientState: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockPatientState = {
      vitals: signal({ hr: '72', bp: '120/80', temp: '98.6°F', spO2: '98%' }),
      updateVital: vi.fn()
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new VitalsQuickDialHudComponent();
    });
  });

  it('should initialize with HR active target', () => {
    expect(component.activeTarget()).toBe('hr');
    expect(component.currentValue()).toBe(72);
    expect(component.currentUnit()).toBe('bpm');
  });

  it('should adjust value using 1-thumb stepper controls', () => {
    component.adjustValue(5);
    expect(component.currentValue()).toBe(77);

    component.adjustValue(-1);
    expect(component.currentValue()).toBe(76);
  });

  it('should commit HR, BP, Temp, and SpO2 to PatientStateService', () => {
    // 1. Commit HR
    component.tempHr.set(80);
    component.commitActiveVital();
    expect(mockPatientState.updateVital).toHaveBeenCalledWith('hr', '80');

    // 2. Commit BP
    component.activeTarget.set('bp_sys');
    component.tempSys.set(130);
    component.tempDia.set(85);
    component.commitActiveVital();
    expect(mockPatientState.updateVital).toHaveBeenCalledWith('bp', '130/85');

    // 3. Commit Temp
    component.activeTarget.set('temp');
    component.tempTemperature.set(99.2);
    component.commitActiveVital();
    expect(mockPatientState.updateVital).toHaveBeenCalledWith('temp', '99.2°F');

    // 4. Commit SpO2
    component.activeTarget.set('spO2');
    component.tempSpO2.set(96);
    component.commitActiveVital();
    expect(mockPatientState.updateVital).toHaveBeenCalledWith('spO2', '96%');
  });
});
