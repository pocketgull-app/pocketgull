import { TestBed } from '@angular/core/testing';
import { PharmacogenomicsService } from './pharmacogenomics.service';

describe('PharmacogenomicsService', () => {
  let service: PharmacogenomicsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PharmacogenomicsService]
    });
    service = TestBed.inject(PharmacogenomicsService);
  });

  it('should initialize with default high-risk variants and interactions', () => {
    const profile = service.activeProfile();
    expect(profile).toBeTruthy();
    expect(profile?.variants.length).toBe(6);
    expect(service.hasHighRiskInteractions()).toBe(true);
    expect(service.contraindicatedCount()).toBeGreaterThan(0);
  });

  it('should detect Codeine contraindication on CYP2D6 *4/*4 poor metabolizer', () => {
    const interaction = service.checkDrugGeneSafety('Codeine');
    expect(interaction).toBeTruthy();
    expect(interaction?.severity).toBe('contraindicated');
    expect(interaction?.recommendedAlternative).toContain('Morphine');
    expect(interaction?.evidenceLevel).toBe('CPIC Level A (Strongest)');
  });

  it('should detect Clopidogrel (Plavix) contraindication on CYP2C19 *2/*2 loss of function', () => {
    const interaction = service.checkDrugGeneSafety('Clopidogrel');
    expect(interaction).toBeTruthy();
    expect(interaction?.severity).toBe('contraindicated');
    expect(interaction?.recommendedAlternative).toContain('Prasugrel');
  });

  it('should dynamically update diplotype to normal *1/*1 and clear contraindications', () => {
    service.updateGeneDiplotype('CYP2D6', '*1/*1');
    const updated = service.activeProfile();
    const cyp2d6 = updated?.variants.find(v => v.gene === 'CYP2D6');
    expect(cyp2d6?.phenotype).toBe('Normal Metabolizer');

    const codeineCheck = service.checkDrugGeneSafety('Codeine');
    expect(codeineCheck).toBeNull();
  });

  it('should trigger phenoconversion when concomitant fluoxetine inhibitor is added', () => {
    // Start with normal CYP2D6 *1/*1
    service.updateGeneDiplotype('CYP2D6', '*1/*1');
    expect(service.checkDrugGeneSafety('Codeine')).toBeNull();

    // Toggle Fluoxetine (strong 2D6 inhibitor)
    service.toggleInhibitor('Fluoxetine');
    const codeineAfterInhibitor = service.checkDrugGeneSafety('Codeine');
    expect(codeineAfterInhibitor).toBeTruthy();
    expect(codeineAfterInhibitor?.phenoconversionRisk).toContain('Phenoconversion');
  });
});
