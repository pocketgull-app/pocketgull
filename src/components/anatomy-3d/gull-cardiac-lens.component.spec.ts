import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GullCardiacLensComponent } from './gull-cardiac-lens.component';
import { PLATFORM_ID } from '@angular/core';

describe('GullCardiacLensComponent', () => {
  let component: GullCardiacLensComponent;
  let fixture: ComponentFixture<GullCardiacLensComponent>;

  beforeAll(() => {
    // Mock WebGL2 context and ResizeObserver for headless test environment
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);
    global.ResizeObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    } as any;
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GullCardiacLensComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' } // avoid WebGL canvas init in node
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GullCardiacLensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize with default normal_sinus regime', () => {
    expect(component).toBeTruthy();
    expect(component.regime()).toBe('normal_sinus');
    expect(component.heartRateBpm()).toBe(72);
    expect(component.qtcIntervalMs()).toBe(410);
    expect(component.eadInstability()).toBe(0.0);
  });

  it('should switch regimes to drug_induced_long_qtc with hERG elongation', () => {
    component.setRegime('drug_induced_long_qtc');
    expect(component.regime()).toBe('drug_induced_long_qtc');
    expect(component.qtcIntervalMs()).toBe(515);
    expect(component.conductionVelocity()).toBe(0.65);
    expect(component.eadInstability()).toBe(0.35);
  });

  it('should switch regimes to severe_torsades_de_pointes with tachyarrhythmia and high EAD flutter', () => {
    component.setRegime('severe_torsades_de_pointes');
    expect(component.regime()).toBe('severe_torsades_de_pointes');
    expect(component.heartRateBpm()).toBe(165);
    expect(component.qtcIntervalMs()).toBe(580);
    expect(component.eadInstability()).toBe(0.85);
  });

  it('should toggle play and pause state', () => {
    expect(component.isPlaying()).toBe(true);
    component.togglePlay();
    expect(component.isPlaying()).toBe(false);
    component.togglePlay();
    expect(component.isPlaying()).toBe(true);
  });

  it('should handle camera reset cleanly', () => {
    expect(() => component.resetCamera()).not.toThrow();
  });
});
