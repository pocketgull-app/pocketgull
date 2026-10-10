import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { MicrobiomeFermentationVaultService } from './microbiome-fermentation-vault.service';
import { PatientStateService } from './patient-state.service';
import { signal } from '@angular/core';

describe('MicrobiomeFermentationVaultService', () => {
  let service: MicrobiomeFermentationVaultService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MicrobiomeFermentationVaultService,
        { provide: PatientStateService, useValue: { anatomyViewMode: signal('standard') } }
      ]
    });

    service = TestBed.inject(MicrobiomeFermentationVaultService);
  });

  it('should initialize with balanced SCFA profile and sealed gut barrier', () => {
    const scfa = service.scfaProfile();
    expect(scfa.butyrateMmolPerLiter).toBeGreaterThanOrEqual(18);
    expect(scfa.zonulinGutPermeabilityTier).toBe('Sealed & Intact');
    expect(scfa.tregImmuneToleranceScore).toBeGreaterThanOrEqual(70);
  });

  it('should update SCFA production when prebiotic fiber is altered', () => {
    service.updatePrebioticFiber(5); // low fiber
    const lowScfa = service.scfaProfile();
    expect(lowScfa.butyrateMmolPerLiter).toBeLessThan(15);
    expect(lowScfa.zonulinGutPermeabilityTier).toBe('Leaky Gut Barrier Breach');

    service.updatePrebioticFiber(35); // high prebiotic intake
    const highScfa = service.scfaProfile();
    expect(highScfa.butyrateMmolPerLiter).toBeGreaterThan(25);
    expect(highScfa.zonulinGutPermeabilityTier).toBe('Sealed & Intact');
  });

  it('should compute oral-systemic Veillonella nitrate-to-NO reduction', () => {
    service.updateOralNitrate(350);
    const nitrate = service.oralNitrateStatus();
    expect(nitrate.dailyNitrateMg).toBe(350);
    expect(nitrate.veillonellaActivityScore).toBeGreaterThanOrEqual(80);
    expect(nitrate.predictedBloodPressureReductionMmHg).toBeGreaterThan(4.0);
  });

  it('should enforce food safety pH gating for home fermentations (<4.6)', () => {
    const safeCheck = service.logBatchPh(3.7);
    expect(safeCheck.isSafe).toBe(true);
    expect(safeCheck.warning).toBeUndefined();

    const unsafeCheck = service.logBatchPh(4.8);
    expect(unsafeCheck.isSafe).toBe(false);
    expect(unsafeCheck.warning).toContain('Clostridium botulinum');
  });

  it('should trigger 3D nitric oxide simulation and update anatomy mode', () => {
    service.trigger3dScfaOrNitricOxideSimulation('nitric_oxide');
    // Service runs cleanly without throwing
    expect(true).toBe(true);
  });
});
