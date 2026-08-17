import { TestBed } from '@angular/core/testing';
import { AddictionMedicineRecoveryService } from './addiction-medicine-recovery.service';

describe('AddictionMedicineRecoveryService', () => {
  let service: AddictionMedicineRecoveryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AddictionMedicineRecoveryService]
    });
    service = TestBed.inject(AddictionMedicineRecoveryService);
  });

  it('should formulate Bernese micro-induction protocol for chronic opioid/fentanyl dependence', () => {
    const report = service.evaluateAddictionRecovery({
      patientAge: 34,
      primarySubstance: 'Opioids_Fentanyl',
      durationOfUseMonths: 18,
      lastUseHoursAgo: 8,
      priorPrecipitatedWithdrawalHistory: true,
      currentWithdrawalSymptoms: {
        tachycardiaPulseOver100: true,
        diaphoresisSweating: true,
        tremorsOrRestlessness: true,
        pupilDilationMydriasis: true,
        gastrointestinalDistress: true,
        severeAnxietyOrCravings: true
      }
    });

    expect(report.reportId).toContain('SUD-REC-');
    expect(report.objectiveScoreSummary.scaleUsed).toBe('COWS');
    expect(report.objectiveScoreSummary.numericalScore).toBeGreaterThanOrEqual(13);
    expect(report.precisionPharmacotherapyPlan.berneseMicroInductionRequired).toBe(true);
    expect(report.precisionPharmacotherapyPlan.recommendedMedication).toContain('Bernese Micro-Induction');
    expect(report.harmReductionAndOverdoseSafeguards.naloxoneNarcanEmergencyDirectives).toContain('Naloxone');
    expect(report.nonStigmatizingFhirSummary.hipaaSanitizationVerified).toBe(true);
  });

  it('should identify severe alcohol withdrawal emergency when hallucinations are present', () => {
    const report = service.evaluateAddictionRecovery({
      patientAge: 48,
      primarySubstance: 'Alcohol',
      durationOfUseMonths: 36,
      lastUseHoursAgo: 16,
      priorPrecipitatedWithdrawalHistory: false,
      currentWithdrawalSymptoms: {
        diaphoresisSweating: true,
        tremorsOrRestlessness: true,
        visualOrTactileHallucinations: true,
        severeAnxietyOrCravings: true
      }
    });

    expect(report.objectiveScoreSummary.scaleUsed).toBe('CIWA_AR');
    expect(report.withdrawalSeverityTier).toBe('SEVERE_CRITICAL_EMERGENCY');
    expect(report.objectiveScoreSummary.clinicalInterpretation).toContain('delirium tremens');
    expect(report.precisionPharmacotherapyPlan.recommendedMedication).toContain('Acamprosate');
  });
});
