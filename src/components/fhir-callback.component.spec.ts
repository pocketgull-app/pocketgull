import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { FhirCallbackComponent } from './fhir-callback.component';
import { FhirIntegrationService } from '../services/fhir/fhir-integration.service';
import { PatientManagementService } from '../services/patient-management.service';

describe('FhirCallbackComponent', () => {
  let mockFhirService: {
    handleCallback: any;
    fetchPatientProfile: any;
  };
  let mockPatientMgmt: {
    ingestFhirBundle: any;
  };

  beforeEach(() => {
    mockFhirService = {
      handleCallback: vi.fn().mockResolvedValue(true),
      fetchPatientProfile: vi.fn().mockResolvedValue({ resourceType: 'Bundle', entry: [] })
    };
    mockPatientMgmt = {
      ingestFhirBundle: vi.fn()
    };
  });

  const createComponent = (searchQuery = '') => {
    if (typeof window !== 'undefined' && window.location) {
      (window.location as any).search = searchQuery;
    }

    const injector = Injector.create({
      providers: [
        { provide: FhirIntegrationService, useValue: mockFhirService },
        { provide: PatientManagementService, useValue: mockPatientMgmt }
      ]
    });

    return runInInjectionContext(injector, () => new FhirCallbackComponent());
  };

  it('1. should show error when URL contains an error parameter', () => {
    const comp = createComponent('?error=access_denied');
    expect(comp.isProcessing).toBe(false);
    expect(comp.errorMsg).toContain('Epic returned an error: access_denied');
  });

  it('2. should show error when no authorization code is present in URL', () => {
    const comp = createComponent('');
    expect(comp.isProcessing).toBe(false);
    expect(comp.errorMsg).toContain('No authorization code detected');
  });

  it('3. should process callback and ingest FHIR bundle on successful exchange', async () => {
    const comp = createComponent('?code=AUTH_TEST_CODE_123');
    expect(comp.isProcessing).toBe(true);
    expect(mockFhirService.handleCallback).toHaveBeenCalledWith('AUTH_TEST_CODE_123');

    // Wait for promise tick
    await Promise.resolve();
    await Promise.resolve();

    expect(mockFhirService.fetchPatientProfile).toHaveBeenCalled();
    expect(mockPatientMgmt.ingestFhirBundle).toHaveBeenCalledWith({ resourceType: 'Bundle', entry: [] });
    expect(comp.isProcessing).toBe(false);
  });

  it('4. should handle token exchange failure gracefully', async () => {
    mockFhirService.handleCallback = vi.fn().mockResolvedValue(false);
    const comp = createComponent('?code=INVALID_CODE');

    await Promise.resolve();
    await Promise.resolve();

    expect(comp.isProcessing).toBe(false);
    expect(comp.errorMsg).toContain('Failed to negotiate the secure token exchange');
  });

  it('5. should route to appropriate URL when returnToApp is called', () => {
    const comp = createComponent('?error=cancel');
    comp.returnToApp(true);
    expect(window.location.href).toContain('epic_connected=true');

    comp.returnToApp(false);
    expect(window.location.href).toBe('/');
  });
});
