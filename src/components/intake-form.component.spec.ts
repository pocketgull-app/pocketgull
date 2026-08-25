import '@angular/compiler';

vi.mock('@angular/forms', () => ({
  FormsModule: class {},
  ReactiveFormsModule: class {},
  NgControl: class {},
  NgModel: class {}
}));

// Mock Angular constructor effects for headless Vitest environment
vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    effect: () => {
      return {
        destroy: () => {}
      };
    }
  };
});
import { IntakeFormComponent } from './intake-form.component';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { PatientStateService } from '../services/patient-state.service';
import { MarkdownService } from '../services/markdown.service';
import { DictationService } from '../services/dictation.service';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { PatientManagementService } from '../services/patient-management.service';
import { FhirR5TelemetryService } from '../services/fhir-r5-telemetry.service';

describe('IntakeFormComponent - Comprehensive Patient Symptom Intake', () => {
  let component: IntakeFormComponent;
  let mockPatientState: any;
  let mockMarkdown: any;
  let mockDictation: any;
  let mockClinicalIntelligence: any;
  let mockPatientManagement: any;
  let mockFhirR5: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockPatientState = {
      selectedPartId: signal('head'),
      getIssuesForBodyPart: vi.fn().mockReturnValue([]),
      addOrUpdateIssue: vi.fn(),
      removeIssue: vi.fn(),
      selectPart: vi.fn()
    };

    mockMarkdown = {
      renderMarkdown: vi.fn().mockImplementation((text: string) => `<p>${text}</p>`)
    };

    mockDictation = {
      isListening: signal(false),
      startListening: vi.fn(),
      stopListening: vi.fn()
    };

    mockClinicalIntelligence = {
      isLoading: signal(false),
      analyzeSymptomNode: vi.fn()
    };

    mockPatientManagement = {
      activePatient: signal({ id: 'P001', name: 'Anonymous Homo Sapiens (Female, 34y)' })
    };

    mockFhirR5 = {
      logTelemetry: vi.fn()
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState },
      { provide: MarkdownService, useValue: mockMarkdown },
      { provide: DictationService, useValue: mockDictation },
      { provide: ClinicalIntelligenceService, useValue: mockClinicalIntelligence },
      { provide: PatientManagementService, useValue: mockPatientManagement },
      { provide: FhirR5TelemetryService, useValue: mockFhirR5 }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new IntakeFormComponent();
    });
  });

  it('should instantiate successfully with selected body part signal', () => {
    expect(component).toBeTruthy();
    expect(mockPatientState.selectedPartId()).toBe('head');
  });

  it('should call close to reset selected body part ID', () => {
    component.close();
    expect(mockPatientState.selectPart).toHaveBeenCalledWith(null);
  });
});
