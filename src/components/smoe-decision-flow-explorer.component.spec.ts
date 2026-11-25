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

  it('6. should toggle Selector Hysteresis skill lock and STAT Safety Shield simulation', () => {
    expect(moeRouter.committedPrimaryExpertId()).toBeNull();
    component.toggleHysteresisLock();
    expect(moeRouter.committedPrimaryExpertId()).toBe('analysis-report');

    component.toggleHysteresisLock();
    expect(moeRouter.committedPrimaryExpertId()).toBeNull();

    expect(moeRouter.activeSelectorDecision().safetyShieldActive).toBe(false);
    component.toggleRedFlagSimulation();
    fixture.detectChanges();
    expect(moeRouter.activeSelectorDecision().safetyShieldActive).toBe(true);
    expect(moeRouter.activeSelectorDecision().regime).toBe('STAT Safety Shield (Red-Flag Preemption)');

    component.toggleRedFlagSimulation();
    expect(moeRouter.activeSelectorDecision().safetyShieldActive).toBe(false);
  });

  it('7. should operate interactive Curriculum & Ablation Lab scrubbers and adversarial probes', () => {
    expect(component.isAblationLabOpen()).toBe(false);
    component.toggleAblationLab();
    fixture.detectChanges();
    expect(component.isAblationLabOpen()).toBe(true);

    // Inject adversarial STEMI + 5 SDOH distractors probe: H0 vs Treatment must diverge
    component.injectAdversarialDistractorProbe();
    fixture.detectChanges();
    const ablation = moeRouter.activeAblationComparison();
    expect(ablation.divergedFromControl).toBe(true);
    expect(ablation.controlPrimaryId).toBe('sdoh-navigator');
    expect(ablation.treatmentPrimaryId).toBe('edge-ml-hud');
    expect(ablation.maskedCount).toBe(8);
    expect(ablation.probabilitySumValid).toBe(true);

    // Reset and scrub SpO2 Perceptor below 90% cliff (86%)
    component.resetLabControls();
    component.onSpO2Input({ target: { value: '86' } } as unknown as Event);
    expect(moeRouter.activePerceptorState().spO2Percent).toBe(86);
    expect(moeRouter.activeSelectorDecision().safetyShieldActive).toBe(true);

    // Scrub Hysteresis deadband and run Jitter Probe
    component.resetLabControls();
    component.injectJitterProbe();
    expect(moeRouter.activeAblationComparison().divergedFromControl).toBe(true);
    expect(moeRouter.activeAblationComparison().treatmentPrimaryId).toBe('analysis-report');
    expect(moeRouter.activeAblationComparison().controlPrimaryId).toBe('counterfactual-simulator');

    component.resetLabControls();
    expect(moeRouter.activePerceptorState().redFlagDetected).toBe(false);
  });
});
