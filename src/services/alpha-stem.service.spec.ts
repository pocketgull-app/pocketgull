import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { AlphaStemService } from './alpha-stem.service';

describe('AlphaStemService Regenerative Suite', () => {
  let service: AlphaStemService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [AlphaStemService]
    });
    service = runInInjectionContext(injector, () => injector.get(AlphaStemService));
  });

  it('should initialize with baseline chronological and biological age', () => {
    expect(service.biologicalAgeYears()).toBe(54);
    expect(service.chronologicalAgeYears()).toBe(54);
    expect(service.dnaMethylationPercentage()).toBe(68.5);
    expect(service.yamanakaFactorsActive()).toBe(false);
  });

  it('should compute soft substrate matrix directing stem cells toward neurogenic lineage', () => {
    service.setSubstrateStiffness(0.8); // 0.8 kPa (Soft brain ECM)
    const lineage = service.lineageProbability();

    expect(lineage.neurogenic).toBeGreaterThan(lineage.myogenic);
    expect(lineage.neurogenic).toBeGreaterThan(lineage.osteogenic);
    expect(lineage.dominantLineage).toBe('Neurogenic (Neurons/Glia)');
  });

  it('should compute stiff substrate matrix directing stem cells toward osteogenic bone lineage', () => {
    service.setSubstrateStiffness(35); // 35 kPa (Rigid pre-calcified bone matrix)
    const lineage = service.lineageProbability();

    expect(lineage.osteogenic).toBeGreaterThan(lineage.neurogenic);
    expect(lineage.osteogenic).toBeGreaterThan(lineage.myogenic);
    expect(lineage.dominantLineage).toBe('Osteogenic (Cortical Bone/Osteoblast)');
  });

  it('should execute Yamanaka epigenetic reprogramming to reverse biological age', () => {
    service.triggerYamanakaReprogramming(28);

    expect(service.yamanakaFactorsActive()).toBe(true);
    expect(service.biologicalAgeYears()).toBe(28);
    expect(service.dnaMethylationPercentage()).toBe(31.2);
    expect(service.oct4Sox2Klf4ExpressionLevel()).toBe(92);
    expect(service.telomereLengthKilobases()).toBe(9.4);

    service.resetReprogramming();
    expect(service.yamanakaFactorsActive()).toBe(false);
    expect(service.biologicalAgeYears()).toBe(54);
  });

  it('should compute exosome paracrine secretion metrics', () => {
    const profile = service.exosomeProfile();
    expect(profile.vesicleCountPerMicroLiter).toBeGreaterThan(0);
    expect(profile.mirna21ConcentrationNm).toBeGreaterThan(0);
    expect(profile.antiFibroticScore).toBeGreaterThan(0);
  });
});
