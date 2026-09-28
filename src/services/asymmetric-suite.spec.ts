/**
 * @file asymmetric-suite.spec.ts
 * @description Unit test suite for the Multi-Faceted Asymmetry Services.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { KlDivergenceStrategyService } from './kl-divergence-strategy.service';
import { EvtAnomalyDetectorService } from './evt-anomaly-detector.service';
import { QuasiMetricTrajectoryService } from './quasi-metric-trajectory.service';
import { DecisionCurveAnalysisService } from './decision-curve-analysis.service';
import { ProspectTheoryUtilityService } from './prospect-theory-utility.service';
import { ContralateralAsymmetryService } from './contralateral-asymmetry.service';
import { AutonomicAsymmetryService } from './autonomic-asymmetry.service';
import { AsymmetricE2eeService } from './asymmetric-e2ee.service';
import { AsymmetricSplitInferenceService } from './asymmetric-split-inference.service';

describe('Multi-Faceted Asymmetry Services Suite', () => {
  let klService: KlDivergenceStrategyService;
  let evtService: EvtAnomalyDetectorService;
  let quasiService: QuasiMetricTrajectoryService;
  let dcaService: DecisionCurveAnalysisService;
  let prospectService: ProspectTheoryUtilityService;
  let contraService: ContralateralAsymmetryService;
  let autoService: AutonomicAsymmetryService;
  let e2eeService: AsymmetricE2eeService;
  let splitService: AsymmetricSplitInferenceService;

  beforeEach(() => {
    klService = new KlDivergenceStrategyService();
    evtService = new EvtAnomalyDetectorService();
    quasiService = new QuasiMetricTrajectoryService();
    dcaService = new DecisionCurveAnalysisService();
    prospectService = new ProspectTheoryUtilityService();
    contraService = new ContralateralAsymmetryService();
    autoService = new AutonomicAsymmetryService();
    e2eeService = new AsymmetricE2eeService();
    splitService = new AsymmetricSplitInferenceService();
  });

  describe('KlDivergenceStrategyService', () => {
    it('should compute forward and reverse KL divergence and demonstrate asymmetry', () => {
      const p = [0.8, 0.2];
      const q = [0.5, 0.5];
      const fKl = klService.computeForwardKl(p, q);
      const rKl = klService.computeReverseKl(p, q);
      expect(fKl).toBeGreaterThan(0);
      expect(rKl).toBeGreaterThan(0);
      expect(fKl).not.toBe(rKl);
    });

    it('should route differential candidates in mode-covering vs mode-seeking regimes', () => {
      const candidates = [
        { conditionName: 'ACL Tear', probability: 0.70, clinicalAcuity: 'URGENT' as const },
        { conditionName: 'Occult Fracture', probability: 0.05, clinicalAcuity: 'STAT_EMERGENCY' as const },
        { conditionName: 'Mild Synovitis', probability: 0.25, clinicalAcuity: 'ROUTINE' as const }
      ];
      const modeCovering = klService.routeDifferentialStrategy(candidates, 'forward_mode_covering');
      const modeSeeking = klService.routeDifferentialStrategy(candidates, 'reverse_mode_seeking');

      expect(modeCovering.prioritizedDifferential.length).toBe(3); // Preserves emergency tail
      expect(modeSeeking.prioritizedDifferential.length).toBeLessThanOrEqual(2); // Focuses on top modes
    });
  });

  describe('EvtAnomalyDetectorService', () => {
    it('should fit Generalized Pareto tail distribution and detect extreme shocks', () => {
      const normalData = [12, 14, 15, 13, 16, 14, 15, 17, 18, 14, 16, 15, 13, 15, 16, 19, 85]; // 85 is outlier
      const report = evtService.fitPotGeneralizedPareto(normalData, 0.85);
      expect(report.isTailAnomaly).toBe(true);
      expect(report.scaleParameterSigma).toBeGreaterThan(0);
    });
  });

  describe('QuasiMetricTrajectoryService', () => {
    it('should demonstrate that repair cost exceeds damage cost (hysteresis)', () => {
      const healthy = { structuralIntegrity: 1.0, inflammatoryLoad: 0.0, functionalRange: 1.0, painInhibition: 0.0 };
      const injured = { structuralIntegrity: 0.2, inflammatoryLoad: 0.8, functionalRange: 0.3, painInhibition: 0.9 };

      const damageCost = quasiService.computeQuasiDistance(healthy, injured);
      const repairCost = quasiService.computeQuasiDistance(injured, healthy);

      expect(repairCost).toBeGreaterThan(damageCost);
      const hop = quasiService.evaluateTransitionHysteresis(injured, healthy);
      expect(hop.hysteresisIndex).toBeGreaterThan(1.0);
    });
  });

  describe('DecisionCurveAnalysisService', () => {
    it('should compute DCA Net Benefit curves', () => {
      const yTrue = [1, 1, 1, 0, 0, 0, 1, 0, 0, 0];
      const yPred = [0.9, 0.8, 0.7, 0.2, 0.1, 0.3, 0.85, 0.1, 0.05, 0.15];
      const summary = dcaService.computeDecisionCurve(yTrue, yPred, 20);

      expect(summary.curvePoints.length).toBe(19);
      expect(summary.maxNetBenefit).toBeGreaterThan(0);
      expect(summary.optimalThreshold).toBeGreaterThan(0);
    });
  });

  describe('ProspectTheoryUtilityService', () => {
    it('should apply higher loss aversion to elite athletes than sedentary professionals', () => {
      const athleteEval = prospectService.evaluateSubjectiveValue(1.0, 1.0, 'elite_athlete');
      const sedentaryEval = prospectService.evaluateSubjectiveValue(1.0, 1.0, 'sedentary_professional');

      expect(athleteEval.lossComponent).toBeGreaterThan(sedentaryEval.lossComponent);
    });
  });

  describe('ContralateralAsymmetryService', () => {
    it('should detect left-dominant kinetic joint overload', () => {
      const left = { medialJointSpaceMm: 2.0, lateralJointSpaceMm: 4.5, meniscalExtrusionMm: 3.5, cartilageThicknessMm: 1.5, subchondralBmlScore: 3 };
      const right = { medialJointSpaceMm: 4.5, lateralJointSpaceMm: 4.5, meniscalExtrusionMm: 0.5, cartilageThicknessMm: 3.5, subchondralBmlScore: 0 };

      const report = contraService.evaluateBilateralKnees(left, right);
      expect(report.dominantSide).toBe('Left Dominant');
      expect(report.overallKineticAsymmetryIndex).toBeGreaterThan(0.20);
    });
  });

  describe('AutonomicAsymmetryService', () => {
    it('should separate right vagal chronotropy from left vagal dromotropy', () => {
      const report = autoService.evaluateAutonomicTelemetry({
        heartRateBpm: 68,
        respirationRateBpm: 14,
        rmssdMs: 45,
        pnn50Percent: 22,
        prIntervalMs: 170
      });

      expect(report.rightVagalChronotropicScore).toBeGreaterThan(0);
      expect(report.leftVagalDromotropicScore).toBeGreaterThan(0);
      expect(report.physiologicalReadiness).toBe('Optimal Tone');
    });
  });

  describe('AsymmetricE2eeService', () => {
    it('should perform ECDH key generation, encryption, and decryption with integrity check', async () => {
      const recipientPair = await e2eeService.generateKeyPair();
      const message = 'Confidential Clinical Note: Grade 3 ACL tear, recommend reconstructive consultation.';

      const encryptedBundle = await e2eeService.encryptForRecipient(message, recipientPair.publicKey);
      expect(encryptedBundle.ciphertextHex.length).toBeGreaterThan(0);
      expect(encryptedBundle.integrityDigestSha256.length).toBe(64);

      const decrypted = await e2eeService.decryptBundle(encryptedBundle, recipientPair.privateKey);
      expect(decrypted).toBe(message);
    });
  });

  describe('AsymmetricSplitInferenceService', () => {
    it('should plan and execute split edge-cloud stages', async () => {
      const plan = await splitService.planAndExecuteSplitInference('Patient presents with acute right knee effusion after pivot shift injury.');
      expect(plan.stages.length).toBeGreaterThan(2);
      expect(plan.totalLatencyMs).toBeGreaterThan(0);
      expect(plan.edgeComputeRatio).toBeGreaterThan(0.5);
    });
  });
});
