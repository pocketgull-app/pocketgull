import { describe, it, expect, beforeEach } from 'vitest';
import { TrustedCommonsFederationService } from './trusted-commons-federation.service';

describe('TrustedCommonsFederationService', () => {
  let service: TrustedCommonsFederationService;

  beforeEach(() => {
    service = new TrustedCommonsFederationService();
  });

  it('1. Initializes local cryptographic node identity and baseline peer registry', () => {
    expect(service.localDid()).toContain('did:commons:');
    expect(service.localPublicKey()).toContain('ed25519:pk:');
    expect(service.peerNodes().length).toBeGreaterThanOrEqual(3);
    expect(service.verifiedPartnersCount()).toBeGreaterThanOrEqual(2);
  });

  it('2. Registers new peer node and updates trust status', () => {
    service.registerPeerNode({
      did: 'did:commons:appalachian-health-collective',
      name: 'Appalachian Community Health Collective',
      category: 'Community Health Clinic / FQHC',
      locationDescriptor: 'Blue Ridge Mountains, NC',
      publicVerificationKey: 'ed25519:pk:112233445566778899aabbcc',
      trustStatus: 'PENDING_ATTESTATION',
      sharedResourceDomains: ['Wilderness Triage', 'Foraged Herbal Posology'],
      lastAttestationTimestamp: new Date().toISOString(),
      activeCovenantSummary: 'Pending initial bilateral treaty ratification'
    });

    const found = service.peerNodes().find(p => p.did === 'did:commons:appalachian-health-collective');
    expect(found).toBeDefined();
    expect(found?.trustStatus).toBe('PENDING_ATTESTATION');

    // Elevate to verified mutual partner
    service.setPeerTrustStatus('did:commons:appalachian-health-collective', 'VERIFIED_MUTUAL_PARTNER');
    const updated = service.peerNodes().find(p => p.did === 'did:commons:appalachian-health-collective');
    expect(updated?.trustStatus).toBe('VERIFIED_MUTUAL_PARTNER');
  });

  it('3. Sanctions or revokes a compromised peer node using graduated sanctions', () => {
    service.setPeerTrustStatus('did:commons:highland-park-clt-99', 'REVOKED_SANCTIONED');
    const revoked = service.peerNodes().find(p => p.did === 'did:commons:highland-park-clt-99');
    expect(revoked?.trustStatus).toBe('REVOKED_SANCTIONED');
  });

  it('4. Exports signed cryptographic resource bundle for air-gapped sync', () => {
    const jsonStr = service.exportSignedResourceBundle(
      'FHIR_CLINICAL_PROTOCOL',
      'Cascadia Emergency Pediatric Dehydration Protocol',
      { oralRehydrationSaltRatio: '1L water, 6 tsp sugar, 0.5 tsp salt', clinicalIndication: 'Rotavirus / Acute Gastroenteritis' }
    );

    const parsed = JSON.parse(jsonStr);
    expect(parsed.bundleId).toBeDefined();
    expect(parsed.originNodeDid).toBe(service.localDid());
    expect(parsed.cryptographicSignature).toContain('sig:ed25519:');
    expect(parsed.data.oralRehydrationSaltRatio).toBeDefined();
  });

  it('5. Generates bilateral Inter-Commons Federation Covenant document', () => {
    const treaty = service.generateFederationCovenant('did:commons:vermont-rural-midwives-44');
    expect(treaty).toContain('# BILATERAL INTER-COMMONS SOLIDARITY & RESOURCE FEDERATION COVENANT');
    expect(treaty).toContain('Green Mountain Rural Midwifery');
    expect(treaty).toContain('Ostrom Nobel Laureate Framework (Principle #8');
    expect(treaty).toContain('ARTICLE I: PURPOSE & SOVEREIGN RECOGNITION');
    expect(treaty).toContain('ARTICLE II: AIR-GAPPED & OPEN KNOWLEDGE FEDERATION');
  });
});
