import '@angular/compiler';
import { ClinicalGameTheoryService } from './clinical-game-theory.service';

describe('ClinicalGameTheoryService Unit Suite', () => {
  let service: ClinicalGameTheoryService;

  beforeEach(() => {
    service = new ClinicalGameTheoryService();
  });

  it('1. Computes Stackelberg / Nash Equilibrium for adherence incentives', () => {
    const result = service.calculateOptimalAdherenceIncentive({
      patientId: 'p010',
      conditionName: 'Parkinson\'s & Cognitive Memory Loss',
      annualCopayCostUsd: 480,
      estAnnualHospitalizationRiskUsd: 12500
    });

    expect(result.optimalRebateSubsidyUsd).toBeGreaterThan(0);
    expect(result.patientStrategy.adherenceEffortPercent).toBeGreaterThanOrEqual(80);
    expect(result.payerStrategy.netPayerSavingsUsd).toBeGreaterThan(1000);
    expect(result.payerStrategy.isNashEquilibrium).toBe(true);
    expect(result.gameTheoryDirective).toContain('NASH EQUILIBRIUM REACHED');
  });

  it('2. Scales adherence effort based on patient effort friction factor', () => {
    const highFrictionResult = service.calculateOptimalAdherenceIncentive({
      patientId: 'p001',
      conditionName: 'Hypertension',
      annualCopayCostUsd: 240,
      estAnnualHospitalizationRiskUsd: 6000,
      patientEffortFrictionFactor: 400
    });

    expect(highFrictionResult.patientStrategy.adherenceEffortPercent).toBeLessThanOrEqual(95);
    expect(highFrictionResult.optimalRebateSubsidyUsd).toBeGreaterThan(0);
  });
});
