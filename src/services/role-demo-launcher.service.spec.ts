import '@angular/compiler';
import { RoleDemoLauncherService } from './role-demo-launcher.service';
import { RolePathwayDocsService } from './role-pathway-docs.service';

describe('RoleDemoLauncherService - Role-Tailored Clinical Demo Suite', () => {
  let service: RoleDemoLauncherService;

  beforeEach(() => {
    const docsService = new RolePathwayDocsService();
    service = new RoleDemoLauncherService(null, docsService);
  });

  it('1. Provides 5 tailored role-based demo scenarios', () => {
    const scenarios = service.getScenarios();
    expect(scenarios.length).toBe(5);

    const roles = scenarios.map(s => s.roleId);
    expect(roles).toContain('clinician');
    expect(roles).toContain('resident');
    expect(roles).toContain('researcher');
    expect(roles).toContain('executive');
    expect(roles).toContain('patient');
  });

  it('2. Launches clinician demo scenario with p001 and rxguard initial tab', () => {
    const scenario = service.launchRoleDemo('clinician');
    expect(scenario.patientId).toBe('p001');
    expect(scenario.initialActiveTab).toBe('rxguard');
    expect(scenario.highlightedModules).toContain('RxGuard PGx');
  });

  it('3. Launches resident demo scenario with p002 and osce initial tab', () => {
    const scenario = service.launchRoleDemo('resident');
    expect(scenario.patientId).toBe('p002');
    expect(scenario.initialActiveTab).toBe('osce');
    expect(scenario.highlightedModules).toContain('Residency OSCE Simulator');
  });

  it('4. Launches patient demo scenario with p007 and sms bridge initial tab', () => {
    const scenario = service.launchRoleDemo('patient');
    expect(scenario.patientId).toBe('p007');
    expect(scenario.initialActiveTab).toBe('sms');
    expect(scenario.highlightedModules).toContain('SMS Compass Bridge');
  });
});
