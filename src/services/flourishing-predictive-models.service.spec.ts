import { describe, it, expect, beforeEach } from 'vitest';
import {
  FlourishingPredictiveModelsService,
  IGlymphaticClearanceInput,
  ICouplesCoRegulationInput,
  IGutBarrierInput,
  ICaregiverAllostaticLoadInput
} from './flourishing-predictive-models.service';

describe('FlourishingPredictiveModelsService', () => {
  let service: FlourishingPredictiveModelsService;

  beforeEach(() => {
    service = new FlourishingPredictiveModelsService();
  });

  describe('forecastGlymphaticClearance', () => {
    it('should compute optimal clearance efficiency and low cognitive fog under ideal sleep conditions', () => {
      const input: IGlymphaticClearanceInput = {
        slowWaveSleepMinutes: 90.0,
        bedtimeLuxExposure: 15.0,
        screenApneaPausesPerHour: 3.0,
        mayerWaveResonanceCoherencePct: 90.0
      };

      const result = service.forecastGlymphaticClearance(input);
      expect(result.glymphaticClearanceEfficiencyPct).toBeGreaterThanOrEqual(75.0);
      expect(result.astrocyticAquaporin4PolarizationTier).toBe('OPTIMAL');
      expect(result.projectedMorningCognitiveFogScore).toBeLessThan(4.0);
      expect(result.neuroMetaboliteWashoutIndex).toBeGreaterThan(7.0);
    });

    it('should penalize high bedtime lux and high screen apnea pauses', () => {
      const input: IGlymphaticClearanceInput = {
        slowWaveSleepMinutes: 40.0,
        bedtimeLuxExposure: 350.0,
        screenApneaPausesPerHour: 35.0,
        mayerWaveResonanceCoherencePct: 35.0
      };

      const result = service.forecastGlymphaticClearance(input);
      expect(result.glymphaticClearanceEfficiencyPct).toBeLessThan(60.0);
      expect(result.astrocyticAquaporin4PolarizationTier).not.toBe('OPTIMAL');
      expect(result.posologyInterventions.some(i => i.toLowerCase().includes('lux'))).toBe(true);
    });
  });

  describe('predictCouplesCoRegulation', () => {
    it('should mandate a 20-minute timeout and detect sympathetic alarm during physiological flooding', () => {
      const input: ICouplesCoRegulationInput = {
        partnerAHeartRateBpm: 106.0,
        partnerBHeartRateBpm: 104.0,
        partnerARmssdMs: 14.0,
        partnerBRmssdMs: 15.0,
        speechTurnLatencySeconds: 0.5,
        unresolvedConflictPresent: true
      };

      const result = service.predictCouplesCoRegulation(input);
      expect(result.floodingProbabilityPct).toBeGreaterThan(60.0);
      expect(result.mandatoryTimeoutMinutes).toBe(20);
      expect(result.polyvagalStatePartnerA).toBe('SYMPATHETIC_ALARM');
      expect(result.deEscalationProtocol).toContain('20-MINUTE RECOVERY BUFFER');
    });

    it('should confirm ventral vagal stability and positive coupling in calm conversational pacing', () => {
      const input: ICouplesCoRegulationInput = {
        partnerAHeartRateBpm: 65.0,
        partnerBHeartRateBpm: 68.0,
        partnerARmssdMs: 50.0,
        partnerBRmssdMs: 55.0,
        speechTurnLatencySeconds: 2.5,
        unresolvedConflictPresent: false
      };

      const result = service.predictCouplesCoRegulation(input);
      expect(result.floodingProbabilityPct).toBeLessThan(30.0);
      expect(result.mandatoryTimeoutMinutes).toBe(0);
      expect(result.polyvagalStatePartnerA).toBe('VENTRAL_VAGAL');
      expect(result.autonomicCouplingIndex).toBeGreaterThan(0.3);
    });
  });

  describe('evaluateGutBarrier', () => {
    it('should calculate robust butyrate levels and low endotoxin risk with 30+ plant species and resistant starch', () => {
      const input: IGutBarrierInput = {
        weeklyBotanicalSpeciesCount: 35,
        ancestralResistantStarchGramsDay: 25.0,
        polyphenolDensityScore: 8.5,
        ultraProcessedFoodCaloricSharePct: 5.0
      };

      const result = service.evaluateGutBarrier(input);
      expect(result.projectedFecalButyrateUmolG).toBeGreaterThanOrEqual(12.0);
      expect(result.epithelialBarrierIntegrityScore).toBeGreaterThanOrEqual(80.0);
      expect(result.systemicEndotoxinLeakageRisk).toBe('LOW');
      expect(result.circulatingZonulinRiskLevel).toBe('LOW_PERMEABILITY');
    });

    it('should detect elevated permeability risk when UPFs dominate diet', () => {
      const input: IGutBarrierInput = {
        weeklyBotanicalSpeciesCount: 8,
        ancestralResistantStarchGramsDay: 2.0,
        polyphenolDensityScore: 2.5,
        ultraProcessedFoodCaloricSharePct: 60.0
      };

      const result = service.evaluateGutBarrier(input);
      expect(result.projectedFecalButyrateUmolG).toBeLessThan(10.0);
      expect(result.epithelialBarrierIntegrityScore).toBeLessThan(60.0);
      expect(result.systemicEndotoxinLeakageRisk).not.toBe('LOW');
    });
  });

  describe('forecastCaregiverAllostaticLoad', () => {
    it('should flag critical exhaustion and mandate urgent 48h respite when sleep debt is high', () => {
      const input: ICaregiverAllostaticLoadInput = {
        nightlyAwakeningsForCare: 4,
        totalSleepHoursActual: 4.5,
        dailyTransferBiomechanicalMets: 4.0,
        consecutiveCaregivingDaysWithoutRespite: 26
      };

      const result = service.forecastCaregiverAllostaticLoad(input);
      expect(result.allostaticOverloadTier).toBe('EXHAUSTION_CRITICAL');
      expect(result.cumulativeSleepDebtHoursWeekly).toBeGreaterThan(18.0);
      expect(result.respiteUrgency).toBe('WITHIN_48_HOURS');
      expect(result.prescribedRespiteShiftHours).toBe(48);
    });

    it('should report stable equilibrium for well-supported care partners', () => {
      const input: ICaregiverAllostaticLoadInput = {
        nightlyAwakeningsForCare: 0,
        totalSleepHoursActual: 7.5,
        dailyTransferBiomechanicalMets: 1.5,
        consecutiveCaregivingDaysWithoutRespite: 2
      };

      const result = service.forecastCaregiverAllostaticLoad(input);
      expect(result.allostaticOverloadTier).toBe('STABLE_EQUILIBRIUM');
      expect(result.cumulativeSleepDebtHoursWeekly).toBeLessThan(5.0);
      expect(result.respiteUrgency).toBe('MAINTENANCE_PACE');
    });
  });
});
