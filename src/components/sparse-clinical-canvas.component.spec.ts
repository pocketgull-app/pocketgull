import '@angular/compiler';
import { SparseClinicalCanvasComponent } from './sparse-clinical-canvas.component';
import { runInInjectionContext, createEnvironmentInjector, EnvironmentInjector, signal } from '@angular/core';
import { ClinicalMoERouterService } from '../services/clinical-moe-router.service';
import { PatientStateService } from '../services/patient-state.service';
import { ThemeService } from '../services/theme.service';

describe('SparseClinicalCanvasComponent', () => {
  let component: SparseClinicalCanvasComponent;
  let moeRouter: ClinicalMoERouterService;
  let mockPatientState: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockPatientState = {
      liveAgentInput: signal(''),
      isLiveAgentActive: signal(false),
      isEmergencyMode: signal(false),
      issues: signal({}),
      vitals: signal({}),
      patientName: signal(''),
      patientAge: signal(0),
      patientGender: signal(''),
      updateVital: vi.fn()
    };

    injector = createEnvironmentInjector([
      ClinicalMoERouterService,
      { provide: PatientStateService, useValue: mockPatientState },
      ThemeService
    ], undefined as any);

    runInInjectionContext(injector, () => {
      moeRouter = injector.get(ClinicalMoERouterService);
      component = new SparseClinicalCanvasComponent();
    });
  });

  it('should initialize successfully with primary, secondary, and latent experts', () => {
    expect(component).toBeTruthy();
    expect(component.primaryExpert()).not.toBeNull();
    expect(component.secondaryExpert()).not.toBeNull();
    expect(component.latentExperts().length).toBe(10);
  });

  it('should adjust flex styles based on kValue and viewport proportioning', () => {
    moeRouter.setKValue(1);
    expect(component.primaryStyleFlex()).toBe('1 1 100%');

    moeRouter.setKValue(2);
    const flexVal = component.primaryStyleFlex();
    expect(flexVal).toContain('%');
    expect(component.secondaryStyleFlex()).toContain('%');
  });

  it('should route knee_oa scenario and expose active cross attention bridge', () => {
    moeRouter.loadDemoScenario('knee_oa');
    expect(component.primaryExpert()?.expert.id).toBe('knee-hologram');
    expect(component.secondaryExpert()?.expert.id).toBe('counterfactual-simulator');
    expect(component.crossBridge()?.id).toBe('bridge-knee-whatif');
  });

  it('should expose shiftRoster and handle shift patient selection', () => {
    expect(component.shiftRoster.length).toBe(10);

    const mockEvent = {
      target: { value: 'p001' }
    } as unknown as Event;

    component.onSelectShiftPatient(mockEvent);
    expect(moeRouter.activeShiftPatientId()).toBe('p001');
    expect(component.primaryExpert()?.expert.id).toBe('ismp-posology');

    const clearEvent = {
      target: { value: '' }
    } as unknown as Event;

    component.onSelectShiftPatient(clearEvent);
    expect(moeRouter.activeShiftPatientId()).toBeNull();
  });

  it('should trigger askAiToExplainFlow and populate liveAgentInput on PatientStateService', () => {
    const patientState = injector.get(PatientStateService);
    component.askAiToExplainFlow('p002');
    expect(patientState.liveAgentInput()).toContain('Homo Sapiens (Female, Asthma)');
    expect(patientState.liveAgentInput()).toContain('p002');
    expect(patientState.isLiveAgentActive()).toBe(true);
  });
});
