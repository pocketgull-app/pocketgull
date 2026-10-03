import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { StewartHamiltonPacCardComponent } from './stewart-hamilton-pac-card.component';
import { StewartHamiltonPacService } from '../../services/stewart-hamilton-pac.service';

describe('StewartHamiltonPacCardComponent', () => {
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

  it('should create the card component', () => {
    expect(component).toBeTruthy();
  });

  it('should render baseline normal preset values initially', () => {
    expect(component.service.activePreset()).toBe('normal');
    expect(component.service.hemodynamicOutput().shockEtiology).toBe('normal');
    expect(component.service.hemodynamicOutput().forresterQuadrant).toBe('I_warm_and_dry');
  });

  it('should switch presets to cardiogenic shock and update telemetry', () => {
    component.applyPreset('cardiogenic_pump_failure');
    expect(component.service.activePreset()).toBe('cardiogenic_pump_failure');
    expect(component.service.hemodynamicOutput().shockEtiology).toBe('cardiogenic_pump_failure');
    expect(component.service.hemodynamicOutput().forresterQuadrant).toBe('IV_cold_and_wet');
    expect(component.service.hemodynamicOutput().shockSeverity).toBe('Critical STAT');
  });

  it('should update inputs on user slider interaction', () => {
    const fakeEvent = { target: { value: '95' } } as unknown as Event;
    component.onInputChange('meanArterialPressureMmhg', fakeEvent);
    expect(component.service.inputs().meanArterialPressureMmhg).toBe(95);
  });

  it('should detect cardiac tamponade on preset application', () => {
    component.applyPreset('obstructive_tamponade');
    expect(component.service.hemodynamicOutput().shockEtiology).toBe('obstructive_tamponade');
    expect(component.service.hemodynamicOutput().isEqualizationPresent).toBe(true);
  });
});
