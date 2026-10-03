import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HallChronotherapyMatrixComponent } from './hall-chronotherapy-matrix.component';

describe('HallChronotherapyMatrixComponent', () => {
  let component: HallChronotherapyMatrixComponent;
  let fixture: ComponentFixture<HallChronotherapyMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HallChronotherapyMatrixComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HallChronotherapyMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create and render header with 2017 Nobel attribution', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Circadian Chronotherapy Matrix');
    expect(el.textContent).toContain('Hall/Rosbash/Young');
    expect(el.textContent).toContain('SCN Oscillation');
  });

  it('2. should render chronotherapy dosing list with optimal circadian times and target genes', () => {
    expect(component.items.length).toBeGreaterThanOrEqual(4);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('HMG-CoA Reductase Inhibitors (Statins)');
    expect(el.textContent).toContain('21:00 (Bedtime)');
    expect(el.textContent).toContain('HMGCR');
    expect(el.textContent).toContain('Glucocorticoids / Cortisol Support');
    expect(el.textContent).toContain('07:00 (Morning)');
  });

  it('3. should provide scientific rationale for circadian timing', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Hepatic cholesterol synthesis peaks during nocturnal circadian resting phase');
    expect(el.textContent).toContain('Cortisol Awakening Response (CAR)');
  });
});
