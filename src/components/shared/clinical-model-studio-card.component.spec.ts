import '@angular/compiler';
import { runInInjectionContext, createEnvironmentInjector } from '@angular/core';
import { ClinicalModelStudioCardComponent } from './clinical-model-studio-card.component';
import { ClinicalFineTuningOrchestratorService } from '../../services/clinical-fine-tuning-orchestrator.service';

describe('ClinicalModelStudioCardComponent Suite', () => {
  let component: ClinicalModelStudioCardComponent;
  let orchestrator: ClinicalFineTuningOrchestratorService;

  beforeEach(() => {
    orchestrator = new ClinicalFineTuningOrchestratorService();
    const injector = createEnvironmentInjector([
      { provide: ClinicalFineTuningOrchestratorService, useValue: orchestrator }
    ], undefined as any);

    component = runInInjectionContext(injector, () => new ClinicalModelStudioCardComponent());
  });

  it('should initialize successfully with default subTab as dpo', () => {
    expect(component).toBeTruthy();
    expect(component.activeSubTab()).toBe('dpo');
    expect(component.downloadSuccess()).toBe(false);
  });

  it('should allow switching sub-tabs including modelGarden', () => {
    component.activeSubTab.set('io');
    expect(component.activeSubTab()).toBe('io');

    component.activeSubTab.set('cli');
    expect(component.activeSubTab()).toBe('cli');

    component.activeSubTab.set('modelGarden');
    expect(component.activeSubTab()).toBe('modelGarden');
  });

  it('should interact with orchestrator service for paradigm selection', () => {
    orchestrator.selectParadigm('pharmacogenomics_pgx');
    expect(component.orchestrator.selectedParadigmId()).toBe('pharmacogenomics_pgx');
    expect(component.orchestrator.activeParadigm().name).toContain('Pharmacogenomics');
  });
});
