import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { MultiParadigmVennComponent } from './multi-paradigm-venn.component';

describe('MultiParadigmVennComponent', () => {
  let component: MultiParadigmVennComponent;
  let fixture: ComponentFixture<MultiParadigmVennComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiParadigmVennComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MultiParadigmVennComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component with initial triple consensus selected', () => {
    expect(component).toBeTruthy();
    expect(component.selectedKey()).toBe('western_functional_epigenetic');
    expect(component.activeRegion().label).toBe('Triple Consensus (W ∩ F ∩ E)');
    expect(component.activeRegion().confidence).toBe(100);
  });

  it('should render header and active consensus badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Diagnostic Consensus Engine');
    expect(compiled.textContent).toContain('3-Set Venn Triangulation');
    expect(compiled.textContent).toContain('Multi-Paradigm Intersection Matrix');
    expect(compiled.textContent).toContain('Triple Consensus (W ∩ F ∩ E)');
    expect(compiled.textContent).toContain('100% Confidence');
  });

  it('should render SVG Venn diagram with circles for all three paradigms', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const svg = compiled.querySelector('svg');
    expect(svg).toBeTruthy();

    const circles = compiled.querySelectorAll('circle');
    expect(circles.length).toBe(4); // Western, Functional, Epigenetics, and Center Intersection

    expect(compiled.textContent).toContain('Western Pathology (W)');
    expect(compiled.textContent).toContain('Functional (F)');
    expect(compiled.textContent).toContain('Epigenetics (E)');
    expect(compiled.textContent).toContain('W∩F∩E');
  });

  it('should switch active region when clicking Western ∩ Functional button', () => {
    component.selectedKey.set('western_functional');
    fixture.detectChanges();

    expect(component.activeRegion().label).toBe('Western ∩ Functional (W ∩ F)');
    expect(component.activeRegion().confidence).toBe(85);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Western ∩ Functional (W ∩ F)');
    expect(compiled.textContent).toContain('Fasting Triglycerides (>150 mg/dL)');
    expect(compiled.textContent).toContain('Metabolic & Mitochondrial stress confirmed');
  });

  it('should switch active region to Functional ∩ Epigenetics', () => {
    component.selectedKey.set('functional_epigenetic');
    fixture.detectChanges();

    expect(component.activeRegion().label).toBe('Functional ∩ Epigenetics (F ∩ E)');
    expect(component.activeRegion().confidence).toBe(90);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Telomere Attrition Rate');
    expect(compiled.textContent).toContain('Subclinical cellular aging driven by oxidative stress');
  });

  it('should switch active region to Western ∩ Epigenetics', () => {
    component.selectedKey.set('western_epigenetic');
    fixture.detectChanges();

    expect(component.activeRegion().label).toBe('Western ∩ Epigenetics (W ∩ E)');
    expect(component.activeRegion().confidence).toBe(80);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Arterial Stiffness');
    expect(compiled.textContent).toContain('Structural vascular remodeling correlates with biological age');
  });

  it('should allow selecting isolated paradigms (Western, Functional, Epigenetic)', () => {
    component.selectedKey.set('western');
    fixture.detectChanges();
    expect(component.activeRegion().label).toBe('Western Pathology Only (W)');

    component.selectedKey.set('functional');
    fixture.detectChanges();
    expect(component.activeRegion().label).toBe('Functional Biochemistry Only (F)');

    component.selectedKey.set('epigenetic');
    fixture.detectChanges();
    expect(component.activeRegion().label).toBe('Epigenetic Longevity Only (E)');
  });
});
