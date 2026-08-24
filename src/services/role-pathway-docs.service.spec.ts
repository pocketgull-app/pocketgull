import '@angular/compiler';
import { RolePathwayDocsService, ClinicalRolePathway } from './role-pathway-docs.service';

describe('RolePathwayDocsService - Dynamic Role-Based Pathways & Documentation', () => {
  let service: RolePathwayDocsService;

  beforeEach(() => {
    service = new RolePathwayDocsService();
  });

  it('1. Provides 5 distinct clinical role pathways', () => {
    const pathways = service.getAllPathways();
    expect(pathways.length).toBe(5);

    const ids = pathways.map(p => p.pathwayId);
    expect(ids).toContain('clinician');
    expect(ids).toContain('resident');
    expect(ids).toContain('researcher');
    expect(ids).toContain('executive');
    expect(ids).toContain('patient');
  });

  it('2. Customizes tone, objectives, and recommended tools per pathway', () => {
    const clinicianDoc = service.getPathway('clinician');
    expect(clinicianDoc.recommendedTools.some(t => t.tabId === 'rxguard')).toBe(true);
    expect(clinicianDoc.regulatoryAndStandards).toContain('CPIC Levels A/B');

    const residentDoc = service.getPathway('resident');
    expect(residentDoc.recommendedTools.some(t => t.tabId === 'osce')).toBe(true);
    expect(residentDoc.regulatoryAndStandards).toContain('ACGME Milestones 2.0');

    const patientDoc = service.getPathway('patient');
    expect(patientDoc.toneAndDensity).toContain('8th-grade');
  });

  it('3. Updates active pathway signal dynamically', () => {
    expect(service.activePathway()).toBe('clinician');
    service.setPathway('researcher');
    expect(service.activePathway()).toBe('researcher');
  });

  it('4. Provides continuous 5-stage sequential workflow for all 5 roles', () => {
    const roles: ClinicalRolePathway[] = ['clinician', 'resident', 'researcher', 'executive', 'patient'];

    for (const role of roles) {
      const stages = service.getWorkflowStages(role);
      expect(stages.length).toBe(5);

      const stageNumbers = stages.map(s => s.stageNumber);
      expect(stageNumbers).toEqual([1, 2, 3, 4, 5]);

      const stageIds = stages.map(s => s.stageId);
      expect(stageIds).toEqual(['intake', 'consult', 'careplan', 'soundscape', 'outcomes']);

      for (const stage of stages) {
        expect(stage.title.length).toBeGreaterThan(3);
        expect(stage.subtitle.length).toBeGreaterThan(3);
        expect(stage.targetTabId.length).toBeGreaterThan(1);
        expect(stage.clinicalObjective.length).toBeGreaterThan(10);
        expect(stage.keyOutputs.length).toBeGreaterThanOrEqual(3);
        expect(stage.evidenceOrStandard.length).toBeGreaterThan(3);
      }
    }
  });

  it('5. Retrieves specific workflow stage by number for active pathway', () => {
    service.setPathway('clinician');
    const stage2 = service.getWorkflowStage(2);
    expect(stage2).toBeDefined();
    expect(stage2?.stageId).toBe('consult');
    expect(stage2?.targetTabId).toBe('dxradar');

    const stage4 = service.getWorkflowStage(4);
    expect(stage4?.stageId).toBe('soundscape');
    expect(stage4?.targetTabId).toBe('soundscape');
  });
});
