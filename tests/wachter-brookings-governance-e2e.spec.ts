import '@angular/compiler';
import { vi } from 'vitest';
import { Injector, runInInjectionContext, PLATFORM_ID } from '@angular/core';
import { PatientStateService } from '../src/services/patient-state.service';
import { ThemeService } from '../src/services/theme.service';
import { StorageService } from '../src/services/storage.service';
import { GamificationService } from '../src/services/gamification.service';
import { ActuarialLongevityService } from '../src/services/actuarial-longevity.service';
import { FhirR5TelemetryService } from '../src/services/fhir/fhir-r5-telemetry.service';
import { FhirBundleFactoryService } from '../src/services/fhir/fhir-bundle-factory.service';
import { SkepticalEpistemologyService } from '../src/services/skeptical-epistemology.service';
import { FhirIntegrationService } from '../src/services/fhir/fhir-integration.service';
import { RpmAuditService } from '../src/services/rpm-audit.service';

describe('Wachter & Brookings AI Governance Integration Suite (End-to-End)', () => {
  // Mock Angular constructor effects for headless Vitest environment
  vi.mock('@angular/core', async (importOriginal) => {
    const original = await importOriginal<any>();
    return {
      ...original,
      effect: () => ({ destroy: () => {} })
    };
  });
  let injector: Injector;
  let telemetryService: FhirR5TelemetryService;
  let skepticalService: SkepticalEpistemologyService;
  let fhirService: FhirIntegrationService;
  let rpmService: RpmAuditService;

  beforeEach(() => {
    injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: StorageService, useFactory: () => new StorageService() },
        { provide: GamificationService, useFactory: () => new GamificationService() },
        { provide: ThemeService, useFactory: () => new ThemeService() },
        { provide: ActuarialLongevityService, useFactory: () => new ActuarialLongevityService() },
        { provide: PatientStateService, useFactory: () => new PatientStateService() },
        { provide: FhirR5TelemetryService, useFactory: () => new FhirR5TelemetryService() },
        { provide: SkepticalEpistemologyService, useFactory: () => new SkepticalEpistemologyService() },
        FhirBundleFactoryService,
        { provide: FhirIntegrationService, useFactory: () => new FhirIntegrationService() },
        { provide: RpmAuditService, useFactory: () => new RpmAuditService() }
      ]
    });

    telemetryService = runInInjectionContext(injector, () => injector.get(FhirR5TelemetryService));
    skepticalService = runInInjectionContext(injector, () => injector.get(SkepticalEpistemologyService));
    fhirService = runInInjectionContext(injector, () => injector.get(FhirIntegrationService));
    rpmService = runInInjectionContext(injector, () => injector.get(RpmAuditService));
  });

  it('Pillar 1: should suppress transient single-point HR artifact while firing sustained telemetry alert', () => {
    // Normal baseline reading sample #1
    telemetryService.evaluateAdaptiveAlert(72, 98, 16, 45);

    // Single transient spike (HR 135, spO2 98, resp 16, hrv 45) sample #2
    let alert = telemetryService.evaluateAdaptiveAlert(135, 98, 16, 45);
    expect(alert.alarmSuppressionState).toBe('suppressed_transient');

    // Sustained high HR packets over subsequent samples
    telemetryService.evaluateAdaptiveAlert(138, 97, 16, 45);
    telemetryService.evaluateAdaptiveAlert(140, 97, 16, 45);
    alert = telemetryService.evaluateAdaptiveAlert(142, 96, 16, 45);

    expect(alert.alarmSuppressionState).toBe('active_alert');
    expect(alert.status).toBe('alert');
  });

  it('Pillar 2: should evaluate FDA 21 CFR 520(o) CDS compliance & H0 falsifiability', () => {
    const report = skepticalService.evaluateCdsCompliance('Functional Protocols', 3);

    expect(report.regulatoryMetadata.cfrReference).toContain('520(o)');
    expect(report.overallConfidencePercent).toBeGreaterThanOrEqual(70);
    expect(report.falsifiability.pValue).toBeLessThan(0.05);
    expect(report.cochraneBias.overallRiskOfBias).toBeDefined();
  });

  it('Pillar 3: should discover SMART endpoints and generate USCDI v4 FHIR R4 Bundle', async () => {
    const smartConfig = await fhirService.discoverSmartEndpoints('https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4');
    expect(smartConfig?.authorization_endpoint).toBeDefined();

    const bundle = fhirService.buildFhirR4CarePlanBundle(
      { patientId: 'pt-wbg-1', name: 'Dr. Robert Wachter', age: 62, vitals: { hr: 72, spO2: 99 } },
      'Integrative Care'
    );

    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.entry.some((e: any) => e.resource.resourceType === 'CarePlan')).toBe(true);
  });

  it('Pillar 4: should verify CMS RPM 16-day transmission threshold & CPT reimbursement claim payload', () => {
    const initialMetrics = rpmService.rpmMetrics();
    expect(initialMetrics.cpt99454Eligible).toBe(true);

    rpmService.logClinicalTime(20, 'Multidisciplinary review of telemetry anomalies');
    const claim = rpmService.generateCmsClaimPayload();

    expect(claim.claimType).toContain('CMS-1500 / 837P');
    expect(claim.billingCodes.some((c: any) => c.code === '99457')).toBe(true);
    expect(claim.totalClaimUsd).toBeGreaterThan(100);
  });
});
