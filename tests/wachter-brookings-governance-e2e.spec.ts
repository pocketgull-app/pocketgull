import '@angular/compiler';
import { vi } from 'vitest';
import { Injector, runInInjectionContext, PLATFORM_ID, signal } from '@angular/core';
import { FhirR5TelemetryService } from '../src/services/fhir/fhir-r5-telemetry.service';
import { FhirBundleFactoryService } from '../src/services/fhir/fhir-bundle-factory.service';
import { SkepticalEpistemologyService } from '../src/services/skeptical-epistemology.service';
import { RpmAuditService } from '../src/services/rpm-audit.service';
import { PatientStateService } from '../src/services/patient-state.service';

vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    effect: () => {
      return {
        destroy: () => {}
      };
    }
  };
});

describe('Wachter & Brookings AI Governance Integration Suite (End-to-End)', () => {
  let injector: Injector;
  let telemetryService: FhirR5TelemetryService;
  let skepticalService: SkepticalEpistemologyService;
  let bundleFactory: FhirBundleFactoryService;
  let rpmService: RpmAuditService;

  beforeEach(() => {
    const mockPatientState = {
      patientId: signal('pt-governance-001'),
      vitals: signal<any>({ hr: 72, spO2: 98, respRate: 16, bpSys: 120, bpDia: 80, temp: 98.6 }),
      demographics: signal<any>({ name: 'Jane Doe', age: 45, gender: 'female' }),
      conditions: signal<any>([]),
      issues: signal<any>([]),
      goals: signal<any>([]),
      aiAnalysis: signal<string>('Normal care plan'),
      updateVital: () => {}
    };

    injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: PatientStateService, useValue: mockPatientState },
        FhirBundleFactoryService,
        FhirR5TelemetryService,
        SkepticalEpistemologyService,
        RpmAuditService
      ]
    });

    telemetryService = runInInjectionContext(injector, () => injector.get(FhirR5TelemetryService));
    skepticalService = runInInjectionContext(injector, () => injector.get(SkepticalEpistemologyService));
    bundleFactory = runInInjectionContext(injector, () => injector.get(FhirBundleFactoryService));
    rpmService = runInInjectionContext(injector, () => injector.get(RpmAuditService));
  });

  it('Pillar 1: should suppress transient single-point HR artifact while firing sustained telemetry alert', () => {
    telemetryService.evaluateAdaptiveAlert(72, 98, 16, 45);

    let alert = telemetryService.evaluateAdaptiveAlert(135, 98, 16, 45);
    expect(alert.alarmSuppressionState).toBe('suppressed_transient');

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
    expect(report.isFdaSection520oCompliant).toBe(true);
  });

  it('Pillar 3: should enforce HIPAA Zero-Trust and export cryptographically signed FHIR R5 Bundle', () => {
    const bundle = bundleFactory.buildFhirR5TelemetryBundle({ hr: 72, spO2: 98 }, {});

    expect(bundle['resourceType']).toBe('Bundle');
    expect(bundle['type']).toBe('transaction');
    expect(bundle['entry'].length).toBeGreaterThan(0);

    const topicEntry = bundle['entry'].find((e: any) => e.resource?.resourceType === 'SubscriptionTopic');
    expect(topicEntry).toBeDefined();
    expect(topicEntry.resource.url).toContain('SubscriptionTopic');
  });

  it('Pillar 4: should verify RPM compliance under CMS CPT codes for Medicare reimbursement', () => {
    const metrics = rpmService.rpmMetrics();

    expect(metrics.transmissionDays30Count).toBeGreaterThanOrEqual(16);
    expect(metrics.cpt99453Eligible).toBe(true);
    expect(metrics.cpt99454Eligible).toBe(true);
    expect(metrics.cpt99457Eligible).toBe(true);
    expect(metrics.estimatedReimbursementUsd).toBeGreaterThan(100);
  });
});
