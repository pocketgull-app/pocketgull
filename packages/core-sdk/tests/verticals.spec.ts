import { describe, it, expect } from 'vitest';
import { 
  IndustryVerticalRegistry,
  CLINICAL_VERTICAL_PROFILE,
  AEROSPACE_VERTICAL_PROFILE,
  LEGAL_VERTICAL_PROFILE,
  INDUSTRIAL_VERTICAL_PROFILE,
  AGRITECH_VERTICAL_PROFILE
} from '../src/verticals/index.js';

describe('Universal Industry Verticals Architecture Suite', () => {
  it('1. Registers and retrieves all 5 multi-industry vertical profiles', () => {
    const all = IndustryVerticalRegistry.getAllVerticals();
    expect(all.length).toBe(5);

    const codes = all.map(v => v.verticalCode);
    expect(codes).toContain('clinical_health');
    expect(codes).toContain('aerospace_flight');
    expect(codes).toContain('legal_compliance');
    expect(codes).toContain('industrial_manufacturing');
    expect(codes).toContain('agritech_veterinary');
  });

  it('2. Enforces PocketAero (Aerospace) safety threshold and ARINC 429 telemetry', () => {
    const aero = IndustryVerticalRegistry.getVertical('aerospace_flight');
    expect(aero.brandName).toBe('PocketAero');
    expect(aero.regulatoryFramework).toBe('FAA_PART121_NASA');
    expect(aero.epistemology.alphaSignificanceThreshold).toBe(0.01);
    expect(aero.spatialTwin.telemetryStreamFormat).toBe('ARINC_429');
    expect(aero.systemParadigms.length).toBe(3);
  });

  it('3. Enforces LexGull (Legal Tech) Shepardizing RoB and sovereign privilege silos', () => {
    const legal = IndustryVerticalRegistry.getVertical('legal_compliance');
    expect(legal.brandName).toBe('LexGull');
    expect(legal.regulatoryFramework).toBe('ABA_GDPR_EU_CIVIL');
    expect(legal.epistemology.riskOfBiasFramework).toBe('LEGAL_SHEPARD');
    expect(legal.sovereignty.supportedSilos).toContain('ATTORNEY_CLIENT_PRIVILEGED');
  });

  it('4. Enforces PocketPlant (Industrial) OPC-UA telemetry and REACH compliance', () => {
    const plant = IndustryVerticalRegistry.getVertical('industrial_manufacturing');
    expect(plant.brandName).toBe('PocketPlant');
    expect(plant.regulatoryFramework).toBe('OSHA_ISO9001_REACH');
    expect(plant.spatialTwin.telemetryStreamFormat).toBe('OPC_UA');
    expect(plant.systemParadigms.some(p => p.id === 'materials_chemical_compliance')).toBe(true);
  });

  it('5. Enforces PocketAgri (Veterinary / Agritech) offline edge and soil biome', () => {
    const agri = IndustryVerticalRegistry.getVertical('agritech_veterinary');
    expect(agri.brandName).toBe('PocketAgri');
    expect(agri.regulatoryFramework).toBe('USDA_APHIS_WOAH');
    expect(agri.sovereignty.supportedSilos).toContain('FIELD_REMOTE_OFFLINE');
    expect(agri.systemParadigms.some(p => p.id === 'soil_regenerative_biome')).toBe(true);
  });

  it('6. Synthesizes cross-paradigm lenses cleanly', () => {
    const synthesis = IndustryVerticalRegistry.crossSynthesizeParadigms('clinical_health');
    expect(synthesis.paradigmCount).toBe(3);
    expect(synthesis.primaryLens).toContain('Western Allopathic');
    expect(synthesis.secondaryLens).toContain('Vedic Ayurvedic');
    expect(synthesis.environmentalLens).toContain('Traditional Chinese');
  });
});
