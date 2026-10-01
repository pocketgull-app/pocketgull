import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SmoeDecisionFlowExplorerComponent } from './smoe-decision-flow-explorer.component';
import { ClinicalMoERouterService } from '../services/clinical-moe-router.service';

describe('SmoeDecisionFlowExplorerComponent', () => {
  let component: SmoeDecisionFlowExplorerComponent;
  let fixture: ComponentFixture<SmoeDecisionFlowExplorerComponent>;
  let moeRouter: ClinicalMoERouterService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmoeDecisionFlowExplorerComponent],
      providers: [
        ClinicalMoERouterService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SmoeDecisionFlowExplorerComponent);
    component = fixture.componentInstance;
    moeRouter = TestBed.inject(ClinicalMoERouterService);
    fixture.detectChanges();
  });

  it('1. should create and expose 10 canonical shift patient cases', () => {
    expect(component).toBeTruthy();
    expect(component.shiftRoster.length).toBe(10);
    expect(component.selectedPatientId()).toBe('p001');
  });

  it('2. should display active decision flow for default patient p001', () => {
    const flow = component.activeFlow();
    expect(flow).not.toBeNull();
    expect(flow?.patientId).toBe('p001');
    expect(flow?.patientName).toContain('Homo Sapiens');
    expect(flow?.resultingRouting.primaryExpertId).toBe('ismp-posology');
    expect(flow?.resultingRouting.secondaryExpertId).toBe('counterfactual-simulator');
  });

  it('3. should update activeFlow when selecting another patient case', () => {
    component.selectPatient('p_charles_darwin');
    fixture.detectChanges();

    expect(component.selectedPatientId()).toBe('p_charles_darwin');
    const flow = component.activeFlow();
    expect(flow).not.toBeNull();
    expect(flow?.patientName).toBe('Charles Darwin');
    expect(flow?.clinicalDomain).toContain('Dysautonomia');
    expect(flow?.resultingRouting.primaryExpertId).toBe('counterfactual-simulator');
    expect(flow?.resultingRouting.bridgeTitle).toContain('Vagal Coherence');
  });

  it('4. should load patient into live canvas and emit close event', () => {
    let closed = false;
    component.closeModal.subscribe(() => {
      closed = true;
    });

    component.loadIntoLiveCanvas('p002');
    expect(moeRouter.activeShiftPatientId()).toBe('p002');
    expect(closed).toBe(true);
  });

  it('5. should emit askAi event when requested', () => {
    let aiRequestedPatient: string | null = null;
    component.askAi.subscribe(pId => {
      aiRequestedPatient = pId;
    });

    component.askAiExplanation('p003');
    expect(aiRequestedPatient).toBe('p003');
  });
});
