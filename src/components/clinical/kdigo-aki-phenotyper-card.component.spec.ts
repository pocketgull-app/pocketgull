import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KdigoAkiPhenotyperCardComponent } from './kdigo-aki-phenotyper-card.component';
import { KdigoAkiPhenotyperService } from '../../services/kdigo-aki-phenotyper.service';

describe('KdigoAkiPhenotyperCardComponent (Clinical Model P9)', () => {
  let fixture: ComponentFixture<KdigoAkiPhenotyperCardComponent>;
  let component: KdigoAkiPhenotyperCardComponent;
  let service: KdigoAkiPhenotyperService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KdigoAkiPhenotyperCardComponent],
      providers: [KdigoAkiPhenotyperService]
    }).compileComponents();

    fixture = TestBed.createComponent(KdigoAkiPhenotyperCardComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(KdigoAkiPhenotyperService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders header, master KDIGO stage badge, and 4 pillars', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Renal Glomerular Filtration & KDIGO AKI Phenotyper');
    expect(el.textContent).toContain('1. Glomerular Filtration');
    expect(el.textContent).toContain('2. KDIGO Staging Matrix');
    expect(el.textContent).toContain('3. Furosemide Stress Test');
    expect(el.textContent).toContain('4. Excretion Phenotype');
  });

  it('2. Applies prerenal dehydration preset and displays KDIGO Stage 1 and Prerenal etiology', () => {
    component.applyPreset('prerenal_dehydration');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('KDIGO Stage 1');
    expect(el.textContent).toContain('Prerenal Azotemia');
    expect(service.excretionPhenotype().feNaPercent).toBeLessThan(1.0);
  });

  it('3. Displays Sarcopenia Discrepancy Alert Banner when elderly muscle wasting is present', () => {
    component.applyPreset('sarcopenic_elderly');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Sarcopenia Discrepancy Alert');
    expect(el.textContent).toContain('Serum Creatinine');
    expect(el.textContent).toContain('overestimates renal reserve');
    expect(service.gfrReport().sarcopeniaWarning).toBe(true);
  });

  it('4. Applies Sepsis ATN preset and displays Intrinsic ATN and Stage 2', () => {
    component.applyPreset('atn_septic_shock');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('KDIGO Stage 2');
    expect(el.textContent).toContain('Intrinsic Acute Tubular Necrosis (ATN)');
    expect(service.excretionPhenotype().feNaPercent).toBeGreaterThan(2.0);
  });

  it('5. Applies FST Non-Responder preset and displays Stage 3 with severe progression risk', () => {
    component.applyPreset('fst_non_responder');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('KDIGO Stage 3 (Severe / RRT Risk)');
    expect(el.textContent).toContain('FST Non-Responder');
    expect(service.fstReport().progressionToStage3RiskPercent).toBeGreaterThan(70);
    expect(service.akiAssessment().isRrtIndicated).toBe(true);
  });

  it('6. Handles interactive slider modifications for Cr, CysC, UO, and FST', () => {
    component.onCrChange({ target: { value: '2.5' } } as unknown as Event);
    component.onCysChange({ target: { value: '2.2' } } as unknown as Event);
    component.onUoChange({ target: { value: '0.25' } } as unknown as Event);
    component.onFstChange({ target: { value: '95' } } as unknown as Event);
    fixture.detectChanges();

    expect(service.serumCreatinine()).toBe(2.5);
    expect(service.serumCystatinC()).toBe(2.2);
    expect(service.urineOutputMlKgHr()).toBe(0.25);
    expect(service.fstUrineVolume2hMl()).toBe(95);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('2.5 mg/dL');
    expect(el.textContent).toContain('2.2 mg/L');
    expect(el.textContent).toContain('0.25 mL/kg/h');
    expect(el.textContent).toContain('95 mL');
  });
});
