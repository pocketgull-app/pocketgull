import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { OrToolsGoalOptimizerService } from './or-tools-goal-optimizer.service';

describe('OrToolsGoalOptimizerService (Google OR-Tools Multi-Objective Health, Hobby & Travel Optimization)', () => {
  let service: OrToolsGoalOptimizerService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [OrToolsGoalOptimizerService]
    });
    service = runInInjectionContext(injector, () => injector.get(OrToolsGoalOptimizerService));
  });

  it('1. Initializes default hobbies, travel allocations, and optimization schedule', () => {
    expect(service.activeHobbies().length).toBe(3);
    expect(service.activeTravels().length).toBe(1);
    
    const schedule = service.optimizedSchedule();
    expect(schedule.constraintSatisfactionStatus).toBe('OPTIMAL');
    expect(schedule.healthGoalFulfillmentPct).toBe(94);
  });

  it('2. Aligns hobbies with health goal requirements in recommended quests', () => {
    const schedule = service.optimizedSchedule();
    expect(schedule.recommendedQuests.length).toBe(3);
    expect(schedule.recommendedQuests[0]).toContain('Morning Trail Hikes');
  });
});
