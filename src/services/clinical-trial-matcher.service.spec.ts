import '@angular/compiler';
import { expect } from 'vitest';
import { ClinicalTrialMatcherService } from './clinical-trial-matcher.service';

describe('ClinicalTrialMatcherService Unit Suite', () => {
  let service: ClinicalTrialMatcherService;

  beforeEach(() => {
    service = new ClinicalTrialMatcherService();
  });

  it('1. Matches recruiting Parkinson disease clinical trials', () => {
    const trials = service.searchClinicalTrials({ conditionName: 'Parkinson Disease' });
    expect(trials.length).toBeGreaterThan(0);
    expect(trials[0].nctId).toBe('NCT05214789');
    expect(trials[0].overallStatus).toBe('RECRUITING');
    expect(trials[0].matchScorePercent).toBeGreaterThanOrEqual(90);
  });

  it('2. Dynamically generates trial match for uncataloged condition', () => {
    const trials = service.searchClinicalTrials({ conditionName: 'Glioblastoma Multiforme' });
    expect(trials.length).toBe(1);
    expect(trials[0].condition).toBe('Glioblastoma Multiforme');
    expect(trials[0].nctId).toContain('NCT0');
  });
});
