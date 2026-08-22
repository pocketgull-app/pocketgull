import { Injector, runInInjectionContext, signal } from '@angular/core';
import { EnvironmentalExposomicsToxicologyComponent } from './environmental-exposomics-toxicology.component';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { GlobalHealthInitiativesService } from '../services/global-health-initiatives.service';

describe('EnvironmentalExposomicsToxicologyComponent', () => {
  const createComponent = () => {
    const mockPatient = {
      id: 'pt-001',
      name: 'Eleanor Vance',
      age: 54,
      gender: 'Female' as const,
      vitals: { bp: '138/88', hr: '74', spO2: '98' },
      preexistingConditions: ['Essential Hypertension'],
      history: [],
      bookmarks: [],
      issues: {}
    };

    const mockPatientState = {
      vitals: signal(mockPatient.vitals),
      issues: signal({})
    };

    const mockPatientManager = {
      selectedPatientId: signal('pt-001'),
      patients: signal([mockPatient])
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: PatientManagementService, useValue: mockPatientManager },
        { provide: GlobalHealthInitiativesService, useClass: GlobalHealthInitiativesService }
      ]
    });

    return runInInjectionContext(injector, () => new EnvironmentalExposomicsToxicologyComponent());
  };

  it('1. Initializes in acute toxicology mode and computes cholinergic toxidrome', () => {
    const comp = createComponent();
    expect(comp.activeTab()).toBe('toxicology');
    expect(comp.selectedToxidrome()).toBe('cholinergic');

    const tox = comp.toxidromeAssessment();
    expect(tox.severity).toBe('CRITICAL');
    expect(tox.antidoteOrders.some(a => a.drug.includes('Atropine'))).toBe(true);
    expect(tox.antidoteOrders.some(a => a.drug.includes('Pralidoxime'))).toBe(true);
  });

  it('2. Switches toxidrome selector to botanical aconite and opioid protocols', () => {
    const comp = createComponent();
    comp.selectedToxidrome.set('botanical_aconite');
    let tox = comp.toxidromeAssessment();
    expect(tox.title).toContain('Botanical Alkaloid');
    expect(tox.antidoteOrders.some(a => a.drug.includes('Magnesium'))).toBe(true);

    comp.selectedToxidrome.set('opioid');
    tox = comp.toxidromeAssessment();
    expect(tox.title).toContain('Opioid Overdose');
    expect(tox.antidoteOrders.some(a => a.drug.includes('Naloxone'))).toBe(true);
  });

  it('3. Switches tab to PFAS & Exposomics and computes clearance parameters', () => {
    const comp = createComponent();
    comp.activeTab.set('pfas_exposomics');
    expect(comp.activeTab()).toBe('pfas_exposomics');

    const pfas = comp.pfasAssessment();
    expect(pfas.estimatedSerumPfasNgMl).toBeGreaterThan(20);
    expect(pfas.acceleratedHalfLifeYears).toBeLessThan(pfas.halfLifeYearsStandard);
    expect(pfas.hepaticPhase2Protocols.length).toBeGreaterThan(0);
    expect(pfas.solubleBinderOrders.length).toBeGreaterThan(0);
  });
});
