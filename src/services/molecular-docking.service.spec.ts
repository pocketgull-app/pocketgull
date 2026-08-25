import '@angular/compiler';
import { expect } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { MolecularDockingService } from './molecular-docking.service';

describe('MolecularDockingService 3D AlphaFold Biophysics Suite', () => {
  let service: MolecularDockingService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [MolecularDockingService]
    });
    service = runInInjectionContext(injector, () => injector.get(MolecularDockingService));
  });

  it('should initialize with standard protein targets and botanical/drug ligands', () => {
    expect(service.proteinTargets.length).toBeGreaterThanOrEqual(4);
    expect(service.ligandMolecules.length).toBeGreaterThanOrEqual(4);
    expect(service.selectedTarget().pdbId).toBe('7PZC'); // NLRP3
    expect(service.selectedLigand().id).toBe('akba');
  });

  it('should compute thermodynamic binding affinity and inhibition constant (Ki)', () => {
    const result = service.dockingResult();
    expect(result.deltaGKcalPerMol).toBeLessThan(0); // Exergonic favorable binding
    expect(result.inhibitionConstantKiMicroMolar).toBeGreaterThan(0);
    expect(result.hydrogenBondsCount).toBeGreaterThan(0);
    expect(result.status).toBe('Docked');
  });

  it('should switch target and ligand and trigger re-docking', () => {
    const collagen = service.proteinTargets.find(t => t.id === 'collagen2')!;
    const ha = service.ligandMolecules.find(l => l.id === 'hyaluronic_acid')!;

    service.setTarget(collagen);
    service.setLigand(ha);

    expect(service.selectedTarget().id).toBe('collagen2');
    expect(service.selectedLigand().id).toBe('hyaluronic_acid');
    expect(service.dockingResult().deltaGKcalPerMol).toBeCloseTo(-7.6, 1);
  });
});
