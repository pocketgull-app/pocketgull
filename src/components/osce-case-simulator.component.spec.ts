import { Injector, runInInjectionContext } from '@angular/core';
import { OsceCaseSimulatorComponent } from './osce-case-simulator.component';
import { OsceTrainerService } from '../services/osce-trainer.service';

describe('OsceCaseSimulatorComponent', () => {
  let component: OsceCaseSimulatorComponent;
  let service: OsceTrainerService;

  beforeEach(() => {
    service = new OsceTrainerService();
    const injector = Injector.create({
      providers: [
        { provide: OsceTrainerService, useValue: service }
      ]
    });

    component = runInInjectionContext(injector, () => new OsceCaseSimulatorComponent());
  });

  it('should initialize with default scenario and empty user inputs', () => {
    expect(component).toBeTruthy();
    expect(component.trainer.selectedScenario().id).toBe('osce_sibi_cardio');
    expect(component.userDiagnosis()).toBe('');
    expect(component.userOrders()).toBe('');
    expect(component.showSocraticHint()).toBe(false);
  });

  it('should generate relevant Socratic preceptor hints per scenario', () => {
    expect(component.socraticHintText()).toContain('inflammatory marker bridges periodontal pocket depth');
    
    component.selectScenario('osce_edwin_smith');
    expect(component.socraticHintText()).toContain('Edwin Smith Surgical Codex Case IV');
  });

  it('should evaluate diagnostic attempt and calculate overall score', () => {
    component.selectScenario('osce_sibi_cardio');
    component.userDiagnosis.set('Generalized Stage II Periodontitis, Elevated Cardiovascular Risk');
    component.userOrders.set('hs-CRP repeat panel, Periodontal scaling & root planing (SRP)');

    component.evaluateAttempt();
    const result = component.trainer.evaluationResult();
    expect(result).toBeTruthy();
    expect(result!.overallScore).toBeGreaterThanOrEqual(60);
    expect(result!.status).toContain('PASSED');
  });

  it('should load gold-standard reasoning and achieve high distinction score', () => {
    component.selectScenario('osce_sibi_cardio');
    component.applyGoldenGuidance();
    
    expect(component.userDiagnosis()).toContain('Periodontitis');
    expect(component.userOrders()).toContain('hs-CRP');

    component.evaluateAttempt();
    const result = component.trainer.evaluationResult();
    expect(result!.overallScore).toBeGreaterThanOrEqual(85);
    expect(result!.status).toBe('PASSED WITH DISTINCTION');
  });

  it('should advance to next scenario cyclically', () => {
    expect(component.trainer.activeScenarioId()).toBe('osce_sibi_cardio');
    component.advanceToNextScenario();
    expect(component.trainer.activeScenarioId()).toBe('osce_edwin_smith');
    component.advanceToNextScenario();
    expect(component.trainer.activeScenarioId()).toBe('osce_gompertz_longevity');
    component.advanceToNextScenario();
    expect(component.trainer.activeScenarioId()).toBe('osce_sibi_cardio');
  });
});
