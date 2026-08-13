import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { YouthMentorshipService } from './youth-mentorship.service';

describe('YouthMentorshipService (Youth Giving Back & Volunteer Corps)', () => {
  let service: YouthMentorshipService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [YouthMentorshipService]
    });
    service = runInInjectionContext(injector, () => injector.get(YouthMentorshipService));
  });

  it('1. Initializes default youth volunteer programs and total service hours', () => {
    const programs = service.programs();
    expect(programs.length).toBe(3);
    expect(service.totalVolunteerHours()).toBeGreaterThan(4000);
  });

  it('2. Logs verified service hours and updates impact telemetry', () => {
    service.logServiceHours('prog-001', 5);
    const updatedProg = service.programs().find(p => p.id === 'prog-001');
    expect(updatedProg?.verifiedHoursCount).toBe(1425);
  });
});
