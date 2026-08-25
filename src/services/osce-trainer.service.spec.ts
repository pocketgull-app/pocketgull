import '@angular/compiler';
import { OsceTrainerService } from './osce-trainer.service';
import { createEnvironmentInjector, EnvironmentInjector, runInInjectionContext } from '@angular/core';

describe('OsceTrainerService', () => {
  let service: OsceTrainerService;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = createEnvironmentInjector([], undefined as any);

    runInInjectionContext(injector, () => {
      service = new OsceTrainerService();
    });
  });

  it('should initialize with 3 default OSCE clinical scenarios', () => {
    expect(service).toBeTruthy();
    expect(service.scenarios().length).toBe(3);
    expect(service.selectedScenario().id).toBe('osce_sibi_cardio');
  });

  it('should switch active scenario cleanly', () => {
    service.selectScenario('osce_edwin_smith');
    expect(service.selectedScenario().id).toBe('osce_edwin_smith');
    expect(service.selectedScenario().category).toBe('Trauma / Surgical Codex');
  });

  it('should evaluate candidate response and return PASSED status for accurate diagnosis', () => {
    service.selectScenario('osce_sibi_cardio');
    const result = service.evaluateAttempt(
      'Generalized Stage II Periodontitis with Systemic Inflammatory Endothelial Strain',
      'hs-CRP repeat panel, Periodontal scaling & root planing (SRP), HbA1c screening'
    );

    expect(result.overallScore).toBeGreaterThanOrEqual(65);
    expect(result.status).toContain('PASSED');
    expect(result.matchedDiagnoses.length).toBeGreaterThan(0);
    expect(result.matchedOrders.length).toBeGreaterThan(0);
  });
});
