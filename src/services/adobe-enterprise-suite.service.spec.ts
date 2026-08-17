import '@angular/compiler';
import { AdobeEnterpriseSuiteService } from './adobe-enterprise-suite.service';

describe('AdobeEnterpriseSuiteService', () => {
  let service: AdobeEnterpriseSuiteService;

  beforeEach(() => {
    service = new AdobeEnterpriseSuiteService();
  });

  it('should initialize with correct Adobe organization and project bindings', () => {
    expect(service).toBeTruthy();
    expect(service.orgId).toBe('00AF226E687833EB0A495CEE@AdobeOrg');
    expect(service.projectId).toBe('224161');
    expect(service.workspaceId).toBe('4566206088345737575');
    expect(service.dpoEmail).toBe('dpo@pocketgull.app');
  });

  it('should generate verifiable C2PA Content Credentials Manifests with DPO approval', () => {
    const manifest = service.generateC2paManifest(
      'Pediatric Courage Medal #1042',
      'image/png',
      'abc123sha256digest'
    );

    expect(manifest.title).toBe('Pediatric Courage Medal #1042');
    expect(manifest.format).toBe('image/png');
    expect(manifest.claim_generator_info.dpo_contact).toBe('dpo@pocketgull.app');
    expect(manifest.assertions.length).toBeGreaterThanOrEqual(3);

    const hipaaAssertion = manifest.assertions.find(a => a.label === 'c2pa.compliance.hipaa');
    expect(hipaaAssertion).toBeDefined();
    expect(hipaaAssertion?.data.standard).toBe('HIPAA §164.514 Safe Harbor');
    expect(hipaaAssertion?.data.dpoApproval).toBe('dpo@pocketgull.app');

    const hashAssertion = manifest.assertions.find(a => a.label === 'c2pa.hash.data');
    expect(hashAssertion?.data.digest).toBe('abc123sha256digest');
  });

  it('should generate 21 CFR Part 11 compliant Adobe PDF audit envelopes with XMP metadata', () => {
    const envelope = service.generatePdfAuditEnvelope(
      'Tri-Paradigm Clinical Care Strategy & Longevity Report',
      'PAT-8823-CURIE'
    );

    expect(envelope.pdfStandard).toBe('PDF/A-2u');
    expect(envelope.cfrPart11Compliant).toBe(true);
    expect(envelope.dpoEmail).toBe('dpo@pocketgull.app');
    expect(envelope.signedBy).toContain('Phil Gear, DPO');
    expect(envelope.xmpMetadata).toContain('xmlns:x="adobe:ns:meta/"');
    expect(envelope.xmpMetadata).toContain('dpo@pocketgull.app');
    expect(envelope.tamperEvidentHash.length).toBe(64);
  });

  it('should provide pre-configured Substance 3D biophysical PBR materials across 5 biological categories', () => {
    const materials = service.substanceMaterials();
    expect(materials.length).toBe(5);

    const bone = materials.find(m => m.category === 'osteology');
    expect(bone).toBeDefined();
    expect(bone?.pbr.roughness).toBe(0.22);
    expect(bone?.substanceDesignerGraph).toContain('.sbsar');

    const vascular = materials.find(m => m.category === 'vascular');
    expect(vascular).toBeDefined();
    expect(vascular?.pbr.emissiveHex).toBe('#0d9488');

    const dental = materials.find(m => m.category === 'dental');
    expect(dental).toBeDefined();
    expect(dental?.name).toContain('Hydroxyapatite');
  });

  it('should generate Adobe Acrobat Sign agreement envelopes with 21 CFR Part 11 signers', () => {
    const envelope = service.generateAcrobatSignEnvelope(
      'Symptom Management Strategy Consent',
      'Dr. Alice Taylor',
      'dr.taylor@metrohealth.org'
    );

    expect(envelope.documentTitle).toBe('Symptom Management Strategy Consent');
    expect(envelope.status).toBe('OUT_FOR_SIGNATURE');
    expect(envelope.signers.length).toBe(2);
    expect(envelope.signers[0].email).toBe('dr.taylor@metrohealth.org');
    expect(envelope.signers[1].email).toBe('dpo@pocketgull.app');
    expect(envelope.acrobatWebReviewUrl).toContain('acrobat.adobe.com');
  });

  it('should construct correct Adobe Acrobat Web tool URLs', () => {
    expect(service.getAcrobatWebToolUrl('view')).toBe('https://acrobat.adobe.com/?locale=en-US');
    expect(service.getAcrobatWebToolUrl('sign')).toContain('request-signatures');
    expect(service.getAcrobatWebToolUrl('fill-and-sign')).toContain('fill-and-sign');
    expect(service.getAcrobatWebToolUrl('ocr')).toContain('ocr-pdf');
    expect(service.getAcrobatWebToolUrl('compress')).toContain('compress-pdf');
  });

  it('should export Adobe Spectrum design tokens with healthcare palette', () => {
    const tokens = service.getSpectrumDesignTokens();
    expect(tokens['--spectrum-global-color-seafoam-500']).toBe('#00B0B9');
    expect(tokens['--spectrum-global-color-teal-600']).toBe('#0D9488');
    expect(tokens['--spectrum-global-color-blue-600']).toBe('#0284C7');
    expect(tokens['--spectrum-border-radius-medium']).toBe('12px');
  });
});
