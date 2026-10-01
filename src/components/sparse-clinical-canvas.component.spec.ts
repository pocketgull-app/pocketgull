import '@angular/compiler';
import { SparseClinicalCanvasComponent } from './sparse-clinical-canvas.component';
import { runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { ClinicalMoERouterService } from '../services/clinical-moe-router.service';
import { PatientStateService } from '../services/patient-state.service';
import { ThemeService } from '../services/theme.service';

describe('SparseClinicalCanvasComponent', () => {
  let component: SparseClinicalCanvasComponent;
  let moeRouter: ClinicalMoERouterService;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = createEnvironmentInjector([
      ClinicalMoERouterService,
      PatientStateService,
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
    expect(component.latentExperts().length).toBe(6);
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
});
