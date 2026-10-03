import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { StewartHamiltonPacCardComponent } from './stewart-hamilton-pac-card.component';
import { StewartHamiltonPacService } from '../../services/stewart-hamilton-pac.service';

describe('StewartHamiltonPacCardComponent (Clinical Model P13)', () => {
  let component: StewartHamiltonPacCardComponent;
  let fixture: ComponentFixture<StewartHamiltonPacCardComponent>;
  let service: StewartHamiltonPacService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StewartHamiltonPacCardComponent],
      providers: [StewartHamiltonPacService]
    }).compileComponents();

    fixture = TestBed.createComponent(StewartHamiltonPacCardComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(StewartHamiltonPacService);
    fixture.detectChanges();
  });

  it('1. should create and render header HUD with initial euvolemic state', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Stewart-Hamilton Thermodilution');
    expect(el.textContent).toContain('Cardiac Index (CI)');
    expect(el.textContent).toContain('Wedge (PCWP)');
    expect(el.textContent).toContain('Subset I');
  });

  it('2. should switch to cardiogenic shock preset and render Forrester IV alerts', () => {
    component.applyPreset('cardiogenic_shock_forrester_iv');
    fixture.detectChanges();

    expect(service.activePreset()).toBe('cardiogenic_shock_forrester_iv');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Cardiogenic Shock');
    expect(el.textContent).toContain('Subset IV');
    expect(el.textContent).toContain('Dobutamine');
  });

  it('3. should switch to massive pulmonary embolism preset with elevated PVR and TPG', () => {
    component.applyPreset('massive_pulmonary_embolism');
    fixture.detectChanges();

    expect(service.hemodynamicOutput().transpulmonaryGradientMmhg).toBeGreaterThan(15);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Pulmonary Embolism');
    expect(el.textContent).toContain('thrombolysis');
  });

  it('4. should update interactive sliders and recalculate hemodynamics', () => {
    component.updateMap(95);
    component.updateCvp(12);
    component.updatePcwp(20);
    component.updateAuc(5.0);
    fixture.detectChanges();

    expect(service.vitals().meanArterialPressureMap).toBe(95);
    expect(service.vitals().centralVenousPressureCvp).toBe(12);
    expect(service.vitals().pulmonaryCapillaryWedgePressurePcwp).toBe(20);
    expect(service.vitals().areaUnderThermodilutionCurveDegSec).toBe(5.0);
  });

  it('5. should render dual canvases for thermodilution and Forrester matrix', () => {
    const el = fixture.nativeElement as HTMLElement;
    const canvases = el.querySelectorAll('canvas');
    expect(canvases.length).toBe(2);
  });
});
