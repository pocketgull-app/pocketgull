import { TestBed } from '@angular/core/testing';
import { ClinicalSocialWorkNavigatorService } from './clinical-social-work-navigator.service';

describe('ClinicalSocialWorkNavigatorService', () => {
  let service: ClinicalSocialWorkNavigatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClinicalSocialWorkNavigatorService]
    });
    service = TestBed.inject(ClinicalSocialWorkNavigatorService);
  });

  it('should map housing instability, food insecurity, and utility shutoff into ICD-10 Z-codes', () => {
    const report = service.evaluateSocialWorkNeeds({
      patientAge: 68,
      housingStatus: 'At_Risk_Of_Eviction',
      foodSecurityLevel: 'Severe_Hunger_Skip_Meals',
      transportationAccess: 'Zero_Transportation_Barrier',
      utilityInsecurity: true,
      caregiverSupportStatus: 'Sole_Caregiver_High_Strain',
      caregiverSubjectiveBurdenScore: 68,
      insuranceCoverage: 'Medicaid_Dual_Eligible',
      recentHospitalAdmissionsLast12Months: 2
    });

    expect(report.reportId).toContain('LCSW-NAV-');
    expect(report.sdohRiskTier).toBe('HIGH_CRITICAL_RISK');
    expect(report.icd10ZCodeAssignments.some(z => z.zCode === 'Z59.81')).toBe(true); // Housing instability
    expect(report.icd10ZCodeAssignments.some(z => z.zCode === 'Z59.41')).toBe(true); // Food insecurity
    expect(report.icd10ZCodeAssignments.some(z => z.zCode === 'Z59.87')).toBe(true); // Utility insecurity
    expect(report.icd10ZCodeAssignments.some(z => z.zCode === 'Z63.6')).toBe(true);  // Caregiver strain

    expect(report.caregiverRespitePlan).toBeDefined();
    expect(report.caregiverRespitePlan?.zaritBurdenSeverity).toBe('SEVERE_BURNOUT_RISK');
    expect(report.caregiverRespitePlan?.recommendedRespiteHoursPerWeek).toBe(24);
    expect(report.caregiverRespitePlan?.adultDayHealthCareEligibility).toBe(true);

    expect(report.dischargeSafetyReadmissionRisk.estimated30DayReadmissionRiskPercent).toBeGreaterThan(40);
    expect(report.socialWorkerVicariousTraumaShield.administrativeDocumentationReductionMinutes).toBe(120);
  });
});
