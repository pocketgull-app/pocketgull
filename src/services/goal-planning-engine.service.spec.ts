import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { GoalPlanningEngineService } from './goal-planning-engine.service';

describe('GoalPlanningEngineService (FHIR R4 Goal Setting & Quest Decomposition)', () => {
  let service: GoalPlanningEngineService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [GoalPlanningEngineService]
    });
    service = runInInjectionContext(injector, () => injector.get(GoalPlanningEngineService));
  });

  it('1. Initializes default FHIR clinical goals and active count', () => {
    const goals = service.goals();
    expect(goals.length).toBe(3);
    expect(service.activeCount()).toBe(3);
    expect(goals[0].targetMetricName).toBe('HRV RMSSD');
  });

  it('2. Decomposes user intent into a new FHIR-compliant SMART Goal', () => {
    const newGoal = service.createSmartGoal(
      'Deep REM Sleep Extension',
      'STRESS_RESILIENCE',
      'Nocturnal REM Duration',
      120,
      'mins',
      '😴🌙'
    );
    expect(newGoal.lifecycleStatus).toBe('active');
    expect(service.goals().length).toBe(4);
  });
});
