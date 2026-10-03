import { TestBed } from '@angular/core/testing';
import { OncDsiTransparencyService } from './onc-dsi-transparency.service';

describe('OncDsiTransparencyService', () => {
  let service: OncDsiTransparencyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OncDsiTransparencyService],
    });
    service = TestBed.inject(OncDsiTransparencyService);
  });

  it('should initialize with default cardio model card', () => {
    expect(service.selectedModelId()).toBe('pocketgull-cardio-sprint');
    const card = service.activeModelCard();
    expect(card.name).toContain('SPRINT');
    expect(card.validationMetrics.auroc).toBeGreaterThan(0.9);
    expect(card.demographics.studySitesCount).toBe(102);
  });

  it('should allow selecting alternative RSNA vision model card', () => {
    service.selectModel('pocketgull-rsna-dicom');
    expect(service.selectedModelId()).toBe('pocketgull-rsna-dicom');
    expect(service.activeModelCard().name).toContain('RSNA Deep Knee');
    expect(service.activeModelCard().validationMetrics.auroc).toBe(0.928);
  });

  it('should generate valid FHIR R4 DeviceDefinition standard resource', () => {
    const fhir = service.exportFhirDeviceDefinition('pocketgull-cardio-sprint') as any;
    expect(fhir.resourceType).toBe('DeviceDefinition');
    expect(fhir.id).toBe('pocketgull-cardio-sprint');
    expect(fhir.type.coding[0].display).toBe('Clinical decision support software');
    expect(fhir.note.length).toBe(2);
  });

  it('should generate complete ONC HTI-2 JSON compliance payload', () => {
    const jsonStr = service.exportHti2ComplianceJson('pocketgull-cardio-sprint');
    const parsed = JSON.parse(jsonStr);
    expect(parsed.onc_hti2_standard).toContain('§170.315(b)(11)');
    expect(parsed.model_card.governance.fdaRegulatoryPathway).toContain('Non-Device Clinical Decision Support');
    expect(parsed.audit_verdict).toContain('FULLY COMPLIANT');
  });

  it('should include WHO Global Frontline Equity CDS with multi-ancestry and optical sensor calibration', () => {
    service.selectModel('pocketgull-global-equity');
    const card = service.activeModelCard();
    expect(card.name).toContain('WHO-ICD11');
    expect(card.demographics.studySitesCount).toBe(218);
    expect(card.demographics.globalAncestry?.subSaharanAfricanPct).toBeGreaterThan(20);
    expect(card.demographics.globalAncestry?.southAsianPct).toBeGreaterThan(10);
    expect(card.demographics.opticalEquity?.fitzpatrickIVtoVIPct).toBeGreaterThan(50);
    expect(card.demographics.opticalEquity?.occultHypoxemiaBiasMitigated).toBe(true);
    expect(card.demographics.pharmacogenomics?.hlaB1502CarbamazepineScreening).toBe(true);
    expect(card.demographics.fairnessAudit?.disparateImpactFourFifthsPassed).toBe(true);
    expect(card.demographics.fairnessAudit?.demographicParityRatio).toBeGreaterThan(0.95);
  });
});
