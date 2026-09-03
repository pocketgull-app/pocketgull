import '@angular/compiler';
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

  it('should manage Cine-Loop playback state, FPS speed, and frame stepping', () => {
    expect(component.isPlayingCine()).toBe(false);
    expect(component.cineFps()).toBe(24);
    expect(component.cineLoopMode()).toBe('forward');

    component.toggleCinePlayback();
    expect(component.isPlayingCine()).toBe(true);

    component.setFps(60);
    expect(component.cineFps()).toBe(60);

    component.toggleLoopMode();
    expect(component.cineLoopMode()).toBe('pingpong');

    component.stopCine();
    expect(component.isPlayingCine()).toBe(false);

    // Frame stepping
    component.currentSlice.set(10);
    component.stepFrame(1);
    expect(component.currentSlice()).toBe(11);

    component.stepFrame(-1);
    expect(component.currentSlice()).toBe(10);
  });

  it('should initialize multi-frame video studies with custom frame rate', () => {
    const diatomStudy = {
      studyInstanceUid: '1.2.840.113619.2.134.1.phil.diatom',
      patientName: 'Homo Sapiens',
      studyDescription: 'Diatom Frustule Micro-CT (Volumetric Scan)',
      modalities: ['CT'],
      isMultiFrameVideo: true,
      frameCount: 32,
      frameRateFps: 30
    };

    component.selectStudy(diatomStudy);
    expect(component.totalSlices()).toBe(32);
    expect(component.cineFps()).toBe(30);
    expect(component.currentSlice()).toBe(16);
    expect(mockDicomService.getRenderedImageUrl).toHaveBeenCalled();
  });

  it('should support Pre-Op CT and Pre-Op MRI Side-by-Side and Fused Overlay modes', () => {
    expect(component.viewLayout()).toBe('2D_3D');

    // Switch to Side-by-Side Mode
    component.viewLayout.set('SIDE_BY_SIDE_CT_MRI');
    expect(component.viewLayout()).toBe('SIDE_BY_SIDE_CT_MRI');

    // Switch to Fused Overlay Mode
    component.viewLayout.set('FUSED_OVERLAY');
    expect(component.viewLayout()).toBe('FUSED_OVERLAY');

    // Test Alpha Blend Fusion Slider
    expect(component.fusionBlendPercent()).toBe(50);
    component.fusionBlendPercent.set(75);
    expect(component.fusionBlendPercent()).toBe(75);
  });

  it('should render both CT and MRI modality streams in synchronized lock-step', () => {
    const study = {
      studyInstanceUid: 'study-spine-preop',
      patientName: 'Jane Doe',
      studyDescription: 'Pre-Op Spine CT and MRI Series',
      modalities: ['CT', 'MR']
    };

    component.selectStudy(study);
    expect(component.currentCtImageSrc()).toBeTruthy();
    expect(component.currentMriImageSrc()).toBeTruthy();

    // Verify CT modality override parameter passed to service
    expect(mockDicomService.getRenderedImageUrl).toHaveBeenCalledWith(
      'study-spine-preop',
      'mock-series-uid',
      'mock-instance-uid',
      undefined,
      undefined,
      undefined,
      undefined,
      16,
      'CT'
    );

    // Verify MR modality override parameter passed to service
    expect(mockDicomService.getRenderedImageUrl).toHaveBeenCalledWith(
      'study-spine-preop',
      'mock-series-uid',
      'mock-instance-uid',
      undefined,
      undefined,
      undefined,
      undefined,
      16,
      'MR'
    );
  });

  it('should dispatch defect to bioreactor and update status', () => {
    mockDicomService.dispatchToBioreactor = vi.fn();
    const study: any = { studyInstanceUid: 'study-bioreactor-test', frameCount: 32 };
    component.selectedStudy.set(study);
    component.currentSlice.set(10);
    component.sendDefectToBioreactor();
    expect(component.bioreactorStatus()).toBe('Seeding...');
    expect(mockDicomService.dispatchToBioreactor).toHaveBeenCalledWith(study, 10 * 64 + 1024);
  });
});

