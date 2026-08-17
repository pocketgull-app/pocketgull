import { TestBed } from '@angular/core/testing';
import { YouthNeurodevelopmentHygieneService } from './youth-neurodevelopment-hygiene.service';

describe('YouthNeurodevelopmentHygieneService', () => {
  let service: YouthNeurodevelopmentHygieneService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [YouthNeurodevelopmentHygieneService]
    });
    service = TestBed.inject(YouthNeurodevelopmentHygieneService);
  });

  it('should detect high circadian suppression and digital dopamine load in high-screen users', () => {
    const report = service.evaluateYouthHygiene({
      ageYears: 19,
      dailyScreenTimeHours: 9.5,
      lateNightScreenUseMinutes: 110,
      attentionalFragmentationScore: 9,
      subjectiveExamOrSocialAnxietyScale: 8,
      isEarlyCareerClinicianOrStudent: false,
      menstrualCyclePhase: 'Luteal'
    });

    expect(report.reportId).toContain('YOUTH-COG-');
    expect(report.digitalDopamineLoadIndex).toBeGreaterThan(70);
    expect(report.circadianMelatoninSuppressionRisk).toBe('HIGH_SUPPRESSION');
    expect(report.attentiveRestorationPlan.kaplanNatureResetMinutes).toBe(25);
    expect(report.attentiveRestorationPlan.binauralAutonomicPacingFrequencyHz).toBe(6.0); // 6Hz Theta for high anxiety
    expect(report.hormonalOrMetabolicSovereigntyDirectives.some(d => d.includes('Luteal'))).toBe(true);
    expect(report.actionableDailyRegimen.length).toBe(4);
  });

  it('should provide clinical reasoning and burnout scaffolding for medical students', () => {
    const report = service.evaluateYouthHygiene({
      ageYears: 25,
      dailyScreenTimeHours: 6.0,
      lateNightScreenUseMinutes: 45,
      attentionalFragmentationScore: 5,
      subjectiveExamOrSocialAnxietyScale: 4,
      isEarlyCareerClinicianOrStudent: true,
      menstrualCyclePhase: 'Not_Applicable'
    });

    expect(report.earlyCareerClinicianScaffolding).toBeDefined();
    expect(report.earlyCareerClinicianScaffolding?.electronicDocumentationEliminationMinutes).toBe(150);
    expect(report.earlyCareerClinicianScaffolding?.socraticDiagnosticCoachingTip).toContain('cannot-miss');
  });
});
