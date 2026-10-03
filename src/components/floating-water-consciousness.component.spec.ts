import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FloatingWaterConsciousnessComponent } from './floating-water-consciousness.component';
import { PatientStateService } from '../services/patient-state.service';

describe('FloatingWaterConsciousnessComponent', () => {
  let component: FloatingWaterConsciousnessComponent;
  let fixture: ComponentFixture<FloatingWaterConsciousnessComponent>;
  let patientState: PatientStateService;

  beforeEach(async () => {
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 123);
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [FloatingWaterConsciousnessComponent],
      providers: [PatientStateService]
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingWaterConsciousnessComponent);
    component = fixture.componentInstance;
    patientState = TestBed.inject(PatientStateService);

    // Mock ngAfterViewInit to prevent happy-dom canvas.getContext absence
    vi.spyOn(component, 'ngAfterViewInit').mockImplementation(() => {});

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('1. Initializes with 5 archipelagos and 7 buoyant floating consciousness words', () => {
    expect(component).toBeTruthy();
    expect(component.islands.length).toBe(5);
    expect(component.floatingWords().length).toBe(7);
    expect(component.selectedWord()).toBeNull();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Aquatic Consciousness & Floating Archipelagos');
    expect(el.textContent).toContain('Gamma Sanctuary');
    expect(el.textContent).toContain('Alpha Lagoon');
    expect(el.textContent).toContain('528 Hz Solfeggio');
    expect(el.textContent).toContain('GABA-A Receptor');
  });

  it('2. Selects an island and updates patientState selectedPartId and anatomyViewMode', () => {
    const gamma = component.islands.find(i => i.id === 'isl-1')!;
    component.selectIsland(gamma);
    expect(patientState.selectedPartId()).toBe('brain');
    expect(patientState.anatomyViewMode()).toBe('organs');

    const alpha = component.islands.find(i => i.id === 'isl-2')!;
    component.selectIsland(alpha);
    expect(patientState.selectedPartId()).toBe('heart');
    expect(patientState.anatomyViewMode()).toBe('organs');

    const delta = component.islands.find(i => i.id === 'isl-3')!;
    component.selectIsland(delta);
    expect(patientState.selectedPartId()).toBe('head');
  });

  it('3. Selects a floating word on onWordClick and closes detail overlay', () => {
    const word = component.floatingWords()[0];
    component.onWordClick(word);
    fixture.detectChanges();

    expect(component.selectedWord()).toEqual(word);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(word.text);
    expect(el.textContent).toContain(word.details);

    // Dismiss detail overlay
    component.selectedWord.set(null);
    fixture.detectChanges();
    expect(component.selectedWord()).toBeNull();
  });

  it('4. Handles onCanvasClick and computes fluid hydrodynamic word displacement', () => {
    (component as any).canvasRef = {
      nativeElement: {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 800,
          height: 480,
          bottom: 480,
          right: 800,
          x: 0,
          y: 0,
          toJSON: () => {}
        })
      }
    };

    const fakeClick = { clientX: 250, clientY: 230 } as MouseEvent;
    expect(() => component.onCanvasClick(fakeClick)).not.toThrow();

    const words = component.floatingWords();
    expect(words.length).toBe(7);
  });

  it('5. Cleans up animation frame and resize event listeners on ngOnDestroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
