import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { LensInsightSparkShieldComponent } from './lens-insight-spark-shield.component';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

describe('LensInsightSparkShieldComponent Unit Suite', () => {
  let component: LensInsightSparkShieldComponent;

  beforeEach(async () => {
    const mockState = {
      vitals: signal({ hr: '92', bp: '135/85' }),
      tcmIntake: signal({ pulseQuality: 'wiry', tongueCoat: 'thick-yellow' }),
      ayurvedicIntake: signal({ prakriti: 'Vata-Pitta' }),
      issues: signal({ lumbago: true })
    };

    const mockPatientManager = {
      selectedPatientId: signal('p001'),
      patients: signal([{ id: 'p001', name: 'Eleanor Vance' }])
    };

    await TestBed.configureTestingModule({
      imports: [LensInsightSparkShieldComponent],
      providers: [
        { provide: PatientStateService, useValue: mockState },
        { provide: PatientManagementService, useValue: mockPatientManager }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(LensInsightSparkShieldComponent);
    component = fixture.componentInstance;
  });

  it('1. Instantiates successfully with default standard view mode', () => {
    expect(component).toBeTruthy();
    expect(component.viewMode()).toBe('standard');
    expect(component.isDrillDownOpen()).toBe(false);
    expect(component.activePatientName()).toBe('Eleanor Vance');
  });

  it('2. Computes multi-paradigm correlation alert (Vagal HRV -> Shen Disharmony)', () => {
    component.sourceMetric.set('Vagal HRV');
    component.targetMetric.set('Shen Disharmony');
    const alert = component.patientCorrelationAlert();
    expect(alert).toBeDefined();
    expect(alert!.type).toBe('perfect');
    expect(alert!.text).toContain('Perfect Match');
  });

  it('3. Computes hs-CRP to Meridian Stagnation correlation with active pain', () => {
    component.sourceMetric.set('hs-CRP');
    component.targetMetric.set('Meridian Stagnation');
    const alert = component.patientCorrelationAlert();
    expect(alert).toBeDefined();
    expect(alert!.type).toBe('perfect');
    expect(alert!.text).toContain('meridian blockage');
  });

  it('4. Toggles view mode between standard, synergy, lab, and inquiry', () => {
    component.viewMode.set('synergy');
    expect(component.viewMode()).toBe('synergy');
    component.viewMode.set('lab');
    expect(component.viewMode()).toBe('lab');
  });

  it('5. Toggles drill-down open state', () => {
    expect(component.isDrillDownOpen()).toBe(false);
    component.isDrillDownOpen.set(true);
    expect(component.isDrillDownOpen()).toBe(true);
  });
});
