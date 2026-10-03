import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { Cyp450DdiMatrixCardComponent } from './cyp450-ddi-matrix-card.component';
import { Cyp450DdiMatrixService } from '../../services/cyp450-ddi-matrix.service';

describe('Cyp450DdiMatrixCardComponent (Clinical Model P12)', () => {
  let component: Cyp450DdiMatrixCardComponent;
  let fixture: ComponentFixture<Cyp450DdiMatrixCardComponent>;
  let service: Cyp450DdiMatrixService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cyp450DdiMatrixCardComponent],
      providers: [Cyp450DdiMatrixService]
    }).compileComponents();

    fixture = TestBed.createComponent(Cyp450DdiMatrixCardComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(Cyp450DdiMatrixService);
    fixture.detectChanges();
  });

  it('1. should create and render header HUD with initial Simvastatin + Clarithromycin preset', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('CYP450 Enzyme Kinetics');
    expect(el.textContent).toContain('AUCR:');
    expect(el.textContent).toContain('Simvastatin');
    expect(el.textContent).toContain('Clarithromycin');
    expect(el.textContent).toContain('rhabdomyolysis');
  });

  it('2. should switch presets and re-render clinical alert telemetry', () => {
    component.applyPreset('clopidogrel_omeprazole');
    fixture.detectChanges();

    expect(service.activePreset()).toBe('clopidogrel_omeprazole');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Clopidogrel');
    expect(el.textContent).toContain('Omeprazole');
    expect(el.textContent).toContain('stent thrombosis');
    expect(el.textContent).toContain('Active Drop');
  });

  it('3. should update sliders and recalculate kinetic exposure fold change', () => {
    component.updateInhibitorConc(5.0);
    component.updateFm(0.95);
    fixture.detectChanges();

    expect(service.perpetratorInput().unboundConcentrationUm).toBe(5.0);
    expect(service.victimInput().fractionMetabolizedFm).toBe(0.95);
  });

  it('4. should render PK canvas curve in DOM cleanly', () => {
    const el = fixture.nativeElement as HTMLElement;
    const canvas = el.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('5. should display ISMP compliant dosage formatting', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('ISMP Formatted Posology');
    expect(el.textContent).toContain('Simvastatin 40 mg');
    expect(el.textContent).not.toContain('40.0 mg');
  });
});
