import '@angular/compiler';
import { expect } from 'vitest';
import { MandiantClinicalDefenseService } from './mandiant-clinical-defense.service';

describe('MandiantClinicalDefenseService Unit Suite', () => {
  let service: MandiantClinicalDefenseService;

  beforeEach(() => {
    service = new MandiantClinicalDefenseService();
  });

  it('1. Initializes with tracked Mandiant healthcare threat actors (UNC2596, FIN12, APT41, UNC3944)', () => {
    const actors = service.threatActors();
    expect(actors.length).toBeGreaterThanOrEqual(4);
    expect(actors.some(a => a.name.includes('UNC2596'))).toBe(true);
    expect(actors.some(a => a.name.includes('FIN12'))).toBe(true);
    expect(actors.some(a => a.name.includes('APT41'))).toBe(true);
    expect(actors.some(a => a.name.includes('Scattered Spider'))).toBe(true);
  });

  it('2. Maps MITRE ATLAS Adversarial AI tactics with active countermeasures', () => {
    const tactics = service.atlasTactics();
    expect(tactics.length).toBe(4);
    expect(tactics.some(t => t.mitreAtlasId === 'AML.T0043')).toBe(true);
    expect(tactics.every(t => t.countermeasureStatus === 'ACTIVE_GUARDED')).toBe(true);
  });

  it('3. Computes valid defense posture with active zero-trust enforcement', () => {
    const posture = service.defensePosture();
    expect(posture.systemIntegrityScore).toBeGreaterThan(90);
    expect(posture.activeZeroTrustEnforced).toBe(true);
    expect(posture.threatLevel).toBe('DEFCON_4_GUARDED');
  });

  it('4. Successfully triggers and resets emergency containment protocol', () => {
    service.triggerEmergencyContainment();
    expect(service.isContainmentModeActive()).toBe(true);
    expect(service.defensePosture().threatLevel).toBe('DEFCON_1_CRITICAL');

    const snapshots = service.forensicSnapshots();
    expect(snapshots[0].severity).toBe('CRITICAL');
    expect(snapshots[0].containmentApplied).toContain('External egress severed');

    service.resetContainment();
    expect(service.isContainmentModeActive()).toBe(false);
    expect(service.defensePosture().threatLevel).toBe('DEFCON_4_GUARDED');
  });
});
