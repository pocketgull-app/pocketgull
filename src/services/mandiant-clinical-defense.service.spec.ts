import '@angular/compiler';
import { MandiantClinicalDefenseService } from './mandiant-clinical-defense.service';
import { computeFipsSha256Hex } from './clinical-defense-guard.service';

describe('MandiantClinicalDefenseService Unit Suite', () => {
  let service: MandiantClinicalDefenseService;

  beforeEach(() => {
    service = new MandiantClinicalDefenseService();
  });

  it('1. Initializes with standard healthcare compliance controls (HIPAA, NIST SP 800-207, HHS 405d, OWASP)', () => {
    const controls = service.securityControls();
    expect(controls.length).toBeGreaterThanOrEqual(5);
    expect(controls.some(c => c.standard === 'HIPAA_TECHNICAL_SAFEGUARDS')).toBe(true);
    expect(controls.some(c => c.standard === 'NIST_SP_800_207_ZERO_TRUST')).toBe(true);
    expect(controls.some(c => c.standard === 'HHS_405D_HICP')).toBe(true);
    expect(controls.some(c => c.standard === 'OWASP_LLM_SECURITY')).toBe(true);
  });

  it('2. Maps MITRE ATLAS AI safeguards and prompt immutability rules', () => {
    const tactics = service.atlasTactics();
    expect(tactics.length).toBe(5);
    expect(tactics.some(t => t.mitreAtlasId === 'AML.T0043')).toBe(true);
    expect(tactics.some(t => t.mitreAtlasId === 'AML.T0054')).toBe(true);
    expect(tactics.every(t => t.countermeasureStatus === 'ACTIVE_GUARDED')).toBe(true);
  });

  it('3. Enforces Dual-Custody (M-of-N) separation for high-impact actions', () => {
    // Same role must be rejected
    const sameRole = service.verifyDualCustodyAuthorization('BULK_PHI_EXPORT', 'CHIEF_MEDICAL_OFFICER', 'CHIEF_MEDICAL_OFFICER');
    expect(sameRole.isAuthorized).toBe(false);
    expect(sameRole.rationale).toContain('must be distinct');

    // Bulk export without DPO must be rejected
    const noDpo = service.verifyDualCustodyAuthorization('BULK_PHI_EXPORT', 'ATTENDING_PHYSICIAN', 'NURSE_MANAGER');
    expect(noDpo.isAuthorized).toBe(false);
    expect(noDpo.rationale).toContain('Data Protection Officer');

    // Bulk export with DPO co-sign must be approved
    const validExport = service.verifyDualCustodyAuthorization('BULK_PHI_EXPORT', 'CHIEF_MEDICAL_OFFICER', 'PRIVACY_OFFICER_DPO');
    expect(validExport.isAuthorized).toBe(true);
  });

  it('4. Enforces Dual-Custody threshold for high-value HSA disbursements', () => {
    // Below threshold passes with dual distinct clinical roles
    const underThreshold = service.verifyDualCustodyAuthorization('HSA_TREASURY_DISBURSEMENT', 'CLINICAL_LEAD', 'STAFF_NURSE', 250);
    expect(underThreshold.isAuthorized).toBe(true);

    // Over $500 threshold requires Executive / Compliance co-signature
    const overThresholdNoExec = service.verifyDualCustodyAuthorization('HSA_TREASURY_DISBURSEMENT', 'CLINICAL_LEAD', 'STAFF_NURSE', 750);
    expect(overThresholdNoExec.isAuthorized).toBe(false);
    expect(overThresholdNoExec.rationale).toContain('Compliance or Executive');

    const overThresholdWithExec = service.verifyDualCustodyAuthorization('HSA_TREASURY_DISBURSEMENT', 'CLINICAL_LEAD', 'COMPLIANCE_OFFICER', 750);
    expect(overThresholdWithExec.isAuthorized).toBe(true);
  });

  it('5. Audits STAT emergency overrides and records forensic snapshot', () => {
    const initialSnapshots = service.forensicSnapshots().length;
    const snapshot = service.auditStatEmergencyOverride('DR-SMITH-8821', 'Cardiac Arrest in ICU Bed 4');

    expect(snapshot.severity).toBe('HIGH');
    expect(snapshot.eventCategory).toBe('STAT_OVERRIDE_EVENT');
    expect(service.forensicSnapshots().length).toBe(initialSnapshots + 1);
  });

  it('6. Successfully triggers and resets emergency containment protocol', () => {
    service.triggerEmergencyContainment();
    expect(service.isContainmentModeActive()).toBe(true);
    expect(service.defensePosture().threatLevel).toBe('CONTAINED');

    const snapshots = service.forensicSnapshots();
    expect(snapshots[0].severity).toBe('CRITICAL');
    expect(snapshots[0].containmentApplied).toContain('External egress severed');

    service.resetContainment();
    expect(service.isContainmentModeActive()).toBe(false);
    expect(service.defensePosture().threatLevel).toBe('SECURE_NOMINAL');
  });

  it('7. Verifies FIPS 180-4 SHA-256 test vectors (empty, "abc", multi-block) and genuine forensic seals', () => {
    expect(computeFipsSha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(computeFipsSha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(computeFipsSha256Hex('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')).toBe(
      '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1'
    );
    expect(service.computeSha256Sync('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');

    const snapshot = service.auditStatEmergencyOverride('DR-TEST-01', 'Acute Stroke Alert');
    expect(snapshot.evidencePayloadHash).toMatch(/^SHA256-[A-Fa-f0-9]{64}$/);
    expect(snapshot.evidencePayloadHash.toLowerCase()).not.toContain('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });
});
