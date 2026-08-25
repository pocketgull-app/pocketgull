import { SmartFhirSyncModalComponent } from './smart-fhir-sync-modal.component';
import { signal } from '@angular/core';

describe('SmartFhirSyncModalComponent Suite', () => {
  let component: SmartFhirSyncModalComponent;
  let mockFhirService: any;

  beforeEach(() => {
    mockFhirService = {
      config: signal({
        fhirBaseUrl: 'https://hapi.fhir.org/baseR4',
        clientId: 'test-client',
        scope: 'patient/*.*',
        preset: 'hapi_r4'
      }),
      syncStats: signal({
        patientsSynced: 1,
        conditionsSynced: 3,
        observationsSynced: 2,
        diagnosticReportsSynced: 1,
        lastSyncedAt: '2026-08-21T23:00:00.000Z',
        status: 'success',
        errorMessage: null
      }),
      setPreset: vi.fn(),
      syncToRemoteFhir: vi.fn().mockResolvedValue({ status: 'success' }),
      generateFhirR4Bundle: vi.fn().mockReturnValue({
        resourceType: 'Bundle',
        type: 'transaction',
        entry: []
      })
    };

    component = new SmartFhirSyncModalComponent();
    (component as any).fhirService = mockFhirService;
    component.config = mockFhirService.config;
    component.stats = mockFhirService.syncStats;
  });

  it('1. Opens and closes modal cleanly', () => {
    expect(component.isOpen()).toBe(false);
    component.open();
    expect(component.isOpen()).toBe(true);
    component.close();
    expect(component.isOpen()).toBe(false);
  });

  it('2. Changes EHR endpoint preset', () => {
    component.selectPreset('epic_sandbox');
    expect(mockFhirService.setPreset).toHaveBeenCalledWith('epic_sandbox');
  });

  it('3. Triggers remote FHIR sync push', async () => {
    await component.handleSyncPush();
    expect(mockFhirService.syncToRemoteFhir).toHaveBeenCalled();
  });

  it('4. Toggles and generates FHIR JSON bundle preview', () => {
    expect(component.isPreviewOpen()).toBe(false);
    component.toggleBundlePreview();
    expect(component.isPreviewOpen()).toBe(true);
    expect(mockFhirService.generateFhirR4Bundle).toHaveBeenCalled();
    expect(component.previewJson()).toContain('Bundle');
  });
});
