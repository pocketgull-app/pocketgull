import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { GenomicVariantScreenerComponent } from './genomic-variant-screener.component';
import { GenomicPathogenicityService } from '../services/genomic-pathogenicity.service';

describe('GenomicVariantScreenerComponent', () => {
  let component: GenomicVariantScreenerComponent;
  let fixture: ComponentFixture<GenomicVariantScreenerComponent>;
  let genomicsService: GenomicPathogenicityService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenomicVariantScreenerComponent],
      providers: [GenomicPathogenicityService]
    }).compileComponents();

    genomicsService = TestBed.inject(GenomicPathogenicityService);
    // Reset filters before each test
    genomicsService.setSearchQuery('');
    genomicsService.setAcmgFilter('ALL');

    fixture = TestBed.createComponent(GenomicVariantScreenerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component with initial variants loaded', () => {
    expect(component).toBeTruthy();
    expect(component.genomics.filteredVariants().length).toBeGreaterThan(0);
    expect(component.genomics.selectedVariant()).not.toBeNull();
  });

  it('should render header banner with ACMG badges and Export button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Precision Genomic Variant Screener');
    expect(compiled.textContent).toContain('NCBI ClinVar & dbSNP Core');
    expect(compiled.textContent).toContain('ACMG / AMP Tiered');
    expect(compiled.textContent).toContain('Export FHIR R4 Bundle');
  });

  it('should filter variants by search query', () => {
    component.genomics.setSearchQuery('APOE');
    fixture.detectChanges();

    const variants = component.genomics.filteredVariants();
    expect(variants.every(v => v.gene.includes('APOE'))).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('APOE');
    expect(compiled.textContent).toContain('rs429358');
  });

  it('should filter variants by ACMG classification filter', () => {
    component.genomics.setAcmgFilter('Pathogenic');
    fixture.detectChanges();

    const variants = component.genomics.filteredVariants();
    expect(variants.every(v => v.acmgClassification === 'Pathogenic')).toBe(true);
  });

  it('should select a variant and display detailed metadata in inspector card', () => {
    const variant = component.genomics.filteredVariants()[0];
    component.genomics.selectVariant(variant);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(variant.gene);
    expect(compiled.textContent).toContain(variant.rsId);
    expect(compiled.textContent).toContain('Genome Build');
    expect(compiled.textContent).toContain('GRCh38');
    expect(compiled.textContent).toContain('Clinical Phenotype & Trait Association');
    expect(compiled.textContent).toContain(variant.phenotypeAssociation);
    expect(compiled.textContent).toContain('Actionable Clinical Guidance');
    expect(compiled.textContent).toContain(variant.clinicalActionability);
  });

  it('should export FHIR R4 Genomic Bundle and display confirmation notice', () => {
    component.exportCurrentFhirBundle();
    fixture.detectChanges();

    expect(component.exportNotice()).toContain('Generated FHIR R4 Bundle');
    expect(component.exportNotice()).toContain('MolecularSequence & Observation');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Generated FHIR R4 Bundle');

    // Dismiss notification
    component.exportNotice.set(null);
    fixture.detectChanges();
    expect(component.exportNotice()).toBeNull();
  });

  it('should return appropriate CSS classes for different ACMG classifications', () => {
    expect(component.getAcmgBadgeClass('Pathogenic')).toContain('text-rose-300');
    expect(component.getAcmgBadgeClass('Likely Pathogenic')).toContain('text-amber-300');
    expect(component.getAcmgBadgeClass('Variant of Uncertain Significance (VUS)')).toContain('text-purple-300');
    expect(component.getAcmgBadgeClass('Benign')).toContain('text-slate-300');
  });
});
