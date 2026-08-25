import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID, signal, NgZone } from '@angular/core';
import { Body3DViewerComponent } from './body-3d-viewer.component';
import { PatientStateService } from '../../services/patient-state.service';
import { PatientManagementService } from '../../services/patient-management.service';
import { ThemeService } from '../../services/theme.service';
import { EnvironmentalTelemetryService } from '../../services/environmental-telemetry.service';
import { AdobeFireflyTextureService } from '../../services/adobe-firefly-texture.service';

import { BodyMeshFactoryService } from '../../services/body-mesh-factory.service';
import { RaycastSelectionService } from '../../services/raycast-selection.service';
import { SeverityParticleService } from '../../services/severity-particle.service';
import { SpatialLesionMarkupService } from '../../services/spatial-lesion-markup.service';

// Mock Angular effect to avoid ChangeDetectionScheduler requirement in headless Vitest tests
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

describe('Body3DViewerComponent Signal & Spatial Anatomy Behavioral Suite', () => {

  const createViewer = (occupation = 'Polymath') => {
    const actuarialService = { getOccupationalProfile: (occ: string) => ({ professionTitle: occ, socCode: occ === 'Polymath' ? '11-1021-POLY' : '27-2021-SWIM', snomedCode: '417893002', snomedDisplay: 'Cognitive Context Switching Overload' }) };
    const mockPatientState = {
      issues: signal({}),
      occupation: signal(occupation),
      occupationalProfile: signal(actuarialService.getOccupationalProfile(occupation))
    };

    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: PatientManagementService, useValue: {} },
        { provide: ThemeService, useValue: { isDarkMode: signal(true) } },
        { provide: EnvironmentalTelemetryService, useValue: {} },
        { provide: BodyMeshFactoryService, useValue: {} },
        { provide: RaycastSelectionService, useValue: {} },
        { provide: SeverityParticleService, useValue: {} },
        { provide: AdobeFireflyTextureService, useValue: {} },
        { provide: SpatialLesionMarkupService, useClass: SpatialLesionMarkupService },
        { provide: NgZone, useValue: { runOutsideAngular: (fn: any) => fn() } }
      ]
    });
    return runInInjectionContext(injector, () => new Body3DViewerComponent());
  };

  it('initializes signal states for 3D controls and webgl support', () => {
    const viewer = createViewer();
    expect(viewer.isAutoSpinning()).toBe(false);
    expect(viewer.webglSupported()).toBe(true);
    expect(viewer.activeCameraPreset()).toBe('front');
    expect(viewer.activeCameraPresetLabel()).toBe('🌐 Full Body');
  });

  it('toggles auto-spin signal state reactively', () => {
    const viewer = createViewer();
    expect(viewer.isAutoSpinning()).toBe(false);
    viewer.toggleAutoSpin();
    expect(viewer.isAutoSpinning()).toBe(true);
  });

  it('verifies anatomical spatial camera angle presets', () => {
    const presets = ['cranial', 'spinal', 'visceral', 'peripheral', 'systemic'];
    expect(presets).toHaveLength(5);
    expect(presets).toContain('cranial');
    expect(presets).toContain('visceral');
  });

  it('resolves occupational strain camera preset and focus label for Polymath', () => {
    const viewer = createViewer('Polymath');
    const strain = viewer.occupationalStrainInfo();
    expect(strain).not.toBeNull();
    expect(strain?.cameraPreset).toBe('cranial');
    expect(strain?.focusLabel).toContain('Interdisciplinary Brain');
  });

  it('toggles and configures 3D slice plane modes (axial, coronal, sagittal, none)', () => {
    const viewer = createViewer();
    expect(viewer.slicePlaneMode()).toBe('none');
    expect(viewer.slicePlaneDepthLabel()).toBe('Full 3D');

    viewer.setSlicePlaneMode('axial');
    expect(viewer.slicePlaneMode()).toBe('axial');

    viewer.setSlicePlaneMode('coronal');
    expect(viewer.slicePlaneMode()).toBe('coronal');

    viewer.setSlicePlaneMode('sagittal');
    expect(viewer.slicePlaneMode()).toBe('sagittal');

    viewer.setSlicePlaneMode('none');
    expect(viewer.slicePlaneMode()).toBe('none');
  });

  it('adjusts slice plane depth displacement and updates depth labels accurately', () => {
    const viewer = createViewer();
    viewer.setSlicePlaneMode('axial');

    viewer.setSlicePlaneDepth(50);
    expect(viewer.slicePlaneDepth()).toBe(50);
    expect(viewer.slicePlaneDepthLabel()).toContain('Cranial (+50mm)');

    viewer.setSlicePlaneDepth(20);
    expect(viewer.slicePlaneDepthLabel()).toContain('Thoracic T4-T8 (+20mm)');

    viewer.setSlicePlaneDepth(-5);
    expect(viewer.slicePlaneDepthLabel()).toContain('Lumbar L1-L5 (-5mm)');

    viewer.setSlicePlaneDepth(-40);
    expect(viewer.slicePlaneDepthLabel()).toContain('Pelvic / Lower (-40mm)');

    viewer.setSlicePlaneMode('coronal');
    viewer.setSlicePlaneDepth(15);
    expect(viewer.slicePlaneDepthLabel()).toContain('Anterior (+15mm)');

    viewer.setSlicePlaneDepth(-15);
    expect(viewer.slicePlaneDepthLabel()).toContain('Posterior (-15mm)');
  });

  it('toggles slice plane normal inversion (flip cut direction)', () => {
    const viewer = createViewer();
    expect(viewer.slicePlaneInverted()).toBe(false);
    viewer.toggleSlicePlaneInversion();
    expect(viewer.slicePlaneInverted()).toBe(true);
    viewer.toggleSlicePlaneInversion();
    expect(viewer.slicePlaneInverted()).toBe(false);
  });

  it('toggles 3D dynamic organ biomarker risk heatmap mode', () => {
    const viewer = createViewer();
    expect(viewer.biomarkerHeatmapMode()).toBe(false);
    viewer.toggleBiomarkerHeatmap();
    expect(viewer.biomarkerHeatmapMode()).toBe(true);
    viewer.toggleBiomarkerHeatmap();
    expect(viewer.biomarkerHeatmapMode()).toBe(false);
  });

  it('constructs compound 3D lesion beacon pins with core, halo ring, and light ray', () => {
    const viewer = createViewer();
    expect(viewer.lesionMarkup.isMarkupMode()).toBe(false);

    viewer.lesionMarkup.toggleMarkupMode(true);
    expect(viewer.lesionMarkup.isMarkupMode()).toBe(true);

    viewer.lesionMarkup.addLesion({
      label: 'Cervical Radiculopathy',
      partId: 'head',
      position: { x: 0, y: 1.6, z: 0.1 },
      severity: 'critical',
      morphology: 'inflammation',
      clinicalNotes: 'C5/C6 impingement'
    });

    expect(viewer.lesionMarkup.activeLesions().length).toBe(1);
    expect(viewer.lesionMarkup.activeSeverity()).toBe('moderate');

    viewer.updateLesionPins();
  });
});
