import '@angular/compiler';
import { vi } from 'vitest';
import { Injector, runInInjectionContext, signal } from '@angular/core';

// Mock Angular effect to avoid ChangeDetectionScheduler requirement in headless Vitest tests
vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    effect: () => ({ destroy: () => {} }),
    afterNextRender: () => {}
  };
});

import { DicomViewerComponent } from './dicom-viewer.component';
import { DicomService } from '../services/dicom.service';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { PatientManagementService } from '../services/patient-management.service';

describe('DicomViewerComponent Advanced Radiomics Suite', () => {
  let component: DicomViewerComponent;
  let mockDicomService: any;
  let mockPatientManager: any;

  beforeEach(() => {
    mockDicomService = {
      studies: signal([
        {
          studyInstanceUid: 'study-1234567890',
          patientName: 'Jane Doe',
          studyDescription: 'CT Lumbar Spine with Contrast',
          studyDate: '20260818',
          modalities: ['CT'],
          seriesCount: 3
        }
      ]),
      selectedStudy: signal(null),
      isLoading: signal(false),
      error: signal(null),
      searchStudies: vi.fn().mockResolvedValue(undefined),
      getRenderedImageUrl: vi.fn().mockReturnValue('data:image/png;base64,mockpng')
    };

    mockPatientManager = {
      selectedPatientId: signal('patient-1'),
      patients: signal([{ id: 'patient-1', name: 'Jane Doe' }])
    };

    const injector = Injector.create({
      providers: [
        { provide: DicomService, useValue: mockDicomService },
        { provide: ClinicalIntelligenceService, useValue: { transcript: signal([]) } },
        { provide: PatientManagementService, useValue: mockPatientManager },
        DicomViewerComponent
      ]
    });

    component = runInInjectionContext(injector, () => injector.get(DicomViewerComponent));
  });

  it('should initialize with default Hounsfield window and tools', () => {
    expect(component).toBeTruthy();
    expect(component.windowWidth()).toBe(1000);
    expect(component.windowLevel()).toBe(0);
    expect(component.activePreset()).toBe('default');
    expect(component.showAiAnomalies()).toBe(true);
  });

  it('should apply clinical Hounsfield window presets', () => {
    component.applyWindowPreset('bone');
    expect(component.activePreset()).toBe('bone');
    expect(component.windowWidth()).toBe(2000);
    expect(component.windowLevel()).toBe(400);

    component.applyWindowPreset('lung');
    expect(component.activePreset()).toBe('lung');
    expect(component.windowWidth()).toBe(1500);
    expect(component.windowLevel()).toBe(-600);

    component.applyWindowPreset('brain');
    expect(component.activePreset()).toBe('brain');
    expect(component.windowWidth()).toBe(80);
    expect(component.windowLevel()).toBe(40);
  });

  it('should compute caliper distance in millimeters', () => {
    component.toggleCaliper();
    expect(component.isCaliperActive()).toBe(true);

    component.caliperStart.set({ x: 100, y: 100 });
    component.caliperEnd.set({ x: 200, y: 100 }); // 100 pixels * 0.45 mm = 45.0 mm

    expect(component.caliperDistanceMm()).toBe(45.0);
  });

  it('should toggle AI anomaly heatmaps and multilingual Nomina labels', () => {
    component.toggleAiAnomalies();
    expect(component.showAiAnomalies()).toBe(false);

    component.toggleNominaLabels();
    expect(component.showNominaLabels()).toBe(true);
  });
});
