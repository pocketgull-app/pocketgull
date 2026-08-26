import '@angular/compiler';
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

  it('3. Advances quest progress and transitions achievement status to achieved', () => {
    const goal = service.goals()[0]; // 3/5 quests completed
    service.completeQuest(goal.id); // 4/5
    expect(service.goals()[0].completedQuestsCount).toBe(4);
    expect(service.goals()[0].achievementStatus).toBe('in-progress');

    service.completeQuest(goal.id); // 5/5
    expect(service.goals()[0].completedQuestsCount).toBe(5);
    expect(service.goals()[0].achievementStatus).toBe('achieved');
    expect(service.calculateProgress(service.goals()[0])).toBe(100);
  });

  it('4. Updates current metric value reactively', () => {
    const goal = service.goals()[1];
    service.updateMetricValue(goal.id, 82);
    expect(service.goals()[1].currentValue).toBe(82);
  });

  it('5. Exports clinical goal to standardized HL7 FHIR R4 Goal resource', () => {
    const goal = service.goals()[0];
    const fhirGoal = service.exportToFhirGoal(goal, 'patient-xyz');

    expect(fhirGoal.resourceType).toBe('Goal');
    expect(fhirGoal.id).toBe(goal.id);
    expect(fhirGoal.subject.reference).toBe('Patient/patient-xyz');
    expect(fhirGoal.category[0].coding[0].system).toContain('pocketgull.app');
    expect(fhirGoal.target[0].detailQuantity.value).toBe(goal.targetValue);
    expect(fhirGoal.target[0].detailQuantity.unit).toBe(goal.unit);
    expect(fhirGoal.note?.[0].text).toContain('Assigned AI Clinical Persona');
  });
});
