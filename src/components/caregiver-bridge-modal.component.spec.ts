import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { CaregiverBridgeModalComponent } from './caregiver-bridge-modal.component';
import { PatientStateService } from '../services/patient-state.service';
import { ExportService } from '../services/export.service';
import { HipaaPdfExportService } from '../services/hipaa-pdf-export.service';

describe('CaregiverBridgeModalComponent', () => {
  let component: CaregiverBridgeModalComponent;
  let mockPatientState: any;
  let mockExportService: any;
  let mockPdfExportService: any;

  beforeEach(() => {
    mockPatientState = {
      getCurrentState: vi.fn().mockReturnValue({})
    };
    mockExportService = {
      exportPdfReport: vi.fn(),
      exportFhirBundle: vi.fn()
    };
    mockPdfExportService = {
      generatePdf: vi.fn()
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: ExportService, useValue: mockExportService },
        { provide: HipaaPdfExportService, useValue: mockPdfExportService }
      ]
    });

    component = runInInjectionContext(injector, () => new CaregiverBridgeModalComponent());
  });

  it('should initialize with default privacy and scope settings', () => {
    expect(component.maskPhi()).toBe(true);
    expect(component.shareScope()).toBe('habits_only');
    expect(component.generatedShareUrl()).toContain('scope=habits_only');
  });

  it('should update share URL when scope or privacy settings change', () => {
    component.shareScope.set('full');
    expect(component.generatedShareUrl()).toContain('scope=full');

    component.maskPhi.set(false);
    expect(component.generatedShareUrl()).toContain('masked=0');
  });

  it('should emit close event on closeModal call', () => {
    let closed = false;
    component.close.subscribe(() => closed = true);

    component.closeModal();
    expect(closed).toBe(true);
  });
});
