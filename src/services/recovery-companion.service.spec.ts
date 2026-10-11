import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RecoveryCompanionService, IRecoveryCheckInPayload } from './recovery-companion.service';
import { EhrWritebackService } from './fhir/ehr-writeback.service';
import { PatientStateService } from './patient-state.service';
import { signal, createEnvironmentInjector, runInInjectionContext } from '@angular/core';

describe('RecoveryCompanionService', () => {
  let service: RecoveryCompanionService;
  let ehrWriteback: EhrWritebackService;

  beforeEach(() => {
    const mockPatientState = {
      asPatientSnapshot: () => ({ id: 'p001', name: 'Marcus Davis' }),
      vitals: signal({})
    };

    const mockEhrWriteback = {
      executeWriteback: vi.fn().mockResolvedValue({
        batchId: 'batch-test-recov-123',
        ehrVendor: 'EPIC',
        timestamp: new Date().toISOString(),
        authMethod: 'private_key_jwt (RFC 7523)',
        receipts: [{
          resourceType: 'Observation',
          fhirId: 'obs-recov-123',
          loincCode: '80290-0',
          httpStatus: 201
        }],
        overallStatus: 'SUCCESS_FILED_TO_EHR'
      })
    };

    const injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState },
      { provide: EhrWritebackService, useValue: mockEhrWriteback },
      RecoveryCompanionService
    ], undefined as any);

    runInInjectionContext(injector, () => {
      service = injector.get(RecoveryCompanionService);
      ehrWriteback = injector.get(EhrWritebackService);
    });
  });

  const basePayload: IRecoveryCheckInPayload = {
    cravingScore: 2,
    sleepTelemetry: {
      source: 'Apple HealthKit',
      totalSleepHours: 7.5,
      sleepLatencyMinutes: 20,
      deepSleepPercent: 18,
      remSleepPercent: 22,
      nocturnalHrDipPercent: 12,
      restingHeartRateBpm: 64
    },
    pawsDysphoriaScore: 1,
    restlessnessScore: 1,
    muscleAchesScore: 1,
    bristolStoolType: 4,
    oralCareAdherence: {
      postDosingWaterRinseCompleted: true,
      oneHourBrushingDelayRespected: true,
      highFluorideUsed: true,
      xylitolPacingUsed: true
    }
  };

  it('1. Initializes with empty check-in history', () => {
    expect(service).toBeTruthy();
    expect(service.recentCheckIns().length).toBe(0);
    expect(service.latestResult()).toBeNull();
  });

  it('2. Evaluates STABLE_FLOURISHING acuity when craving is low and sleep is optimal', async () => {
    const result = await service.evaluateCheckIn(basePayload);
    expect(result.acuityTier).toBe('STABLE_FLOURISHING');
    expect(result.clinicianAlertTriggered).toBe(false);
    expect(result.peerRecoveryLinkRecommended).toBe(false);
    expect(service.recentCheckIns().length).toBe(1);
    expect(service.latestResult()).toBe(result);
  });

  it('3. Triggers CRITICAL_INTERRUPT alert when craving score is >= 8', async () => {
    const highCravingPayload: IRecoveryCheckInPayload = {
      ...basePayload,
      cravingScore: 9
    };

    const result = await service.evaluateCheckIn(highCravingPayload);
    expect(result.acuityTier).toBe('CRITICAL_INTERRUPT');
    expect(result.clinicianAlertTriggered).toBe(true);
    expect(result.peerRecoveryLinkRecommended).toBe(true);
    expect(result.triageDirective).toContain('CRITICAL ALERT');
  });

  it('4. Triggers CRITICAL_INTERRUPT when sleep duration is severely compromised (< 4h)', async () => {
    const severeSleepDeprivation: IRecoveryCheckInPayload = {
      ...basePayload,
      sleepTelemetry: {
        ...basePayload.sleepTelemetry,
        totalSleepHours: 3.2
      }
    };

    const result = await service.evaluateCheckIn(severeSleepDeprivation);
    expect(result.acuityTier).toBe('CRITICAL_INTERRUPT');
    expect(result.clinicianAlertTriggered).toBe(true);
  });

  it('5. Evaluates MODERATE_ALERT when Opioid-Induced Bowel Dysfunction (Bristol Type 1-2) is reported', async () => {
    const oibdPayload: IRecoveryCheckInPayload = {
      ...basePayload,
      bristolStoolType: 1 // Severe hard constipation
    };

    const result = await service.evaluateCheckIn(oibdPayload);
    expect(result.acuityTier).toBe('MODERATE_ALERT');
    expect(result.entericInterventions.some(i => i.includes('OIBD') || i.includes('PAMORA'))).toBe(true);
  });

  it('6. Flags oral health alert when 1-hour brushing delay is violated', async () => {
    const oralViolationPayload: IRecoveryCheckInPayload = {
      ...basePayload,
      oralCareAdherence: {
        ...basePayload.oralCareAdherence,
        oneHourBrushingDelayRespected: false // Brushed immediately post-dissolution!
      }
    };

    const result = await service.evaluateCheckIn(oralViolationPayload);
    expect(result.oralHealthAlert).toBe(true);
  });

  it('7. Emits compliant FHIR R4 Observation with LOINC 80290-0 and 93832-4', async () => {
    const result = await service.evaluateCheckIn(basePayload, 'pat-test-marcus');
    const fhir = result.fhirObservationPayload;

    expect(fhir.resourceType).toBe('Observation');
    expect(fhir.code.coding[0].system).toBe('http://loinc.org');
    expect(fhir.code.coding[0].code).toBe('80290-0');
    expect(fhir.valueQuantity.value).toBe(2);

    const sleepComponent = fhir.component.find((c: any) => c.code.coding[0].code === '93832-4');
    expect(sleepComponent).toBeDefined();
    expect(sleepComponent.valueQuantity.value).toBe(7.5);
  });

  it('8. Computes SHA-256 seal for FDA 21 CFR Part 11 electronic records integrity', async () => {
    const result = await service.evaluateCheckIn(basePayload);
    expect(result.integrityDigest).toBeDefined();
    expect(result.integrityDigest.length).toBeGreaterThanOrEqual(16);
  });

  it('9. Executes automated EHR writeback via EhrWritebackService', async () => {
    const result = await service.evaluateCheckIn({ ...basePayload, cravingScore: 8 });
    const receipt = await service.writeBackToEhr(result);

    expect(ehrWriteback.executeWriteback).toHaveBeenCalled();
    expect(receipt).toBeDefined();
    expect(receipt?.ehrVendor).toBe('EPIC');
    expect(receipt?.receipts[0]?.httpStatus).toBe(201);
  });
});
