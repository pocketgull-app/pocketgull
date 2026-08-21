import '@angular/compiler';
import { expect, describe, it, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SpaceHealthHudComponent } from './space-health-hud.component';
import { SpaceBiophysicsService } from '../services/space-biophysics.service';

describe('SpaceHealthHudComponent Unit Suite', () => {
  let component: SpaceHealthHudComponent;
  let spaceService: SpaceBiophysicsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SpaceHealthHudComponent],
      providers: [SpaceBiophysicsService],
    });

    spaceService = TestBed.inject(SpaceBiophysicsService);
    component = TestBed.createComponent(SpaceHealthHudComponent).componentInstance;
  });

  it('1. Initializes and renders default space mission telemetry', () => {
    expect(component).toBeTruthy();
    expect(component.telemetry().crewId).toContain('ASTRONAUT');
    expect(component.sansRisk()).toBe('MODERATE_SANS');
  });

  it('2. Switches mission scenarios dynamically and updates SANS & Radiation values', () => {
    // Switch to Nominal LEO
    component.simulateScenario('NOMINAL_LEO');
    expect(component.telemetry().missionPhase).toBe('LEO_ORBIT_ISS');
    expect(component.sansRisk()).toBe('NORMAL');

    // Switch to Solar Storm SPE
    component.simulateScenario('SOLAR_STORM_SPE');
    expect(component.telemetry().speAlertActive).toBe(true);
    expect(component.plan().overallCrewFlightReadiness).toBe('STAT_COUNTERMEASURE_REQUIRED');
  });

  it('3. Safely invokes copyFhirJson without errors', () => {
    expect(() => component.copyFhirJson()).not.toThrow();
  });
});
