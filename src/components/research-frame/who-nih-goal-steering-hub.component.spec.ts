import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WhoNihGoalSteeringHubComponent } from './who-nih-goal-steering-hub.component';
import { PatientStateService } from '../../services/patient-state.service';
import { ClinicalMoERouterService } from '../../services/clinical-moe-router.service';

describe('WhoNihGoalSteeringHubComponent Suite', () => {
  let component: WhoNihGoalSteeringHubComponent;
  let fixture: ComponentFixture<WhoNihGoalSteeringHubComponent>;
  let patientState: PatientStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhoNihGoalSteeringHubComponent],
      providers: [
        PatientStateService,
        ClinicalMoERouterService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WhoNihGoalSteeringHubComponent);
    component = fixture.componentInstance;
    patientState = TestBed.inject(PatientStateService);
    fixture.detectChanges();
  });

  it('1. Initializes WhoNihGoalSteeringHubComponent with default goals', () => {
    expect(component).toBeTruthy();
    const goals = component.goals();
    expect(goals.length).toBeGreaterThanOrEqual(4);

    const sdg = goals.find(g => g.framework === 'WHO_SDG');
    expect(sdg).toBeDefined();
    expect(sdg?.title).toContain('WHO SDG 3.4');
  });

  it('2. Filters goals by selected framework tab', () => {
    component.activeFramework.set('WHO_HEARTS');
    fixture.detectChanges();

    const filtered = component.filteredGoals();
    expect(filtered.length).toBe(1);
    expect(filtered[0].framework).toBe('WHO_HEARTS');
    expect(filtered[0].title).toContain('HEARTS Protocol');
  });

  it('3. Dynamically reflects patient vitals in progress and status', () => {
    // Normal vitals
    patientState.vitals.set({
      bp: '118/76',
      hr: '72',
      temp: '98.6',
      spO2: '99',
      weight: '70kg',
      height: '175cm',
      cgmGlucoseMgDl: '95'
    });
    fixture.detectChanges();

    let goals = component.goals();
    let sdg = goals.find(g => g.framework === 'WHO_SDG');
    expect(sdg?.status).toBe('ON_TRACK');

    // Elevated vitals
    patientState.vitals.set({
      bp: '155/98',
      hr: '105',
      temp: '98.6',
      spO2: '97',
      weight: '70kg',
      height: '175cm',
      cgmGlucoseMgDl: '145'
    });
    fixture.detectChanges();

    goals = component.goals();
    sdg = goals.find(g => g.framework === 'WHO_SDG');
    expect(sdg?.status).toBe('ATTENTION_REQUIRED');
  });

  it('4. Emits selectQuery output when steering research', () => {
    let emitted: { query: string; engine: 'pubmed' | 'gse' | 'google' } | undefined;
    component.selectQuery.subscribe((event) => {
      emitted = event;
    });

    const ithrivGoal = component.goals().find(g => g.framework === 'NIH_CTSA_ITHRIV');
    expect(ithrivGoal).toBeDefined();

    component.steerResearch(ithrivGoal!);

    expect(emitted).toBeDefined();
    expect(emitted?.engine).toBe('gse');
    expect(emitted?.query).toContain('GSE131900');
  });
});
