import { TestBed } from '@angular/core/testing';
import { SmartOnFhirLauncherService } from './smart-on-fhir-launcher.service';

describe('SmartOnFhirLauncherService', () => {
  let service: SmartOnFhirLauncherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SmartOnFhirLauncherService);
  });

  it('1. Initializes with supported EHR vendors', () => {
    const vendors = service.supportedVendors();
    expect(vendors.length).toBeGreaterThanOrEqual(4);
    expect(vendors.some(v => v.id === 'epic')).toBe(true);
    expect(vendors.some(v => v.id === 'cerner')).toBe(true);
  });

  it('2. Initiates SMART v2 launch flow and connects session', async () => {
    service.initiateLaunch('epic', 'test-launch-code-123');
    expect(service.activeSession().status).toBe('AUTHORIZING');

    await new Promise(resolve => setTimeout(resolve, 900));

    expect(service.activeSession().status).toBe('CONNECTED');
    expect(service.activeSession().patientId).toBe('P001');
    expect(service.isConnected()).toBe(true);
  });

  it('3. Disconnects session cleanly', () => {
    service.disconnectSession();
    expect(service.activeSession().status).toBe('IDLE');
    expect(service.isConnected()).toBe(false);
  });
});
