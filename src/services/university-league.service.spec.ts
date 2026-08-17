import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { UniversityLeagueService } from './university-league.service';

describe('UniversityLeagueService (Selectable Schools & SNOMED CT Location Suggestions)', () => {
  let service: UniversityLeagueService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [UniversityLeagueService]
    });
    service = runInInjectionContext(injector, () => injector.get(UniversityLeagueService));
  });

  it('1. Initializes default inter-university leaderboard and scores', () => {
    const scores = service.scores();
    expect(scores.length).toBe(12);
    expect(scores[0].schoolName).toContain('Stanford');
    expect(service.totalActiveStudents()).toBeGreaterThan(1000);
  });

  it('2. Computes total philanthropic contributions from student quest completions', () => {
    expect(service.totalPhilanthropicUsd()).toBeGreaterThan(50000);
    expect(service.interSchoolQuests().length).toBe(4);
  });

  it('3. Allows dynamic school selection & transfer', () => {
    expect(service.currentAffiliation().schoolId).toBe('stanford');
    service.selectSchool('mit');
    expect(service.currentAffiliation().schoolId).toBe('mit');
    expect(service.currentAffiliation().schoolName).toContain('MIT');
  });

  it('4. Provides SNOMED CT location suggestions by city/state query', () => {
    const suggestions = service.suggestLocationsBySnomed('Cambridge');
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].displayName).toContain('MIT');
    expect(suggestions[0].snomedCode).toContain('224670002');
  });
});
