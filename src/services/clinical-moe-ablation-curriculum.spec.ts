// SPDX-License-Identifier: Apache-2.0
import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { createEnvironmentInjector, EnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { ClinicalMoERouterService, REGISTERED_UI_EXPERTS } from './clinical-moe-router.service';
import { PatientStateService } from './patient-state.service';
import { MOCK_PATIENTS } from '../mock-patients';

describe('Composable SMoE Curriculum & Popperian H0 Ablation Benchmark Suite', () => {
  let router: ClinicalMoERouterService;
  let injector: EnvironmentInjector;
  let mockPatientState: {
    patientId: ReturnType<typeof signal<string>>;
    patientName: ReturnType<typeof signal<string>>;
    patientAge: ReturnType<typeof signal<number>>;
    patientGender: ReturnType<typeof signal<string>>;
    patientGoals: ReturnType<typeof signal<string>>;
    isEmergencyMode: ReturnType<typeof signal<boolean>>;
    issues: ReturnType<typeof signal<Record<string, any[]>>>;
    vitals: ReturnType<typeof signal<Record<string, string>>>;
  };

  const ACUTE_STAT_IDS = new Set(['edge-ml-hud', 'ismp-posology', 'soap-generator', 'steeep-quality-hud']);

  beforeEach(() => {
    mockPatientState = {
      patientId: signal('p001'),
      patientName: signal('Test Patient'),
      patientAge: signal(54),
      patientGender: signal('male'),
      patientGoals: signal(''),
      isEmergencyMode: signal(false),
      issues: signal({}),
      vitals: signal({ hr: '72', bp: '120/80', spO2: '98%', cgmGlucoseMgDl: '110' })
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState }
    ], undefined as unknown as EnvironmentInjector);

    runInInjectionContext(injector, () => {
      router = new ClinicalMoERouterService();
    });
  });

  it('Experiment 1: Adversarial Red-Flag Distractor Sweep across all 21 MOCK_PATIENTS (H0 vs Composable Shield)', () => {
    expect(MOCK_PATIENTS.length).toBeGreaterThanOrEqual(21);

    const adversarialPrompts = [
      'crushing chest pain stemi housing food insecurity snap copay community health navigator',
      'facial droop slurred speech be-fast clinical trial recruiting phase orphan disease study investigator',
      'suicidal ideation c-ssrs crisis what-if scenario weight bmi diet exercise projection hypothetical'
    ];

    let totalTrials = 0;
    let controlFalseCalmCount = 0;
    let treatmentFalseCalmCount = 0;

    for (const patient of MOCK_PATIENTS) {
      mockPatientState.patientId.set(patient.id);
      mockPatientState.patientName.set(patient.name);
      mockPatientState.issues.set((patient.issues as Record<string, any[]>) || {});
      mockPatientState.vitals.set(((patient.vitals as unknown) as Record<string, string>) || { hr: '72', bp: '120/80', spO2: '98%' });

      for (const prompt of adversarialPrompts) {
        totalTrials++;
        router.pinExpert(null);
        router.setSafetyShieldEnabled(true);
        router.setTranscriptQuery(prompt);

        const controlTop1 = router.baselineControlGatingScores()[0];
        const treatmentTop1 = router.uiGatingScores()[0];
        const ablation = router.activeAblationComparison();

        if (!ACUTE_STAT_IDS.has(controlTop1.expert.id)) {
          controlFalseCalmCount++;
        }
        if (!ACUTE_STAT_IDS.has(treatmentTop1.expert.id)) {
          treatmentFalseCalmCount++;
        }

        // Probability conservation & finite safety invariant
        expect(ablation.probabilitySumValid).toBe(true);
        expect(ablation.maskedCount).toBe(8);
        expect(treatmentTop1.expert.id).toBe('edge-ml-hud');
      }
    }

    // H0 falsified: Flat Softmax suffers massive false-calm distraction (>80%), while Composable Shield is 0%
    expect(totalTrials).toBe(MOCK_PATIENTS.length * adversarialPrompts.length);
    expect(controlFalseCalmCount).toBeGreaterThan(Math.floor(totalTrials * 0.8));
    expect(treatmentFalseCalmCount).toBe(0);
  });

  it('Experiment 2: Streaming Transcript Jitter & Slot-Thrash Sweep across Hysteresis Deadbands', () => {
    // Word-by-word ambient consultation stream where 3-keyword counterfactual chatter briefly edges past
    // Summary Overview (+2.1 vs +1.8), causing raw argmax to thrash 5 times before the genuine posology shift
    const streamingSteps = [
      'reviewing general care plan overview',
      'what-if scenario projection',
      'back to holistic summary overview',
      'diet weight projection',
      'returning to care plan protocols',
      'bmi simulation hypothetical',
      'now shifting to urgent medication dosage metformin posology renal clearance interaction statin prescription'
    ];

    const margins = [0.0, 0.08, 0.16, 0.22];
    const flipCountsByMargin: Record<number, number> = {};

    for (const margin of margins) {
      router.clearOverrides();
      router.setHysteresisMargin(margin);

      let flips = 0;
      let prevTop1 = router.primaryUiExpert()!.expert.id;
      if (margin > 0) {
        router.commitCurrentPrimarySkill();
      }

      for (const stepText of streamingSteps) {
        router.setTranscriptQuery(stepText);
        const currentTop1 = router.primaryUiExpert()!.expert.id;
        if (currentTop1 !== prevTop1) {
          flips++;
          prevTop1 = currentTop1;
          if (margin > 0) {
            router.commitCurrentPrimarySkill();
          }
        }
      }
      flipCountsByMargin[margin] = flips;

      // Regardless of hysteresis margin, genuine 8-keyword pharmacological shift at the end MUST succeed
      expect(router.primaryUiExpert()?.expert.id).toBe('ismp-posology');
    }

    // Raw argmax (0%) flips 7 times on chatter, whereas ±22% deadband filters all chatter and flips ONLY once!
    expect(flipCountsByMargin[0.0]).toBeGreaterThanOrEqual(5);
    expect(flipCountsByMargin[0.22]).toBe(1);
    expect(flipCountsByMargin[0.0]).toBeGreaterThan(flipCountsByMargin[0.22]);
  });

  it('Experiment 3: Physiological Perceptor Boundary Grid (SpO2, Systolic BP, CGM Cliffs & Softmax Conservation)', () => {
    const spO2Grid = [99, 95, 92, 90, 89, 84];
    const sbpGrid = [122, 95, 86, 85, 215, 222];
    const cgmGrid = [110, 72, 55, 53, 44, 240];

    let gridPointsEvaluated = 0;

    for (const spO2 of spO2Grid) {
      for (const sbp of sbpGrid) {
        for (const cgm of cgmGrid) {
          gridPointsEvaluated++;
          router.setLabVitalsOverride({
            spO2Percent: spO2,
            systolicBpMmHg: sbp,
            cgmGlucoseMgDl: cgm
          });

          const perceptor = router.activePerceptorState();
          const selector = router.activeSelectorDecision();
          const scores = router.uiGatingScores();

          const expectedRedFlag = spO2 < 90 || sbp <= 85 || sbp >= 220 || cgm < 54;
          expect(perceptor.redFlagDetected).toBe(expectedRedFlag);
          expect(selector.safetyShieldActive).toBe(expectedRedFlag);

          // Verify probability axiom: non-negative, finite, sums to ~1.0 across all 216 physiological states
          const weightSum = scores.reduce((acc, item) => acc + item.weight, 0);
          expect(Number.isFinite(weightSum)).toBe(true);
          expect(Math.abs(weightSum - 1.0)).toBeLessThanOrEqual(0.02);

          for (const s of scores) {
            expect(s.weight).toBeGreaterThanOrEqual(0);
            expect(s.weight).toBeLessThanOrEqual(1);
          }
        }
      }
    }

    expect(gridPointsEvaluated).toBe(216);
  });

  it('Experiment 4: Working-Memory Ceiling (WM <= 4) & Intentional Clinician Pin Governance under Active Shield', () => {
    // Trigger STAT red flag via hypoxemia
    router.setLabVitalsOverride({ spO2Percent: 85 });
    expect(router.activeSelectorDecision().safetyShieldActive).toBe(true);

    // Sweep k requests including out-of-bounds values (0, 1, 2, 3, 99) -> WM ceiling must never exceed 4
    for (const requestedK of [0, 1, 2, 3, 99]) {
      router.setKValue(requestedK);
      const decision = router.activeSelectorDecision();
      expect(decision.activeSlotCount).toBeGreaterThanOrEqual(1);
      expect(decision.activeSlotCount).toBeLessThanOrEqual(decision.workingMemoryBudgetMax);
      expect(decision.workingMemoryBudgetMax).toBe(4);
    }

    // Verify human-in-the-loop sovereignty: explicit clinician pin intentionally overrides automated shield
    for (const expert of REGISTERED_UI_EXPERTS) {
      router.pinExpert(expert.id);
      expect(router.primaryUiExpert()?.expert.id).toBe(expert.id);
      expect(router.primaryUiExpert()?.isSafetyMasked).toBe(false);
    }

    router.clearOverrides();
    expect(router.pinnedExpertId()).toBeNull();
  });
});
