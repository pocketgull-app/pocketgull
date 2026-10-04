import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FhirPassportModalComponent } from './fhir-passport-modal.component';
import { PatientStateService } from '../../services/patient-state.service';
import { PatientManagementService } from '../../services/patient-management.service';
import { ExportService } from '../../services/export.service';
import { signal } from '@angular/core';

describe('FhirPassportModalComponent', () => {
  let component: FhirPassportModalComponent;
  let fixture: ComponentFixture<FhirPassportModalComponent>;
  let mockPatientState: any;
  let mockPatientManagement: any;
  let mockExportService: any;

  beforeEach(async () => {
    mockPatientState = {
      patientName: signal('John Doe'),
      vitals: signal({ hr: '72', bp: '120/80', spO2: '98%' }),
      symptoms: signal(['Headache', 'Fatigue']),
      issues: signal(['migraine']),
      prescribedToolsList: signal([
        { id: 'tool-001', name: 'Vagal Resonant Breathing Guide', category: 'Autonomic Pacing' }
      ])
    };

    mockPatientManagement = {
      selectedPatient: signal({
        id: 'patient-test-001',
        name: 'Jane Smith',
        preexistingConditions: ['Essential Hypertension (I10)']
      })
    };

    mockExportService = {
      downloadAsFhirBundle: vi.fn(),
      buildFhirR4Bundle: vi.fn().mockReturnValue({ resourceType: 'Bundle', entry: [] })
    };

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined)
      },
      writable: true,
      configurable: true
    });

    await TestBed.configureTestingModule({
      imports: [FhirPassportModalComponent],
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: PatientManagementService, useValue: mockPatientManagement },
        { provide: ExportService, useValue: mockExportService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FhirPassportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and computes patient demographics and FHIR passport verification URL', () => {
    expect(component).toBeTruthy();
    expect(component.patientName()).toBe('Jane Smith');
    expect(component.fhirId()).toBe('patient-test-001');
    expect(component.passportVerificationUrl()).toContain('https://pocketgull.app/verify/fhir-passport');
    expect(component.passportVerificationUrl()).toContain('id=patient-test-001');
    expect(component.passportVerificationUrl()).toContain('Jane%20Smith');
  });

  it('2. Computes active preexisting conditions from selected patient', () => {
    expect(component.activeConditions()).toEqual(['Essential Hypertension (I10)']);
  });

  it('3. Falls back cleanly when selectedPatient is null', () => {
    mockPatientManagement.selectedPatient.set(null);
    fixture.detectChanges();

    expect(component.patientName()).toBe('John Doe');
    expect(component.fhirId()).toBe('p_001_fhir_r4');
    expect(component.activeConditions()).toContain('Cardiometabolic Baseline');
  });

  it('4. Emits closeModal event when modal close action is triggered', () => {
    const closeSpy = vi.fn();
    component.closeModal.subscribe(closeSpy);

    component.closeModal.emit();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('5. Invokes exportService to download FHIR R4 Bundle when downloadJson is called', () => {
    component.downloadJson();
    expect(mockExportService.downloadAsFhirBundle).toHaveBeenCalledWith(expect.objectContaining({
      id: 'patient-test-001',
      name: 'Jane Smith'
    }));
  });
});
