import '@angular/compiler';
import { expect } from 'vitest';
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
});
