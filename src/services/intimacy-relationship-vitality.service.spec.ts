import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { IntimacyRelationshipVitalityService } from './intimacy-relationship-vitality.service';

describe('IntimacyRelationshipVitalityService - Couples Relationship & Cardiovascular Safety Engine', () => {
  let service: IntimacyRelationshipVitalityService;

  beforeEach(() => {
    service = new IntimacyRelationshipVitalityService();
  });

  it('1. Flags absolute contraindication for concurrent Nitrates and PDE-5 inhibitors with washout intervals', () => {
    const assessment = service.evaluateCardiacSafety({
      canClimbTwoFlightsStairs: true,
      medications: ['Nitroglycerin Sublingual Spray', 'Tadalafil 10mg']
    });

    expect(assessment.riskTier).toBe('HIGH_RISK_CONTRAINDICATED');
    expect(assessment.nitratePde5Status.isContraindicated).toBe(true);
    expect(assessment.nitratePde5Status.requiredWashoutHours).toBe(48); // Tadalafil requires 48h
    expect(assessment.recommendations.some(r => r.includes('ABSOLUTE CONTRAINDICATION'))).toBe(true);
  });

  it('2. Evaluates low-risk status for patients achieving >= 4 METs (2 flights of stairs)', () => {
    const assessment = service.evaluateCardiacSafety({
      canClimbTwoFlightsStairs: true,
      medications: ['Atorvastatin 20mg', 'Lisinopril 10mg']
    });

    expect(assessment.riskTier).toBe('LOW_RISK');
    expect(assessment.metCapacity).toBeGreaterThanOrEqual(4.0);
    expect(assessment.nitratePde5Status.isContraindicated).toBe(false);
    expect(assessment.recommendations.some(r => r.includes('Low Cardiovascular Risk'))).toBe(true);
  });

  it('3. Flags intermediate risk when patient cannot climb 2 flights of stairs or has severe hypertension', () => {
    const assessment = service.evaluateCardiacSafety({
      canClimbTwoFlightsStairs: false,
      medications: ['Metoprolol 50mg'],
      systolicBP: 168
    });

    expect(assessment.riskTier).toBe('INTERMEDIATE_RISK');
    expect(assessment.recommendations.some(r => r.includes('Intermediate Risk'))).toBe(true);
  });

  it('4. Provides evidence-based adaptive positioning guides for orthopedic and stroke conditions', () => {
    const guides = service.getAdaptiveGuides();
    expect(guides.length).toBeGreaterThanOrEqual(4);

    const hipGuide = guides.find(g => g.injuryOrCondition.includes('Hip'))!;
    expect(hipGuide.primaryRiskToAvoid).toContain('flexion');
    expect(hipGuide.snomedCode).toBe('52734007');

    const strokeGuide = guides.find(g => g.injuryOrCondition.includes('Stroke'))!;
    expect(strokeGuide.recommendedSupports.length).toBeGreaterThanOrEqual(2);
    expect(strokeGuide.icd10Code).toBe('I69.359');
  });

  it('5. Generates energy pacing plans for chronic fatigue and post-exertional malaise (PEM)', () => {
    const plans = service.getEnergyPlans();
    expect(plans.length).toBeGreaterThanOrEqual(1);

    const plan = plans[0];
    expect(plan.spoonAllocation.prepPhase).toBeDefined();
    expect(plan.environmentalPacingTips.length).toBeGreaterThanOrEqual(2);
    expect(plan.nutritionDigestiveTiming).toContain('2 hours');
  });
});
