import { EhrAppOrchardPackagerService } from './ehr-app-orchard-packager.service';

describe('EhrAppOrchardPackagerService Suite', () => {
  let service: EhrAppOrchardPackagerService;

  beforeEach(() => {
    service = new EhrAppOrchardPackagerService();
  });

  it('1. Initializes cleanly with App Orchard packager capabilities', () => {
    expect(service).toBeTruthy();
  });

  it('2. Generates formal Epic App Orchard (Connection Hub) manifest', () => {
    const pkg = service.generateEpicAppOrchardPackage();
    expect(pkg).toBeDefined();
    expect(pkg.client_id).toBe('pocketgull-epic-connection-hub-client');
    expect(pkg.application_type).toBe('web');
    expect(pkg.token_endpoint_auth_method).toBe('none'); // Public client with PKCE
    expect(pkg.grant_types).toContain('authorization_code');
    expect(pkg.scope).toContain('launch/patient');
    expect(pkg.scope).toContain('patient/Observation.read');

    // Epic-specific environment mapping
    expect(pkg.epic_specific.target_environments).toEqual([
      'Epic Hyperspace',
      'Epic Rover',
      'Epic MyChart'
    ]);
    expect(pkg.epic_specific.uscdi_version).toBe('v4');
    expect(pkg.epic_specific.connection_hub_ready).toBe(true);

    // Security attestations
    expect(pkg.security_attestations.hipaa_baa_executed).toBe(true);
    expect(pkg.security_attestations.onc_hti1_cds_transparency_certified).toBe(true);
  });

  it('3. Generates formal Oracle Cerner Code Program package descriptor', () => {
    const pkg = service.generateCernerMarketplacePackage();
    expect(pkg).toBeDefined();
    expect(pkg.app_id).toBe('pocketgull-cerner-powerchart-app');
    expect(pkg.cerner_code_status).toBe('validated_partner');
    expect(pkg.product_compatibility).toContain('Cerner PowerChart');
    expect(pkg.product_compatibility).toContain('Oracle Health Millennium EHR');
    expect(pkg.launch_types).toContain('ehr_launch');
    expect(pkg.launch_types).toContain('standalone_launch');
    expect(pkg.scopes_requested).toContain('patient/Patient.read');
  });

  it('4. Generates standard HL7 FHIR R4 CapabilityStatement conformance resource', () => {
    const statement = service.generateCapabilityStatement();
    expect(statement.resourceType).toBe('CapabilityStatement');
    expect(statement.fhirVersion).toBe('4.0.1');
    expect(statement.status).toBe('active');
    expect(statement.kind).toBe('capability');

    const restServer = statement.rest[0];
    expect(restServer.mode).toBe('server');

    // Security extensions declaring SMART on FHIR
    const smartSecurity = restServer.security;
    expect(smartSecurity.cors).toBe(true);
    expect(smartSecurity.service[0].coding[0].code).toBe('SMART-on-FHIR');

    const oauthExtension = smartSecurity.extension.find(e => 
      e.url.includes('oauth-uris')
    );
    expect(oauthExtension).toBeDefined();

    // Resources declared
    const resourceTypes = restServer.resource.map(r => r.type);
    expect(resourceTypes).toContain('Patient');
    expect(resourceTypes).toContain('Observation');
    expect(resourceTypes).toContain('Condition');
    expect(resourceTypes).toContain('MedicationRequest');
    expect(resourceTypes).toContain('CarePlan');
  });

  it('5. Generates SMART App Launch STU2 discovery configuration', () => {
    const config = service.generateSmartConfiguration();
    expect(config.authorization_endpoint).toContain('/api/fitbit/auth');
    expect(config.token_endpoint).toContain('/api/fitbit/callback');
    expect(config.code_challenge_methods_supported).toContain('S256');
    expect(config.capabilities).toContain('launch-ehr');
    expect(config.capabilities).toContain('launch-standalone');
    expect(config.capabilities).toContain('client-public');
  });

  it('6. Passes 10-point EHR Marketplace & App Orchard certification audit with 100% compliance', () => {
    const report = service.validateEhrCertificationSuite();
    expect(report.status).toBe('CERTIFIED_READY_FOR_MARKETPLACE');
    expect(report.totalChecks).toBe(10);
    expect(report.passedChecks).toBe(10);
    expect(report.complianceScorePct).toBe(100);
    expect(report.overallScore).toBe('10/10');

    // Verify key statutory checks
    const checkIds = report.checks.map(c => c.id);
    expect(checkIds).toContain('AUTH_PKCE_S256');
    expect(checkIds).toContain('HIPAA_SAFE_HARBOR');
    expect(checkIds).toContain('USCDI_V4_COMPLIANCE');
    expect(checkIds).toContain('ONC_HTI1_CDS_TRANSPARENCY');
    expect(checkIds).toContain('FHIR_R4_SCHEMA_VALIDITY');
    expect(checkIds).toContain('WCAG_AAA_ACCESSIBILITY');
  });
});
