import { PharmacogenomicsService } from './pharmacogenomics.service';

describe('PharmacogenomicsService', () => {
  const service = new PharmacogenomicsService();

  it('1. Initializes with default pharmacogenomic profile', () => {
    const profile = service.activeProfile();
    expect(profile).not.toBeNull();
    expect(profile?.variants.length).toBeGreaterThan(0);
    expect(profile?.interactions.length).toBeGreaterThan(0);
    expect(service.hasHighRiskInteractions()).toBe(true);
  });

  it('2. Flags codeine contraindication for CYP2D6 Poor Metabolizers', () => {
    const interaction = service.checkDrugGeneSafety('Codeine');
    expect(interaction).not.toBeNull();
    expect(interaction?.severity).toBe('contraindicated');
    expect(interaction?.gene).toBe('CYP2D6');
  });

  it('3. Flags simvastatin statin myopathy warning for SLCO1B1', () => {
    const interaction = service.checkDrugGeneSafety('Simvastatin');
    expect(interaction).not.toBeNull();
    expect(interaction?.severity).toBe('warning');
    expect(interaction?.evidenceLevel).toBe('1A');
  });
});
