import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { AriaScoringService, IAriaNeuropathologyInput, IAriaSurgicalAnatomyInput } from './aria-scoring.service';

describe('AriaScoringService', () => {
  let service: AriaScoringService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AriaScoringService]
    });
    service = TestBed.inject(AriaScoringService);
  });

  describe('Neuropathology ARIA Engine (Amyloid-Related Imaging Abnormalities)', () => {
    it('1. Correctly classifies mild asymptomatic ARIA-E and continues therapy under surveillance', () => {
      const input: IAriaNeuropathologyInput = {
        patientId: 'PATIENT-001',
        flairEdemaMaxDimensionCm: 2.5,
        flairEdemaLocationsCount: 1,
        flairSulcalEffusionPresent: false,
        t2SwiMicrobleedCount: 0,
        superficialSiderosisFocalAreas: 0,
        patientHasApoE4Allele: false,
        hasClinicalSymptoms: false
      };

      const result = service.evaluateNeuropathologyAria(input);

      expect(result.ariaESeverity).toBe('MILD');
      expect(result.ariaHMicrobleedSeverity).toBe('NONE');
      expect(result.ariaHSiderosisSeverity).toBe('NONE');
      expect(result.compositeSeverity).toBe('MILD');
      expect(result.recommendedAction).toBe('CONTINUE_WITH_SURVEILLANCE');
      expect(result.mriSurveillanceIntervalWeeks).toBe(8);
      expect(result.cryptographicAttestationDigest).toContain('sha256-aria-');
    });

    it('2. Correctly flags moderate ARIA-E with clinical symptoms for STAT dosing suspension', () => {
      const input: IAriaNeuropathologyInput = {
        patientId: 'PATIENT-002',
        flairEdemaMaxDimensionCm: 6.0,
        flairEdemaLocationsCount: 2,
        flairSulcalEffusionPresent: false,
        t2SwiMicrobleedCount: 3,
        superficialSiderosisFocalAreas: 0,
        patientHasApoE4Allele: true,
        hasClinicalSymptoms: true,
        symptomSummary: 'New onset subacute occipital headache and visual blurring.'
      };

      const result = service.evaluateNeuropathologyAria(input);

      expect(result.ariaESeverity).toBe('MODERATE');
      expect(result.ariaHMicrobleedSeverity).toBe('MILD');
      expect(result.compositeSeverity).toBe('MODERATE');
      expect(result.recommendedAction).toBe('SUSPEND_DOSING_REPEAT_MRI');
      expect(result.mriSurveillanceIntervalWeeks).toBe(4);
      expect(result.fdaAppropriateUseCriterion).toContain('FDA AUC-2');
    });

    it('3. Mandates permanent discontinuation for severe ARIA-H microbleeds (>=10) or widespread superficial siderosis (>2)', () => {
      const input: IAriaNeuropathologyInput = {
        patientId: 'PATIENT-003',
        flairEdemaMaxDimensionCm: 0,
        flairEdemaLocationsCount: 0,
        flairSulcalEffusionPresent: false,
        t2SwiMicrobleedCount: 12,
        superficialSiderosisFocalAreas: 3,
        patientHasApoE4Allele: true,
        hasClinicalSymptoms: true
      };

      const result = service.evaluateNeuropathologyAria(input);

      expect(result.ariaHMicrobleedSeverity).toBe('SEVERE');
      expect(result.ariaHSiderosisSeverity).toBe('SEVERE');
      expect(result.compositeSeverity).toBe('SEVERE');
      expect(result.recommendedAction).toBe('DISCONTINUE_PERMANENTLY');
      expect(result.fdaAppropriateUseCriterion).toContain('FDA AUC-3');
    });
  });

  describe('Surgical Anatomy ARIA Engine (Anatomical Risk & Intraoperative Acuity)', () => {
    it('4. Computes composite corridor score and danger zones for high-complexity far-lateral approach', () => {
      const input: IAriaSurgicalAnatomyInput = {
        corridorName: 'Far-Lateral Transcondylar Craniovertebral Approach',
        corridorType: 'FAR_LATERAL_CRANIOVERTEBRAL',
        angleAttackDegrees: 22,
        workingDepthMm: 70,
        distanceToCriticalVesselMm: 1.5,
        distanceToCriticalNerveMm: 1.8,
        bonyResectionPercent: 55,
        requiresFusionStabilization: true,
        hasAberrantVascularAnatomy: true,
        hasOsseousVariation: true
      };

      const result = service.evaluateSurgicalAnatomyAria(input);

      expect(result.compositeAriaScore).toBeGreaterThanOrEqual(75);
      expect(result.acuityTier).toBe('STAT_CRITICAL_CORRIDOR');
      expect(result.dangerZoneWarnings.length).toBeGreaterThanOrEqual(3);
      expect(result.suggestedIntraoperativeMonitoring).toContain('Continuous Microvascular Doppler Flowmetry');
      expect(result.corridorHeatmapHex).toBe('#ef4444');
    });

    it('5. Computes low-risk baseline score for standard open corridor without aberrant variations', () => {
      const input: IAriaSurgicalAnatomyInput = {
        corridorName: 'Standard Lumbar Microdiscectomy',
        corridorType: 'TRANSFORAMINAL_LUMBAR',
        angleAttackDegrees: 75,
        workingDepthMm: 35,
        distanceToCriticalVesselMm: 15.0,
        distanceToCriticalNerveMm: 8.0,
        bonyResectionPercent: 10,
        requiresFusionStabilization: false,
        hasAberrantVascularAnatomy: false,
        hasOsseousVariation: false
      };

      const result = service.evaluateSurgicalAnatomyAria(input);

      expect(result.compositeAriaScore).toBeLessThan(30);
      expect(result.acuityTier).toBe('LOW_RISK');
      expect(result.corridorHeatmapHex).toBe('#10b981');
    });
  });

  describe('Accessibility & FHIR R4 Integration', () => {
    it('6. Evaluates WAI-ARIA and clinical accessibility certification', () => {
      const audit = service.evaluateAccessibilityAudit();

      expect(audit.wcagAaaCertified).toBe(true);
      expect(audit.overallAriaAccessibilityScorePercent).toBeGreaterThanOrEqual(95);
      expect(audit.tamperProofAuditDigest).toBeDefined();
    });

    it('7. Serializes ARIA result into compliant FHIR R4 Observation with cryptographic seal', () => {
      const npResult = service.evaluateNeuropathologyAria(service.neuropathologyInput());
      const fhirObservation = service.serializeToFhirObservation('NEUROPATHOLOGY', npResult);

      expect(fhirObservation['resourceType']).toBe('Observation');
      expect(fhirObservation['status']).toBe('final');
      expect((fhirObservation['component'] as Array<{ code: { text: string }; valueString: string }>).length).toBe(5);
    });
  });
});
