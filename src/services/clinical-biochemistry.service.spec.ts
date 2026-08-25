import { ClinicalBiochemistryService } from './clinical-biochemistry.service';

describe('ClinicalBiochemistryService', () => {
  const service = new ClinicalBiochemistryService();

  it('1. Calculates Henderson-Hasselbalch blood pH buffering and acid-base status', () => {
    const normal = service.calculateHendersonHasselbalchBuffer(24, 40);
    expect(normal.calculatedPh).toBe(7.40);
    expect(normal.bufferState).toBe('Normal Homeostasis');

    const acidosis = service.calculateHendersonHasselbalchBuffer(16, 40);
    expect(acidosis.calculatedPh).toBeLessThan(7.35);
    expect(acidosis.bufferState).toBe('Metabolic Acidosis');
  });

  it('2. Calculates plasma osmolality and tonicity status', () => {
    const osmo = service.calculatePlasmaOsmolality(140, 90, 14);
    expect(osmo.osmolalityMOsmKg).toBeGreaterThan(270);
    expect(osmo.tonicityStatus).toBe('Isotonic');
  });

  it('3. Calculates GSH/GSSG redox potential and oxidative stress level', () => {
    const redox = service.calculateRedoxGlutathioneRatio(1000, 10);
    expect(redox.gshGssgRatio).toBe(100);
    expect(redox.cellularOxidativeState).toBe('Optimal Anti-Oxidant Reserve');
  });

  it('4. Evaluates Zinc/Copper and Calcium/Magnesium mineral stoichiometry', () => {
    const mineral = service.calculateMineralStoichiometry(100, 100, 9.5, 2.1);
    expect(mineral.zincCopperRatio).toBe(1.0);
    expect(mineral.calciumMagnesiumRatio).toBe(4.5);
  });
});
