import { TestBed } from '@angular/core/testing';
import { FutureCarePlanningService } from './future-care-planning.service';

describe('FutureCarePlanningService', () => {
  let service: FutureCarePlanningService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FutureCarePlanningService]
    });
    service = TestBed.inject(FutureCarePlanningService);
  });

  it('should generate a 10/20/30-year multi-decade healthspan projection and statutory FHIR Consent', () => {
    const report = service.generateFuturePlan({
      patientAge: 52,
      currentHealthStatus: 'Optimal_Vitality',
      primaryValuesAndDignityGoals: [
        'Maintain independent physical mobility and cognitive lucidity',
        'Spend quality time outdoors with grandchildren'
      ],
      refusalOfInvasiveInterventionsUnderIrreversibleLoss: true,
      designatedHealthcareProxyRelationship: 'Adult_Child',
      financialHealthspanPriorities: ['Medicare_IRMAA_Avoidance', 'Long_Term_Care_Home_Independence'],
      baselineBiomarkers: {
        cacScore: 0,
        apob_mg_dL: 68,
        vo2Max_mL_kg_min: 44,
        hba1c_percent: 5.1
      }
    });

    expect(report.planId).toContain('FUTURE-CARE-');
    expect(report.multiDecadalHealthspanProjections.tenYearHorizonAge).toBe(62);
    expect(report.multiDecadalHealthspanProjections.twentyYearHorizonAge).toBe(72);
    expect(report.multiDecadalHealthspanProjections.thirtyYearHorizonAge).toBe(82);
    expect(report.multiDecadalHealthspanProjections.keyPreventiveMilestoneChecklist.length).toBe(3);

    expect(report.valuesBasedAdvanceCareDirective.cprAndMechanicalVentilationPreference).toBe('Time_Limited_Trial');
    expect(report.valuesBasedAdvanceCareDirective.artificialNutritionHydrationPreference).toBe('Comfort_Oral_Only');
    expect(report.valuesBasedAdvanceCareDirective.surrogateDecisionMakerGuidance).toContain('Adult_Child');

    expect(report.fhirConsentResource.resourceType).toBe('Consent');
    expect(report.fhirConsentResource.status).toBe('active');
    expect(report.healthEconomicsAndLtcSecurity.estimatedHomeIndependenceSavingsUsd).toBeGreaterThan(100000);
  });
});
