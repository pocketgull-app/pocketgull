import '@angular/compiler';
import * as DOMPurify from 'dompurify';
import { CarePlanPrintPreviewComponent } from './care-plan-print-preview.component';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { ExportService } from '../services/export.service';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { AdobeFireflyTextureService } from '../services/adobe-firefly-texture.service';

// Mock Angular effect to avoid ChangeDetectionScheduler requirement in headless Vitest tests
vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    effect: () => ({ destroy: () => {} })
  };
});

describe('CarePlanPrintPreviewComponent - Care Plan Print Studio & Document Carousel', () => {
  let component: CarePlanPrintPreviewComponent;
  let mockPatientState: any;
  let mockPatientManagement: any;
  let mockExportService: any;
  let mockClinicalIntelligence: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockPatientState = {
      activePhilosophy: signal('western'),
      selectedCognitiveLevel: signal('standard'),
      patientId: signal('P001'),
      vitals: signal({ hr: '72', bp: '120/80', temp: '98.6°F', spO2: '98%' }),
      prescribedToolsList: signal([
        { id: 'tool_1', name: 'Diurnal Clock', personalizedInstruction: 'Daily 10m sunshine', suggestedUsage: 'Morning', patientCareTip: 'Walk outside' }
      ]),
      removePrescribedTool: vi.fn(),
      addClinicalNote: vi.fn()
    };

    mockPatientManagement = {
      selectedPatientId: signal('P001'),
      patients: signal([{ id: 'P001', name: 'Anonymous Patient' }])
    };

    mockExportService = {
      exportToPdf: vi.fn()
    };

    mockClinicalIntelligence = {
      isLoading: signal(false)
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState },
      { provide: PatientManagementService, useValue: mockPatientManagement },
      { provide: ExportService, useValue: mockExportService },
      { provide: ClinicalIntelligenceService, useValue: mockClinicalIntelligence },
      { provide: AdobeFireflyTextureService, useValue: {} }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new CarePlanPrintPreviewComponent();
    });
  });

  it('should instantiate with default page 0 selected', () => {
    expect(component).toBeTruthy();
    expect(component.activePageIndex()).toBe(0);
    expect(component.printPages.length).toBe(5);
  });

  it('should navigate through document carousel pages using nextPage and prevPage', () => {
    component.nextPage();
    expect(component.activePageIndex()).toBe(1);

    component.prevPage();
    expect(component.activePageIndex()).toBe(0);
  });

  it('should toggle edit box state', () => {
    expect(component.isEditBoxOpen()).toBe(false);
    component.toggleEditBox();
    expect(component.isEditBoxOpen()).toBe(true);
  });
});
