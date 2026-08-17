import { TestBed } from '@angular/core/testing';
import { SocraticEvidenceLiteracyService } from './socratic-evidence-literacy.service';

describe('SocraticEvidenceLiteracyService', () => {
  let service: SocraticEvidenceLiteracyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SocraticEvidenceLiteracyService]
    });
    service = TestBed.inject(SocraticEvidenceLiteracyService);
  });

  it('should be created and have preset claims', () => {
    expect(service).toBeTruthy();
    expect(service.presetClaims.length).toBe(4);
    expect(service.activeAnalysis()).toBeNull();
  });

  it('should accurately evaluate periodontal SIBI claim with Level A evidence and low bias', () => {
    const analysis = service.evaluateClaim('Treating periodontal pockets lowers systemic hs-CRP inflammation and cardiovascular risk.');
    expect(analysis.analyzedTopic).toBe('Periodontal-Systemic Cross-Talk (SIBI)');
    expect(analysis.evidenceTier).toContain('Level A');
    expect(analysis.correlationVsCausationCheck.isCausalProven).toBe(true);
    expect(analysis.cochraneRoB2Radar.randomizationBias).toBe('Low Risk');
    expect(analysis.canonicalCitations.length).toBeGreaterThan(0);
  });

  it('should detect high risk of bias and confounders on resveratrol claim', () => {
    const analysis = service.evaluateClaim('Red wine and resveratrol supplements reverse vascular aging in humans.');
    expect(analysis.analyzedTopic).toBe('Resveratrol & Sirtuin Agonists');
    expect(analysis.evidenceTier).toContain('Level C');
    expect(analysis.correlationVsCausationCheck.isCausalProven).toBe(false);
    expect(analysis.correlationVsCausationCheck.healthyUserBiasRisk).toBe(true);
    expect(analysis.socraticCounterQuestions.length).toBeGreaterThan(0);
  });

  it('should evaluate non-diabetic CGM usage critically', () => {
    const analysis = service.evaluateClaim('Healthy non-diabetics must use a continuous glucose monitor to prevent spikes.');
    expect(analysis.analyzedTopic).toBe('Non-Diabetic Continuous Glucose Monitoring');
    expect(analysis.correlationVsCausationCheck.isCausalProven).toBe(false);
    expect(analysis.falsifiabilityStatus).toBe('Falsifiable but Unproven');
  });
});
