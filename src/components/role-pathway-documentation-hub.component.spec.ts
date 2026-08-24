import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { RolePathwayDocumentationHubComponent } from './role-pathway-documentation-hub.component';
import { RolePathwayDocsService } from '../services/role-pathway-docs.service';

describe('RolePathwayDocumentationHubComponent - Continuous 5-Stage Clinical Workflow Stepper', () => {
  let component: RolePathwayDocumentationHubComponent;
  let docsService: RolePathwayDocsService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        RolePathwayDocsService,
        RolePathwayDocumentationHubComponent
      ]
    });

    component = runInInjectionContext(injector, () => injector.get(RolePathwayDocumentationHubComponent));
    docsService = injector.get(RolePathwayDocsService);
  });

  it('1. Initializes with Stage 1 selected for Clinician pathway', () => {
    expect(component.activePathwayId()).toBe('clinician');
    expect(component.selectedStageNumber()).toBe(1);

    const activeStage = component.selectedWorkflowStage();
    expect(activeStage.stageId).toBe('intake');
    expect(activeStage.targetTabId).toBe('scribe');
    expect(activeStage.keyOutputs.length).toBeGreaterThanOrEqual(3);
  });

  it('2. Navigates sequentially across stages 1 through 5', () => {
    expect(component.selectedStageNumber()).toBe(1);

    // Forward progression
    component.nextStage();
    expect(component.selectedStageNumber()).toBe(2);
    expect(component.selectedWorkflowStage().stageId).toBe('consult');

    component.nextStage();
    expect(component.selectedStageNumber()).toBe(3);
    expect(component.selectedWorkflowStage().stageId).toBe('careplan');

    component.nextStage();
    expect(component.selectedStageNumber()).toBe(4);
    expect(component.selectedWorkflowStage().stageId).toBe('soundscape');

    component.nextStage();
    expect(component.selectedStageNumber()).toBe(5);
    expect(component.selectedWorkflowStage().stageId).toBe('outcomes');

    // Clamps at 5
    component.nextStage();
    expect(component.selectedStageNumber()).toBe(5);

    // Backward progression
    component.previousStage();
    expect(component.selectedStageNumber()).toBe(4);

    // Clamps at 1
    component.previousStage();
    component.previousStage();
    component.previousStage();
    component.previousStage();
    expect(component.selectedStageNumber()).toBe(1);
  });

  it('3. Resets to Stage 1 when switching clinical role pathways', () => {
    component.nextStage();
    component.nextStage();
    expect(component.selectedStageNumber()).toBe(3);

    component.selectPathway('resident');
    expect(component.activePathwayId()).toBe('resident');
    expect(component.selectedStageNumber()).toBe(1);
    expect(component.selectedWorkflowStage().targetTabId).toBe('osce');
  });

  it('4. Emits navigateToTab when launching a stage', () => {
    let emittedTab = '';
    component.navigateToTab.subscribe((tabId: string) => {
      emittedTab = tabId;
    });

    component.launchStage('dxradar');
    expect(emittedTab).toBe('dxradar');
  });
});
