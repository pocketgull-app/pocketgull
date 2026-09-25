import { describe, it, expect, beforeEach } from 'vitest';
import { SpiritualDietaryConductService, FaithTraditionKey } from './spiritual-dietary-conduct.service';

describe('SpiritualDietaryConductService', () => {
  let service: SpiritualDietaryConductService;

  beforeEach(() => {
    service = new SpiritualDietaryConductService();
  });

  it('should initialize with UNIVERSAL_SECULAR default tradition', () => {
    expect(service.selectedTradition()).toBe('UNIVERSAL_SECULAR');
    expect(service.activeTraditionRule().traditionName).toContain('Universal');
  });

  it('should return all 11 global faith and philosophical traditions', () => {
    const list = service.getAllTraditions();
    expect(list.length).toBe(11);
    const keys = list.map(t => t.traditionKey);
    expect(keys).toContain('JUDAISM_ORTHODOX_KOSHER');
    expect(keys).toContain('ISLAM_HALAL_TAYYIB');
    expect(keys).toContain('HINDUISM_SATTVIC_AHIMSA');
    expect(keys).toContain('JAINISM_STRICT_AHIMSA');
    expect(keys).toContain('SEVENTH_DAY_ADVENTIST');
    expect(keys).toContain('EASTERN_ORTHODOX_FASTING');
    expect(keys).toContain('JEHOVAHS_WITNESS');
    expect(keys).toContain('LATTER_DAY_SAINTS_WORD_OF_WISDOM');
    expect(keys).toContain('BUDDHISM_MINDFUL_FIVE_PRECEPTS');
    expect(keys).toContain('SIKHISM_REHAT_MARYADA');
  });

  it('should flag porcine gelatin as STRICT_PROHIBITION for Halal and Kosher', () => {
    service.setTradition('ISLAM_HALAL_TAYYIB');
    const audit = service.auditMedicationExcipients(['Porcine gelatin capsule shell', 'Microcrystalline cellulose']);
    expect(audit.length).toBe(2);
    expect(audit[0].riskLevel).toBe('STRICT_PROHIBITION');
    expect(audit[0].alternativeSuggestion).toContain('HPMC');
    expect(audit[1].riskLevel).toBe('SAFE');

    service.setTradition('JUDAISM_ORTHODOX_KOSHER');
    const kosherAudit = service.auditMedicationExcipients(['Porcine gelatin capsule shell']);
    expect(kosherAudit[0].riskLevel).toBe('STRICT_PROHIBITION');
  });

  it('should flag bovine tallow as STRICT_PROHIBITION for Hindu and Jain traditions', () => {
    service.setTradition('HINDUISM_SATTVIC_AHIMSA');
    const audit = service.auditMedicationExcipients(['Bovine stearate', 'Corn starch']);
    expect(audit[0].riskLevel).toBe('STRICT_PROHIBITION');
    expect(audit[0].message).toContain('Bovine/cattle extracts strictly prohibited');
    expect(audit[1].riskLevel).toBe('SAFE');
  });

  it('should flag alcohol/ethanol as STRICT_PROHIBITION for Islam, Adventist, LDS, Sikhi, and Buddhism', () => {
    service.setTradition('LATTER_DAY_SAINTS_WORD_OF_WISDOM');
    const audit = service.auditMedicationExcipients(['Ethanol elixir solvent (10%)']);
    expect(audit[0].riskLevel).toBe('STRICT_PROHIBITION');
    expect(audit[0].alternativeSuggestion).toContain('alcohol-free');
  });

  it('should distinguish primary blood vs blood fractions for Jehovah’s Witnesses', () => {
    service.setTradition('JEHOVAHS_WITNESS');
    const audit = service.auditMedicationExcipients(['Whole Blood transfusion', 'Human Albumin 5% solution']);
    expect(audit[0].riskLevel).toBe('STRICT_PROHIBITION');
    expect(audit[1].riskLevel).toBe('PRECAUTION');
    expect(audit[1].message).toContain('Blood fraction');
  });

  it('should generate valid FHIR R4 spiritual conduct bundle', () => {
    service.setTradition('JUDAISM_ORTHODOX_KOSHER');
    const bundle = service.generateFhirSpiritualConductBundle('pat-999');
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('collection');
    expect(bundle.entry.length).toBe(2);

    const consent = bundle.entry[0].resource;
    expect(consent.resourceType).toBe('Consent');
    expect(consent.patient?.reference).toBe('Patient/pat-999');

    const obs = bundle.entry[1].resource;
    expect(obs.resourceType).toBe('Observation');
    expect(obs.code?.coding?.[0].code).toBe('8684-3');
  });
});
