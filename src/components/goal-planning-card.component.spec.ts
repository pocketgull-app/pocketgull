import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoalPlanningCardComponent } from './goal-planning-card.component';
import { GoalPlanningEngineService } from '../services/goal-planning-engine.service';

describe('GoalPlanningCardComponent', () => {
  let component: GoalPlanningCardComponent;
  let fixture: ComponentFixture<GoalPlanningCardComponent>;
  let service: GoalPlanningEngineService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoalPlanningCardComponent],
      providers: [GoalPlanningEngineService]
    }).compileComponents();

    fixture = TestBed.createComponent(GoalPlanningCardComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(GoalPlanningEngineService);
    fixture.detectChanges();
  });

  it('1. should render goal cards with active count', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Clinical SMART Goals');
    const cards = compiled.querySelectorAll('h3');
    expect(cards.length).toBe(3);
  });

  it('2. should advance quest when clicking complete quest button', () => {
    const initialCompleted = service.goals()[0].completedQuestsCount;
    component.onAdvanceQuest(service.goals()[0].id);
    expect(service.goals()[0].completedQuestsCount).toBe(initialCompleted + 1);
  });

  it('3. should generate FHIR R4 Goal JSON upon clicking Export FHIR', () => {
    const goal = service.goals()[0];
    component.onExportFhirGoal(goal);
    expect(component.exportedJsonPayload()).toBeTruthy();
    expect(component.exportedJsonPayload()).toContain('"resourceType": "Goal"');
  });
});
