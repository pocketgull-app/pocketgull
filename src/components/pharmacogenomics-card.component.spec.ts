import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacogenomicsCardComponent } from './pharmacogenomics-card.component';
import { PharmacogenomicsService } from '../services/pharmacogenomics.service';

describe('PharmacogenomicsCardComponent', () => {
  let component: PharmacogenomicsCardComponent;
  let fixture: ComponentFixture<PharmacogenomicsCardComponent>;
  let pgxService: PharmacogenomicsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacogenomicsCardComponent],
      providers: [PharmacogenomicsService]
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacogenomicsCardComponent);
    component = fixture.componentInstance;
    pgxService = TestBed.inject(PharmacogenomicsService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders header, toxicity score, and high-risk banner', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Pharmacogenomics & Cytochrome P450 Metabolizer Engine (Model P4)');
    expect(el.textContent).toContain('1A High-Risk Interactions Active');
    expect(el.textContent).toContain('Toxicity Risk: 72/100');
  });

  it('2. Renders CYP450 diplotype matrix with activity scores', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('CYP2D6');
    expect(el.textContent).toContain('CYP2C19');
    expect(el.textContent).toContain('CYP3A4');
    expect(el.textContent).toContain('*4/*4');
    expect(el.textContent).toContain('Poor Metabolizer');
  });

  it('3. Renders Prodrug Activation Guard and Black Box warnings', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Prodrug Activation & Conversion Failure Guard');
    expect(el.textContent).toContain('Codeine');
    expect(el.textContent).toContain('BLACK BOX');
    expect(el.textContent).toContain('Clopidogrel');
  });

  it('4. Renders Herb-Drug Metabolic Interaction Guard', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Herb-Drug & Metabolic Enzyme Interaction Guard');
    expect(el.textContent).toContain('Grapefruit Juice / Bergamottin + Simvastatin');
    expect(el.textContent).toContain('St. John\'s Wort (Hypericum) + Oral Contraceptives');
  });

  it('5. Switches CYP2D6 alleles and dynamically updates phenotype and prodrug risk', () => {
    // Switch to Ultra-Rapid *1xN/*1
    component.switchAlleles('CYP2D6', '*1xN', '*1');
    fixture.detectChanges();

    const profile = pgxService.activeProfile();
    const cyp2d6 = profile?.variants.find(v => v.gene === 'CYP2D6');
    expect(cyp2d6?.phenotype).toBe('Ultra-Rapid Metabolizer');
    expect(cyp2d6?.diplotype).toBe('*1xN/*1');

    const codeineRisk = profile?.prodrugRisks?.find(r => r.drugName === 'Codeine');
    expect(codeineRisk?.riskType).toBe('Severe Toxicity / Hyper-Activation');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Ultra-Rapid Metabolizer');
  });
});
