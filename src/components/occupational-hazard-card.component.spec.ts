import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { OccupationalHazardCardComponent } from './occupational-hazard-card.component';
import { PatientStateService } from '../services/patient-state.service';
import { ActuarialLongevityService } from '../services/actuarial-longevity.service';

describe('OccupationalHazardCardComponent', () => {
  const createCard = (occupation = 'Polymath') => {
    const actuarialService = new ActuarialLongevityService();
    const mockPatientState = {
      occupation: signal(occupation),
      occupationalProfile: signal(actuarialService.getOccupationalProfile(occupation))
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: ActuarialLongevityService, useValue: actuarialService }
      ]
    });
    return runInInjectionContext(injector, () => new OccupationalHazardCardComponent());
  };

  it('should initialize and resolve Polymath occupational profile correctly', () => {
    const card = createCard('Polymath');
    const prof = card.profile();

    expect(prof).not.toBeNull();
    expect(prof?.professionTitle).toContain('Polymaths');
    expect(prof?.socCode).toBe('11-1021-POLY');
    expect(prof?.actuarialQalyImpact).toBe(4.2);
    expect(prof?.vocalResonanceProtocol).toContain('Polyphonic Renaissance Choral Glee');
  });

  it('should resolve Swimmer occupational profile correctly', () => {
    const card = createCard('Swimmer');
    const prof = card.profile();

    expect(prof).not.toBeNull();
    expect(prof?.professionTitle).toBe('Endurance & Marathon Swimmers');
    expect(prof?.socCode).toBe('27-2021-SWIM');
    expect(prof?.actuarialQalyImpact).toBe(3.2);
    expect(prof?.vocalResonanceProtocol).toContain('Swimmer Diaphragmatic Breath Glee');
  });
});
