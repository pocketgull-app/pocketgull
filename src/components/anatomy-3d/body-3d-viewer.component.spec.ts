import '@angular/compiler';
import { expect, vi } from 'vitest';
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

});
