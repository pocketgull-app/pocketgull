import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { EnterpriseIdentityService } from './enterprise-identity.service';
import { AuthSsoService } from './auth-sso.service';

describe('EnterpriseIdentityService', () => {
  let service: EnterpriseIdentityService;
  let authSsoService: AuthSsoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EnterpriseIdentityService,
        {
          provide: AuthSsoService,
          useValue: {
            user: { set: () => {}, value: null },
            setSession: () => {}
          }
        }
      ]
    });

    service = TestBed.inject(EnterpriseIdentityService);
    authSsoService = TestBed.inject(AuthSsoService);
  });

  it('1. Initializes with Okta Healthcare Cloud preset and default roster', () => {
    expect(service.idpPreset()).toBe('okta');
    expect(service.activeIdp().name).toContain('Okta Healthcare Cloud');
    expect(service.clinicians().length).toBeGreaterThanOrEqual(4);
    const stats = service.stats();
    expect(stats.totalClinicians).toBeGreaterThanOrEqual(4);
    expect(stats.activeClinicians).toBeGreaterThanOrEqual(3);
    expect(stats.deactivatedClinicians).toBeGreaterThanOrEqual(1);
  });

  it('2. Switches Identity Provider presets (Entra, Ping, Custom)', () => {
    service.configureIdp('entra');
    expect(service.activeIdp().provider).toBe('entra');
    expect(service.activeIdp().name).toContain('Microsoft Entra ID');

    service.configureIdp('ping');
    expect(service.activeIdp().provider).toBe('ping');
    expect(service.activeIdp().name).toContain('PingFederate');

    service.configureIdp('custom', {
      name: 'Custom Academic Hospital IdP',
      entityId: 'https://idp.stanfordhealthcare.org'
    });
    expect(service.activeIdp().name).toBe('Custom Academic Hospital IdP');
    expect(service.activeIdp().entityId).toBe('https://idp.stanfordhealthcare.org');
  });

  it('3. Generates valid OASIS SAML 2.0 SP Metadata XML', () => {
    const xml = service.generateSpMetadataXml();
    expect(xml).toContain('<md:EntityDescriptor');
    expect(xml).toContain('entityID="https://pocketgull.app/saml/sp"');
    expect(xml).toContain('<md:AssertionConsumerService');
    expect(xml).toContain('Location="https://pocketgull.app/api/auth/saml/acs"');
    expect(xml).toContain('urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress');
  });

  it('4. Validates a generated sample SAML 2.0 assertion successfully', async () => {
    const inResponseTo = 'req_test_123';
    const sampleXml = service.generateSampleSamlAssertion(
      {
        email: 'dr.curie@hopkinsmedicine.org',
        displayName: 'Dr. Jane Curie, MD, PhD',
        npi: '1982736450',
        clinicalRole: 'roles/healthcare.datasetAdmin'
      },
      inResponseTo
    );

    const result = await service.validateSamlAssertion(sampleXml, inResponseTo);

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(result.claims).not.toBeNull();
    expect(result.claims?.email).toBe('dr.curie@hopkinsmedicine.org');
    expect(result.claims?.displayName).toBe('Dr. Jane Curie, MD, PhD');
    expect(result.claims?.npi).toBe('1982736450');
    expect(result.claims?.clinicalRole).toBe('roles/healthcare.datasetAdmin');
    expect(result.signatureVerified).toBe(true);
    expect(result.digestVerified).toBe(true);
  });

  it('5. Flags errors when SAML assertion lacks signature or has invalid status', async () => {
    const invalidXml = `<?xml version="1.0"?>
    <samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol">
      <samlp:Status><samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:AuthnFailed"/></samlp:Status>
    </samlp:Response>`;

    const result = await service.validateSamlAssertion(invalidXml);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('SAML Status is not Success (Authentication rejected by IdP)');
    expect(result.errors).toContain('SAML Assertion lacks required XML digital signature (<ds:Signature>)');
  });

  it('6. Authorizes session into AuthSsoService upon valid assertion', async () => {
    const sampleXml = service.generateSampleSamlAssertion({
      email: 'marcus.vance@mayo.edu',
      displayName: 'Dr. Marcus Vance, MD'
    });

    const validation = await service.validateSamlAssertion(sampleXml);
    const session = await service.authorizeSamlSession(validation);

    expect(session.email).toBe('marcus.vance@mayo.edu');
    expect(session.name).toBe('Dr. Marcus Vance, MD');
    expect(session.sessionToken).toBeDefined();
    expect(session.tenantId).toBeDefined();

    // Verify audit entry created
    const audits = service.getAuditTrail();
    const loginAudit = audits.find(a => a.action === 'SAML_SSO_LOGIN');
    expect(loginAudit).toBeDefined();
    expect(loginAudit?.actor).toBe('marcus.vance@mayo.edu');
    expect(loginAudit?.integrityHash).toBeDefined();
  });

  it('7. Queries SCIM 2.0 users with text and attribute filters', () => {
    const all = service.listScimUsers();
    expect(all.schemas).toContain('urn:ietf:params:scim:api:messages:2.0:ListResponse');
    expect(all.totalResults).toBeGreaterThanOrEqual(4);

    const filtered = service.listScimUsers('userName eq "dr.curie@hopkinsmedicine.org"');
    expect(filtered.Resources.length).toBe(1);
    expect(filtered.Resources[0].userName).toBe('dr.curie@hopkinsmedicine.org');

    const search = service.listScimUsers('cardiology');
    expect(search.Resources.some(u => u.displayName.includes('Vance'))).toBe(true);
  });

  it('8. Provisions a new clinician via SCIM 2.0 schema', async () => {
    const newUser = await service.provisionScimUser({
      userName: 'dr.alex.cross@hopkinsmedicine.org',
      displayName: 'Dr. Alex Cross, MD',
      'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User': {
        department: 'Pediatric Intensive Care',
        npi: '1334455667',
        clinicalPrivileges: ['PICU_INTUBATION', 'PEDIATRIC_CDS']
      }
    });

    expect(newUser.id).toBeDefined();
    expect(newUser.active).toBe(true);
    expect(newUser.meta.resourceType).toBe('User');

    const found = service.getScimUser(newUser.id);
    expect(found).not.toBeNull();
    expect(found?.displayName).toBe('Dr. Alex Cross, MD');

    const audits = service.getAuditTrail();
    const provisionAudit = audits.find(a => a.action === 'SCIM_USER_PROVISIONED');
    expect(provisionAudit).toBeDefined();
  });

  it('9. Executes SCIM PATCH to de-provision offboarding clinician', async () => {
    const vance = service.clinicians().find(u => u.userName === 'marcus.vance@mayo.edu')!;
    expect(vance.active).toBe(true);

    const deprov = await service.deprovisionClinician(vance.id, 'Fellowship rotation completed');
    expect(deprov).toBe(true);

    const updated = service.getScimUser(vance.id)!;
    expect(updated.active).toBe(false);

    // Verify audit entry for de-provisioning
    const audits = service.getAuditTrail();
    const deprovAudit = audits.find(a => a.action === 'SCIM_USER_DEPROVISIONED');
    expect(deprovAudit).toBeDefined();
    expect(deprovAudit?.targetUserId).toBe(vance.id);

    // Reactivate
    await service.reactivateClinician(vance.id);
    expect(service.getScimUser(vance.id)?.active).toBe(true);
  });

  it('10. Lists SCIM 2.0 Groups and exports FDA 21 CFR Part 11 JSON ledger', () => {
    const groups = service.listScimGroups();
    expect(groups.length).toBeGreaterThanOrEqual(2);
    expect(groups[0].displayName).toContain('ICU');

    const exportJson = service.exportAuditTrailJson();
    expect(exportJson).toContain('FDA 21 CFR Part 11');
    const parsed = JSON.parse(exportJson);
    expect(parsed.events.length).toBeGreaterThan(0);
    expect(parsed.events[0].integrityHash).toBeDefined();
  });
});
