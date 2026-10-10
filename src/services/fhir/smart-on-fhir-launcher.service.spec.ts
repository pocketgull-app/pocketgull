import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { SmartOnFhirLauncherService } from './smart-on-fhir-launcher.service';

describe('SmartOnFhirLauncherService Unit Suite', () => {
  let service: SmartOnFhirLauncherService;

  beforeEach(() => {
    const injector = Injector.create({ providers: [] });
    service = runInInjectionContext(injector, () => new SmartOnFhirLauncherService());
  });

  it('1. Initializes with supported EHR vendors', () => {
    const vendors = service.supportedVendors();
    expect(vendors.length).toBeGreaterThanOrEqual(3);
    expect(vendors.some(v => v.id === 'epic')).toBe(true);
    expect(vendors.some(v => v.id === 'cerner')).toBe(true);
  });

  it('2. Initiates SMART v2 launch flow with PKCE state and connects session', async () => {
    service.initiateLaunch('epic', 'test-launch-code-123');
    expect(service.activeSession().status).toBe('AUTHORIZING');
    expect(service.activeSession().codeVerifier).toContain('pkce-');
    expect(service.activeSession().stateNonce).toContain('nonce-');

    await new Promise(resolve => setTimeout(resolve, 500));

    expect(service.activeSession().status).toBe('CONNECTED');
    expect(service.activeSession().patientId).toBe('P001');
    expect(service.isConnected()).toBe(true);
  });

  it('3. Validates FHIR R4 Bundle structure compliance', () => {
    const validBundle = { resourceType: 'Bundle', type: 'collection', entry: [] };
    expect(service.validateFhirR4Bundle(validBundle).valid).toBe(true);

    const invalidBundle = { resourceType: 'Patient', id: 'P1' };
    const res = service.validateFhirR4Bundle(invalidBundle);
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
  });

  it('4. Disconnects session cleanly', () => {
    service.disconnectSession();
    expect(service.activeSession().status).toBe('IDLE');
    expect(service.isConnected()).toBe(false);
  });

  it('5. Validates EHR launch conformance with PKCE S256 and launch context token for Epic', () => {
    const result = service.validateSmartLaunchConformance('epic', {
      launchType: 'ehr_launch',
      launchContextToken: 'epic-launch-test-token-9912'
    });

    expect(result.isValid).toBe(true);
    expect(result.scorePct).toBe(100);
    expect(result.vendorId).toBe('epic');
    expect(result.launchType).toBe('ehr_launch');
    expect(result.pkceChallengeS256.length).toBeGreaterThanOrEqual(43);
    expect(result.codeVerifier.length).toBeGreaterThanOrEqual(43);
    expect(result.stateNonce).toContain('nonce-');
    expect(result.constructedAuthorizeUrl).toContain('response_type=code');
    expect(result.constructedAuthorizeUrl).toContain('code_challenge_method=S256');
    expect(result.constructedAuthorizeUrl).toContain('launch=epic-launch-test-token-9912');
    expect(result.constructedAuthorizeUrl).toContain('https%3A%2F%2Fpocketgull.app%2Fsmart-callback');
    expect(result.checks.every(c => c.passed)).toBe(true);
  });

  it('6. Validates Standalone Patient launch conformance for Oracle Cerner', () => {
    const result = service.validateSmartLaunchConformance('cerner', {
      launchType: 'standalone_launch',
      scopes: ['launch/patient', 'openid', 'fhirUser', 'patient/*.read', 'offline_access']
    });

    expect(result.isValid).toBe(true);
    expect(result.scorePct).toBe(100);
    expect(result.vendorId).toBe('cerner');
    expect(result.launchType).toBe('standalone_launch');
    expect(result.constructedAuthorizeUrl).toContain('launch%2Fpatient');
    expect(result.constructedAuthorizeUrl).not.toContain('launch=');
    expect(result.checks.length).toBe(6);
    expect(result.checks.every(c => c.passed)).toBe(true);
  });

  it('7. Simulates CDS Hook order-select for Atorvastatin with Grapefruit Furanocoumarin card', () => {
    const cards = service.simulateCdsHookTrigger({
      vendorId: 'epic',
      hook: 'order-select',
      patientId: 'P001',
      medicationOrder: 'Atorvastatin 40mg PO QHS',
      labs: { hba1c: 7.2, egfr: 68 }
    });

    expect(cards.length).toBe(1);
    expect(cards[0].indicator).toBe('warning');
    expect(cards[0].summary).toContain('Furanocoumarin Surge Risk');
    expect(cards[0].detail).toContain('+330%');
    expect(cards[0].suggestions?.[0]?.label).toContain('Citrus Sinensis');
    expect(cards[0].links?.[0]?.type).toBe('smart');
    expect(service.activeCdsCards().length).toBe(1);
  });

  it('8. Simulates CDS Hook order-select for Lisinopril with severe hyperkalemia trigger', () => {
    const cards = service.simulateCdsHookTrigger({
      vendorId: 'cerner',
      hook: 'order-select',
      patientId: 'P001',
      medicationOrder: 'Lisinopril 20mg PO Daily',
      labs: { serumPotassium: 5.3 }
    });

    expect(cards.length).toBe(1);
    expect(cards[0].indicator).toBe('critical'); // K+ >= 5.0
    expect(cards[0].summary).toContain('Salt-Substitute & Potassium Hyperkalemia');
    expect(cards[0].detail).toContain('5.3 mEq/L');
    expect(cards[0].suggestions?.[0]?.label).toContain('Mineral-Balanced Herb Seasoning');
  });

  it('9. Generates and signs HL7 FHIR R4 NutritionOrder, CarePlan, and Provenance transaction bundle', () => {
    const result = service.generateSignedNutritionOrderCarePlanBundle('P001', {
      triggerMed: 'Atorvastatin 40mg',
      dietarySubstitution: 'Individualized low-furanocoumarin Mediterranean ancestral plate',
      restrictions: ['Grapefruit', 'Pomelos', 'Seville Oranges'],
      suggestions: ['Substitute sweet oranges or blueberries', 'Time polyphenols 3 hours post-prandial']
    });

    expect(result.status).toBe('SIGNED_AND_CERTIFIED');
    expect(result.resourceCount).toBe(3);
    expect(result.sha256Seal.length).toBe(64);
    expect(result.bundle.resourceType).toBe('Bundle');
    expect(result.bundle.type).toBe('transaction');
    expect(result.bundle.entry.some((e: any) => e.resource.resourceType === 'NutritionOrder')).toBe(true);
    expect(result.bundle.entry.some((e: any) => e.resource.resourceType === 'CarePlan')).toBe(true);
    expect(result.bundle.entry.some((e: any) => e.resource.resourceType === 'Provenance')).toBe(true);
    expect(service.lastSignedBundle()).toEqual(result);
  });

  it('10. Launches and closes embedded SMART on FHIR iframe session', () => {
    service.launchEmbeddedSmartApp({
      vendorId: 'epic',
      patientId: 'P001',
      triggerMed: 'Atorvastatin 40mg',
      launchMode: 'chrono_nutrition'
    });

    expect(service.embeddedIframeOpen()).toBe(true);
    expect(service.activeEmbeddedAppPayload()?.triggerMed).toBe('Atorvastatin 40mg');

    service.closeEmbeddedSmartApp();
    expect(service.embeddedIframeOpen()).toBe(false);
  });
});
