import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WhoNihHealingGoalsService } from './who-nih-healing-goals.service';
import { GlobalHealingParadigmsService } from './global-healing-paradigms.service';
import { PatientStateService } from './patient-state.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('WhoNihHealingGoalsService Unit Suite', () => {
  let service: WhoNihHealingGoalsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WhoNihHealingGoalsService, GlobalHealingParadigmsService, PatientStateService]
    });
    service = TestBed.inject(WhoNihHealingGoalsService);
  });

  it('1. Computes the multi-goal strategic summary with high fulfillment score', () => {
    const summary = service.strategicSummary();
    expect(summary).toBeTruthy();
    expect(summary.overallStrategicFulfillmentScore).toBeGreaterThanOrEqual(85);
    expect(summary.activeStrategicGoals.length).toBe(6);
  });

  it('2. Exposes grounded Machine Learning Contextual Assurance parameters', () => {
    const ml = service.strategicSummary().machineLearningAssurance;
    expect(ml.conformalPredictionCoveragePercent).toBe(95.2);
    expect(ml.leakFreeGroupKFoldValidationScore).toBeGreaterThan(0.90);
    expect(ml.epistemicOodUncertaintyScore).toBeLessThan(0.15);
    expect(ml.pinnBiophysicalLossPenalty).toBeGreaterThan(0);
  });

  it('3. Aligns healing paradigms with WHO SDG 3.4 and NIH NCCIH Whole Person Health', () => {
    const goals = service.strategicSummary().activeStrategicGoals;
    const sdg34 = goals.find(g => g.goalId === 'WHO_SDG_3_4_NCD_PREVENTION');
    const nccih = goals.find(g => g.goalId === 'NIH_NCCIH_WHOLE_PERSON_HEALTH');

    expect(sdg34).toBeDefined();
    expect(sdg34?.contributingParadigms).toContain('naturopathic_nd');
    expect(sdg34?.contributingParadigms).toContain('traditional_chinese');

    expect(nccih).toBeDefined();
    expect(nccih?.contributingParadigms).toContain('functional_systems');
    expect(nccih?.contributingParadigms).toContain('ayurvedic');
  });

  it('4. Provides WHO ICD-11 Chapter 26 ICTM codified diagnoses', () => {
    const ictm = service.strategicSummary().whoIctmCodifiedDiagnoses;
    expect(ictm.length).toBeGreaterThanOrEqual(3);
    expect(ictm[0].ictmCode).toBe('TM-TM12.1');
    expect(ictm[0].traditionalConcept).toContain('Liver Qi Stagnation');
  });

  it('5. Computes WHO ICOPE intrinsic capacity domain scores', () => {
    const capacity = service.strategicSummary().intrinsicCapacityDomains;
    expect(capacity.vitality).toBeGreaterThanOrEqual(80);
    expect(capacity.cognition).toBeGreaterThanOrEqual(80);
    expect(capacity.locomotion).toBeGreaterThanOrEqual(80);
  });
});
