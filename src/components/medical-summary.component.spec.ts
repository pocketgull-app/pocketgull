import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MedicalChartSummaryComponent } from './medical-summary.component';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { ExportService } from '../services/export.service';
import { FhirIntegrationService } from '../services/fhir/fhir-integration.service';
import { DictationService } from '../services/dictation.service';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { OrcidService } from '../services/orcid.service';
import { PythonBridgeService } from '../services/python-bridge.service';
import { ClinicalAssessmentsService } from '../services/clinical-assessments/clinical-assessments.service';
import { YbocsService } from '../services/ybocs/ybocs.service';
import { AcronymExpanderService } from '../services/acronym-expander.service';
import { DocDrillService } from '../services/doc-drill.service';

describe('MedicalChartSummaryComponent Unit Suite', () => {
  let component: MedicalChartSummaryComponent;

  beforeEach(async () => {
    const mockState = {
      patientId: signal('p001'),
      patientName: signal('Eleanor Vance'),
      patientAge: signal(71),
      patientGender: signal('Female'),
      occupation: signal('Botanist'),
      vitals: signal({ bp: '128/82', hr: '68', temp: '98.4', spO2: '99', weight: '64kg', height: '162cm' }),
      issues: signal({}),
      symptoms: signal([]),
      conditions: signal([]),
      activePhilosophy: signal('western'),
      isEmergencyMode: signal(false),
      selectedPartId: signal(null),
      anatomyViewMode: signal(null)
    };

    const mockPatientManager = {
      selectedPatient: signal({ id: 'p001', name: 'Eleanor Vance', age: 71, history: [] }),
      selectedPatientId: signal('p001'),
      patients: signal([])
    };

    const mockHttp = {
      get: vi.fn().mockReturnValue(of({ systolic: 120, diastolic: 80, hr: 70 }))
    };

    await TestBed.configureTestingModule({
      imports: [MedicalChartSummaryComponent],
      providers: [
        { provide: PatientStateService, useValue: mockState },
        { provide: PatientManagementService, useValue: mockPatientManager },
        { provide: ExportService, useValue: { exportCsvReport: vi.fn(), exportHl7v2Report: vi.fn() } },
        { provide: FhirIntegrationService, useValue: { getSmartToken: vi.fn() } },
        { provide: DictationService, useValue: { isDictating: signal(false) } },
        { provide: ClinicalIntelligenceService, useValue: { analysisResults: signal({}) } },
        { provide: OrcidService, useValue: { searchOrcid: vi.fn() } },
        { provide: PythonBridgeService, useValue: { isAvailable: signal(false) } },
        { provide: ClinicalAssessmentsService, useValue: { phq9Score: signal(4), gad7Score: signal(3) } },
        { provide: YbocsService, useValue: { totalScore: signal(0) } },
        { provide: AcronymExpanderService, useValue: { expand: (s: string) => s } },
        { provide: DocDrillService, useValue: { activeTopic: signal(null) } },
        { provide: HttpClient, useValue: mockHttp }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(MedicalChartSummaryComponent);
    component = fixture.componentInstance;
  });

  it('1. Instantiates successfully with default states', () => {
    expect(component).toBeTruthy();
    expect(component.isTriageFlipped()).toBe(false);
    expect(component.isBiometricsExpanded()).toBe(false);
    expect(component.showBQBaseline()).toBe(true);
  });

  it('2. Toggles triage flip with debounce guard', () => {
    component.toggleTriageFlip();
    expect(component.isTriageFlipped()).toBe(true);

    // Call immediately within debounce window -> should remain true
    component.toggleTriageFlip();
    expect(component.isTriageFlipped()).toBe(true);
  });

  it('3. Toggles biometrics accordion expansion', () => {
    expect(component.isBiometricsExpanded()).toBe(false);
    component.toggleBiometrics();
    expect(component.isBiometricsExpanded()).toBe(true);
    component.toggleBiometrics();
    expect(component.isBiometricsExpanded()).toBe(false);
  });

  it('4. Manages custom clinical patient fields (add, update, remove)', () => {
    const initialCount = component.customFields().length;
    component.addCustomField();
    expect(component.customFields().length).toBe(initialCount + 1);

    const lastIdx = component.customFields().length - 1;
    component.updateCustomField(lastIdx, 'key', 'Biomarker Target');
    component.updateCustomField(lastIdx, 'value', 'ApoB < 60 mg/dL');

    expect(component.customFields()[lastIdx].key).toBe('Biomarker Target');
    expect(component.customFields()[lastIdx].value).toBe('ApoB < 60 mg/dL');

    component.removeCustomField(lastIdx);
    expect(component.customFields().length).toBe(initialCount);
  });

  it('5. Parses numeric vital string robustly', () => {
    expect(component.parseVitalNum('128/82')).toBe(128);
    expect(component.parseVitalNum('72 bpm')).toBe(72);
    expect(component.parseVitalNum(undefined)).toBe(0);
    expect(component.parseVitalNum('invalid')).toBe(0);
  });

  it('6. Loads baseline telemetry via ngOnInit', async () => {
    await component.ngOnInit();
    expect(component.baselines()).toBeDefined();
    expect(component.baselines().systolic).toBe(120);
  });
});
