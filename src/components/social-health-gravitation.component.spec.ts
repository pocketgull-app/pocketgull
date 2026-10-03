import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { SocialHealthGravitationComponent } from './social-health-gravitation.component';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

describe('SocialHealthGravitationComponent Unit Suite', () => {
  let component: SocialHealthGravitationComponent;

  beforeEach(async () => {
    const mockPatient = {
      id: 'p_mara_santos',
      name: 'Mara Santos',
      preexistingConditions: ['Multiple Sclerosis', 'Cognitive Fog'],
      reasonForVisit: 'Gait imbalance and heat intolerance'
    };

    const mockPatientManager = {
      selectedPatientId: signal('p_mara_santos'),
      patients: signal([mockPatient])
    };

    await TestBed.configureTestingModule({
      imports: [SocialHealthGravitationComponent],
      providers: [
        { provide: PatientStateService, useValue: { patientId: signal('p_mara_santos') } },
        { provide: PatientManagementService, useValue: mockPatientManager }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(SocialHealthGravitationComponent);
    component = fixture.componentInstance;
  });

  it('1. Instantiates successfully with default filterMode as all', () => {
    expect(component).toBeTruthy();
    expect(component.filterMode()).toBe('all');
    expect(component.activePatientName()).toBe('Mara Santos');
  });

  it('2. Computes tailored social gravitation vectors for Mara Santos', () => {
    const vecs = component.vectors();
    expect(vecs.length).toBeGreaterThan(0);
    expect(vecs[0].name).toContain('Cooling Hydrotherapy');
    expect(vecs[0].coherenceMatchPercent).toBeGreaterThanOrEqual(90);
  });

  it('3. Changes filter mode between all, gravitate, and avoid', () => {
    component.filterMode.set('gravitate');
    expect(component.filterMode()).toBe('gravitate');

    component.filterMode.set('avoid');
    expect(component.filterMode()).toBe('avoid');
  });

  it('4. Provides fallback patient name when no patient selected', () => {
    const fixture = TestBed.createComponent(SocialHealthGravitationComponent);
    const mockEmptyManager = {
      selectedPatientId: signal(null),
      patients: signal([])
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [SocialHealthGravitationComponent],
      providers: [
        { provide: PatientStateService, useValue: {} },
        { provide: PatientManagementService, useValue: mockEmptyManager }
      ]
    });
    const fix = TestBed.createComponent(SocialHealthGravitationComponent);
    expect(fix.componentInstance.activePatientName()).toBe('Homo Sapiens');
  });
});
