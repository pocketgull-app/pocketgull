import '@angular/compiler';
import { SmartOnFhirLaunchService } from './smart-on-fhir-launch.service';

describe('SmartOnFhirLaunchService Unit Suite', () => {
  let service: SmartOnFhirLaunchService;

  beforeEach(() => {
    service = new SmartOnFhirLaunchService();
  });

  it('1. Constructs Epic SMART-on-FHIR authorization URL', () => {
    const result = service.buildAuthorizationUrl({
      vendor: 'EPIC',
      fhirBaseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
      clientId: 'epic-client-123',
      redirectUri: 'https://pocketgull.app/launch/callback',
      launchToken: 'launch_epic_99'
    });

    expect(result.vendor).toBe('EPIC');
    expect(result.authorizationUrl).toContain('fhir.epic.com');
    expect(result.authorizationUrl).toContain('client_id=epic-client-123');
    expect(result.authorizationUrl).toContain('launch=launch_epic_99');
    expect(result.codeChallenge).toBeDefined();
  });

  it('2. Constructs Cerner SMART-on-FHIR authorization URL', () => {
    const result = service.buildAuthorizationUrl({
      vendor: 'CERNER',
      fhirBaseUrl: 'https://fhir-myrecord.cerner.com/r4/tenant-123',
      clientId: 'cerner-client-456',
      redirectUri: 'https://pocketgull.app/launch/callback'
    });

    expect(result.vendor).toBe('CERNER');
    expect(result.authorizationUrl).toContain('authorization.cerner.com');
    expect(result.requestedScopes).toContain('patient/*.read');
  });

  it('3. Parses EHR Launch URL parameters', () => {
    const params = service.parseLaunchParams({
      iss: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
      launch: 'token_xyz_123'
    });

    expect(params.iss).toBe('https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4');
    expect(params.launch).toBe('token_xyz_123');
  });
});
