import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { SsaDisabilityNavigatorService } from './ssa-disability-navigator.service';

describe('SsaDisabilityNavigatorService Unit Suite', () => {
  let service: SsaDisabilityNavigatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SsaDisabilityNavigatorService]
    });
    service = TestBed.inject(SsaDisabilityNavigatorService);
  });

  it('1. Initializes with default claimant profile and calculates baseline assessment', () => {
    expect(service).toBeTruthy();
    const report = service.assessment();
    expect(report.claimantStatus).toContain('54y/o');
    expect(report.matchedListings.length).toBeGreaterThan(0);
    expect(report.availableForms.length).toBe(3);
    expect(report.auditProvenanceHash).toContain('SSA-FHIR-PROV-');
  });

  it('2. Correctly screens for Compassionate Allowances (CAL) condition (ALS)', () => {
    service.primaryDiagnosis.set('Amyotrophic Lateral Sclerosis (ALS) with bulbar onset');
    const report = service.assessment();
    expect(report.calAssessment.isCalIdentified).toBe(true);
    expect(report.calAssessment.matchedCondition).toBe('Amyotrophic Lateral Sclerosis (ALS)');
    expect(report.calAssessment.fastTrackProcessingDays).toBe(14);
    expect(report.calAssessment.guidelineRecommendation).toContain('POMS DI 23022.000');
    expect(report.rfcAssessment.overallDisabilityLikelihood).toBe('High (Meets Listing)');
  });

  it('3. Accurately matches SSA Blue Book Listing 4.02 for Chronic Heart Failure when LVEF <= 30%', () => {
    service.primaryDiagnosis.set('Chronic Heart Failure NYHA Class IV');
    service.ejectionFractionPercent.set(24);
    const report = service.assessment();
    const listing402 = report.matchedListings.find(l => l.listingId === '4.02');
    expect(listing402).toBeDefined();
    expect(listing402?.isSatisfied).toBe(true);
    expect(listing402?.matchScorePercent).toBe(100);
    expect(listing402?.cfrCitation).toBe('20 CFR Part 404, Subpart P, App. 1, § 4.02');
    expect(report.rfcAssessment.physicalRfcLevel).toBe('Sedentary');
  });

  it('4. Evaluates SSA Medical-Vocational Grid Rules (Rule 201.09) for claimants age 50+ with Sedentary RFC and heavy work history', () => {
    service.primaryDiagnosis.set('Lumbar canal stenosis without acute radiculopathy');
    service.secondaryDiagnosis.set('Hypertension');
    service.claimantAge.set(55);
    service.isAmbulatoryAssistanceRequired.set(true);
    service.pastRelevantWork.set('Heavy Physical');
    const report = service.assessment();
    expect(report.rfcAssessment.overallDisabilityLikelihood).toBe('High (Meets Listing)');
  });

  it('5. Generates pre-populated SSA-3368-BK, SSA-3373-BK, and SSA-44 forms with pristine provenance', () => {
    const report = service.assessment();
    const ssa3368 = report.availableForms.find(f => f.formId === 'SSA-3368-BK');
    const ssa3373 = report.availableForms.find(f => f.formId === 'SSA-3373-BK');
    const ssa44 = report.availableForms.find(f => f.formId === 'SSA-44');

    expect(ssa3368?.preFilledFields['claimantAge']).toBe(54);
    expect(ssa3373?.preFilledFields['sittingCapacityHours']).toBe(4);
    expect(ssa44?.preFilledFields['qualifyingEvent']).toBe('WORK_STOPPAGE_DISABILITY');
  });
});
