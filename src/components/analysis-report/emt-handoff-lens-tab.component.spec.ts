import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { EmtHandoffLensTabComponent } from './emt-handoff-lens-tab.component';
import { PatientStateService } from '../../services/patient-state.service';
import { PatientManagementService } from '../../services/patient-management.service';

describe('EmtHandoffLensTabComponent Unit Suite', () => {
  let component: EmtHandoffLensTabComponent;

  beforeEach(async () => {
    const mockState = {
      vitals: signal({ hr: '110', spO2: '94%', bp: '138/88', temp: '99.1' }),
      clinicalNotes: signal(['Acute dyspnea and wheezing in field.']),
      patientName: signal('Jane Doe'),
      patientAge: signal(34),
      patientGender: signal('Female')
    };

    const mockPatientManager = {
      selectedPatient: signal({ id: 'p001', name: 'Jane Doe' }),
      selectedPatientId: signal('p001')
    };

    await TestBed.configureTestingModule({
      imports: [EmtHandoffLensTabComponent],
      providers: [
        { provide: PatientStateService, useValue: mockState },
        { provide: PatientManagementService, useValue: mockPatientManager }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(EmtHandoffLensTabComponent);
    component = fixture.componentInstance;
  });

  it('1. Instantiates successfully with CPR metronome inactive', () => {
    expect(component).toBeTruthy();
    expect(component.isCprMetronomeActive()).toBe(false);
    expect(component.patientAgeCategory()).toBe('adult');
    expect(component.activeFirstAidGuide()).toBeNull();
  });

  it('2. Computes 911 SMS broadcast href with GPS coordinates', () => {
    const sms = component.smsHref();
    expect(sms).toContain('sms:911?body=');
    expect(sms).toContain(encodeURIComponent('Emergency! Bystander first aid in progress'));
  });

  it('3. Generates FHIR R4 Bundle JSON string containing field vitals', () => {
    const fhirJson = component.fhirJsonString();
    expect(fhirJson).toBeDefined();
    const parsed = JSON.parse(fhirJson);
    expect(parsed.resourceType).toBe('Bundle');
    expect(parsed.entry.length).toBeGreaterThan(0);
    const hrEntry = parsed.entry.find((e: any) => e.resource.code?.text === 'Heart Rate');
    expect(hrEntry).toBeDefined();
  });

  it('4. Selects active first aid triage guides', () => {
    component.activeFirstAidGuide.set('choking');
    expect(component.activeFirstAidGuide()).toBe('choking');
    component.activeFirstAidGuide.set('overdose');
    expect(component.activeFirstAidGuide()).toBe('overdose');
  });

  it('5. Switches demographic age categories', () => {
    component.patientAgeCategory.set('pediatric' as any);
    expect(component.patientAgeCategory()).toBe('pediatric');
    component.isPatientPregnant.set(true);
    expect(component.isPatientPregnant()).toBe(true);
  });
});
