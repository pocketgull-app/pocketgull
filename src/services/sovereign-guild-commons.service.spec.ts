import { describe, it, expect, beforeEach } from 'vitest';
import { SovereignGuildCommonsService } from './sovereign-guild-commons.service';

describe('SovereignGuildCommonsService', () => {
  let service: SovereignGuildCommonsService;

  beforeEach(() => {
    service = new SovereignGuildCommonsService();
  });

  it('1. Initializes Ostrom 8 Principles with default high baseline resilience', () => {
    const principles = service.ostromPrinciples();
    expect(principles.length).toBe(8);
    expect(service.commonsResilienceIndex()).toBeGreaterThanOrEqual(70);
  });

  it('2. Dynamically recalculates Commons Resilience Index when principle scores change', () => {
    // Drop scores to minimum
    for (let i = 1; i <= 8; i++) {
      service.setScore(i, 1);
    }
    expect(service.commonsResilienceIndex()).toBe(20); // (8 / 40) * 100 = 20%

    // Elevate scores to maximum
    for (let i = 1; i <= 8; i++) {
      service.setScore(i, 5);
    }
    expect(service.commonsResilienceIndex()).toBe(100); // (40 / 40) * 100 = 100%
  });

  it('3. Detects CRITICAL_RISK status on vulnerable Ostrom principles', () => {
    service.setScore(1, 1); // Clear boundaries dropped to 1
    const p1 = service.ostromPrinciples().find(p => p.principleNumber === 1);
    expect(p1?.status).toBe('CRITICAL_RISK');
    expect(p1?.concreteRemediation).toContain('Charter');
  });

  it('4. Provides full anti-enclosure playbook against predatory bond defaults and school closures', () => {
    const playbook = service.antiEnclosurePlaybook;
    expect(playbook.length).toBe(4);
    const step1 = playbook.find(s => s.stepNumber === 1);
    expect(step1?.communityDefenseAction).toContain('FOIA Debt Audit');
    const step2 = playbook.find(s => s.stepNumber === 2);
    expect(step2?.communityDefenseAction).toContain('Community Land Trust');
  });

  it('5. Contains autonomous guild apprenticeship modules across essential arts', () => {
    const modules = service.guildModules;
    expect(modules.length).toBe(4);
    const repair = modules.find(m => m.id === 'mod-repair-arts');
    expect(repair).toBeDefined();
    expect(repair?.coreCompetencies.some(c => c.includes('soldering'))).toBe(true);

    const ecology = modules.find(m => m.id === 'mod-agro-ecology');
    expect(ecology).toBeDefined();
    expect(ecology?.coreCompetencies.some(c => c.includes('compost'))).toBe(true);
  });

  it('6. Generates complete printable Elinor Ostrom Commons Charter Markdown', () => {
    const charter = service.generateCommonsCharterMarkdown();
    expect(charter).toContain('# COVENANT & GOVERNANCE CHARTER');
    expect(charter).toContain('Article I: Clear Boundaries');
    expect(charter).toContain('Article V: Graduated Restorative Sanctions');
    expect(charter).toContain('Article VIII: Nested Polycentric Federation');
    expect(charter).toContain('Elinor Ostrom');
  });
});
