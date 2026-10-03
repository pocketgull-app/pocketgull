import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaaboPaleoGenomicComponent } from './paabo-paleo-genomic.component';

describe('PaaboPaleoGenomicComponent', () => {
  let component: PaaboPaleoGenomicComponent;
  let fixture: ComponentFixture<PaaboPaleoGenomicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaaboPaleoGenomicComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PaaboPaleoGenomicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create and render header with Nobel laureate attribution', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Paleo-Genomic Introgression Analyzer (Pääbo Model)');
    expect(el.textContent).toContain('Svante Pääbo');
    expect(el.textContent).toContain('2.1% Archaic DNA');
  });

  it('2. should render archaic variants list including Neanderthal and Denisovan alleles', () => {
    expect(component.variants.length).toBeGreaterThanOrEqual(4);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('OAS1 / OAS2 / OAS3');
    expect(el.textContent).toContain('EPAS1');
    expect(el.textContent).toContain('High-Altitude Hypoxia Adaptation');
    expect(el.textContent).toContain('Denisovan');
    expect(el.textContent).toContain('Neanderthal');
  });

  it('3. should display frequency and clinical effect badges for variants', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('80% Tibetan');
    expect(el.textContent).toContain('-60% Severe Respiratory Risk');
  });
});
