import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Condensate3dDropletComponent } from './condensate-3d-droplet.component';

describe('Condensate3dDropletComponent Unit Suite', () => {
  let component: Condensate3dDropletComponent;
  let fixture: ComponentFixture<Condensate3dDropletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Condensate3dDropletComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(Condensate3dDropletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('1. Initializes with active phase separation and biophysical coacervate signals', () => {
    expect(component).toBeTruthy();
    expect(component.isAutoSpinning()).toBe(true);
    expect(component.isPhaseSeparated()).toBe(true);
    expect(component.dropletRadiusNm()).toBeGreaterThan(50);
    expect(component.polIiEnrichmentFold()).toBeGreaterThan(10);
    expect(component.burstFrequencyPerHour()).toBeGreaterThan(1.0);
  });

  it('2. Transitions to diffuse gas phase when coactivators drop below critical threshold', () => {
    component.med1Conc.set(1.0);
    component.brd4Conc.set(1.0);
    fixture.detectChanges();

    expect(component.isPhaseSeparated()).toBe(false);
    expect(component.dropletRadiusNm()).toBe(0);
    expect(component.polIiEnrichmentFold()).toBe(1.0);
    expect(component.burstFrequencyPerHour()).toBe(0.2);
  });

  it('3. Toggles auto-spin, burst pulse trigger, and camera reset', () => {
    expect(component.isAutoSpinning()).toBe(true);
    component.toggleAutoSpin();
    expect(component.isAutoSpinning()).toBe(false);

    expect(() => component.triggerBurstPulse()).not.toThrow();
    expect(() => component.resetCamera()).not.toThrow();
  });
});
