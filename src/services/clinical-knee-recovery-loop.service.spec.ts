import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { ClinicalKneeRecoveryLoopService, IMriTargetProbabilities } from './clinical-knee-recovery-loop.service';

describe('ClinicalKneeRecoveryLoopService Unit Suite', () => {
  let service: ClinicalKneeRecoveryLoopService;

  beforeEach(() => {
    const injector = Injector.create({ providers: [] });
    service = runInInjectionContext(injector, () => new ClinicalKneeRecoveryLoopService());
  });

  it('1. Translates 12 RSNA MRI targets into validated KOOS subscales', () => {
    const mri: IMriTargetProbabilities = {
      aclTear: 0.1,
      pclTear: 0.05,
      mclTear: 0.2,
      medialMeniscusTear: 0.85,
      lateralMeniscusTear: 0.1,
      patellofemoralCartilageDefect: 0.3,
      medialFemorotibialCartilageDefect: 0.4,
      lateralFemorotibialCartilageDefect: 0.1,
      jointEffusion: 0.75,
      boneMarrowEdema: 0.5,
      extensorMechanismDisruption: 0.02,
      osteophytes: 0.15
    };

    const koos = service.translateMriToKoos(mri);
    expect(koos.pain).toBeGreaterThan(20);
    expect(koos.pain).toBeLessThan(80);
    expect(koos.symptoms).toBeLessThan(75);
    expect(koos.adl).toBeGreaterThan(30);
    expect(koos.sportRec).toBeLessThan(70);
    expect(koos.compositeKoos).toBeGreaterThan(30);
  });

  it('2. Computes Dynamic Recovery Velocity and tracks remodeling progress', () => {
    const report = service.currentRecoveryReport();
    expect(report.currentDay).toBe(14);
    expect(report.observedImprovementScore).toBeGreaterThan(0);
    expect(report.expectedBenchmarkScore).toBeGreaterThan(0);
    expect(report.velocityRatio).toBeGreaterThan(0.5);
    expect(report.activePhase.phaseNumber).toBeDefined();
    expect(report.projectedFullRecoveryDay).toBeGreaterThan(14);
  });

  it('3. Flags Arthrogenic Muscle Inhibition (AMI) when joint effusion is prominent', () => {
    const report = service.currentRecoveryReport();
    const amiVulnerability = report.kineticVulnerabilities.find(v => v.name.includes('Arthrogenic'));
    expect(amiVulnerability?.biomechanicalMechanism.toLowerCase()).toContain('capsular effusion');
    expect(amiVulnerability?.clinicalAction).toContain('isometric quad sets');
  });

  it('4. Prescribes 4-phase physical therapy roadmap with safe progression criteria', () => {
    const report = service.currentRecoveryReport();
    expect(report.activePhase.keyExercises.length).toBeGreaterThan(2);
    expect(report.activePhase.contraindicatedMovements.length).toBeGreaterThan(0);
  });

  it('5. Updates recovery log reactively upon new daily check-in', () => {
    const initialHistoryLength = service.checkInHistory().length;
    service.logDailyCheckIn({
      dayNumber: 21,
      morningStiffnessMinutes: 10,
      vasPain: 2.0,
      activeFlexionDegrees: 125,
      dailyStepTolerance: 7500,
      compliancePhaseExercise: true
    });

    expect(service.checkInHistory().length).toBe(initialHistoryLength + 1);
    const updatedReport = service.currentRecoveryReport();
    expect(updatedReport.currentDay).toBe(21);
  });

  it('6. Dynamically updates individual MRI target probabilities', () => {
    service.setMriTargetProbability('aclTear', 0.98);
    expect(service.activeMriProfile().aclTear).toBe(0.98);

    // Clamps within [0, 1]
    service.setMriTargetProbability('jointEffusion', 1.5);
    expect(service.activeMriProfile().jointEffusion).toBe(1.0);
  });

  it('7. Successfully loads clinical presentation scenario presets', () => {
    service.loadPresetScenario('acute_acl_effusion');
    expect(service.activeMriProfile().aclTear).toBe(0.95);
    expect(service.activeMriProfile().jointEffusion).toBe(0.92);
    expect(service.currentRecoveryReport().currentDay).toBe(4);
    expect(service.currentRecoveryReport().activePhase.phaseNumber).toBe(1);

    service.loadPresetScenario('healthy_baseline');
    expect(service.activeMriProfile().aclTear).toBe(0.02);
    expect(service.currentRecoveryReport().koosScores.compositeKoos).toBeGreaterThan(90);
  });

  it('8. Updates latest check-in parameters reactively', () => {
    service.updateLatestCheckIn({ vasPain: 1.5, activeFlexionDegrees: 135 });
    const report = service.currentRecoveryReport();
    expect(report.observedImprovementScore).toBeGreaterThan(50);
  });

  it('9. Generates compliant HL7 FHIR R4 CarePlan Bundle with LOINC & SNOMED CT', () => {
    const bundle = service.generateFhirCarePlanBundle('TEST-PT-001', 'mock-sha256-seal');
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('collection');
    expect(bundle.entry.length).toBe(4);

    const carePlanEntry = bundle.entry.find(e => e.resource['resourceType'] === 'CarePlan');
    expect(carePlanEntry).toBeDefined();
    expect(carePlanEntry?.resource['status']).toBe('active');
    expect(carePlanEntry?.resource['category'][0].coding[0].code).toBe('385644000');
    expect(carePlanEntry?.resource['activity'].length).toBeGreaterThan(0);

    const koosEntry = bundle.entry.find(e => e.resource['resourceType'] === 'Observation' && e.resource['id'].includes('koos'));
    expect(koosEntry).toBeDefined();
    expect(koosEntry?.resource['code'].coding[0].code).toBe('72100-1');
    expect(koosEntry?.resource['component'].length).toBe(5);

    const reportEntry = bundle.entry.find(e => e.resource['resourceType'] === 'DiagnosticReport');
    expect(reportEntry).toBeDefined();
    expect(reportEntry?.resource['code'].coding[0].code).toBe('36635-1');

    expect(bundle.meta.extension?.[0].valueString).toBe('mock-sha256-seal');
  });

  it('10. Computes immutable SHA-256 cryptographic digest for FDA 21 CFR Part 11', async () => {
    const digest = await service.computeSha256Digest('Test clinical note for knee rehabilitation');
    expect(digest).toBeDefined();
    expect(digest.length).toBe(64);
  });

  it('11. Predicts knee recovery decompensation risk via ML endpoint with graceful fallback', async () => {
    // 1. Successful ML sidecar response
    const mockBundle = {
      resourceType: 'Bundle',
      entry: [{
        resource: {
          resourceType: 'Observation',
          valueQuantity: { value: 0.88 },
          interpretation: [{ coding: [{ code: 'high' }] }],
          note: [{ text: 'High AMI Risk' }]
        }
      }]
    };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockBundle
    } as any);

    const mlResult = await service.predictMlKneeDecompensationRisk();
    expect(mlResult.isMlModel).toBe(true);
    expect(mlResult.score).toBe(0.88);
    expect(mlResult.riskLevel).toBe('high');

    // 2. Offline fallback
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const fallbackResult = await service.predictMlKneeDecompensationRisk();
    expect(fallbackResult.isMlModel).toBe(false);
    expect(fallbackResult.score).toBeGreaterThanOrEqual(0.0);
    expect(fallbackResult.score).toBeLessThanOrEqual(1.0);

    globalThis.fetch = originalFetch;
  });
});

