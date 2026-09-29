import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CircadianOdeSimulatorService } from './circadian-ode-simulator.service';

describe('CircadianOdeSimulatorService Unit Suite', () => {
  let service: CircadianOdeSimulatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CircadianOdeSimulatorService]
    });
    service = TestBed.inject(CircadianOdeSimulatorService);
  });

  it('1. Initializes default simulation results with optimal solar sync', () => {
    const res = service.currentSimulation();
    expect(res).toBeTruthy();
    expect(res.circadianOde.bmal1Per2OscillatorAmplitude).toBeGreaterThan(0.8);
    expect(res.toxicantPbpk.currentDepurationRatePct).toBeGreaterThan(0);
  });

  it('2. Simulates morning solar exposure phase advance and derived DLMO/CBT metrics', () => {
    const sim = service.simulateCircadianRhythm(
      1500, // 1500 lux
      7.5,  // 07:30 light start
      8.0,  // 08:00 feeding start
      9.0,  // 9.0h window
      6     // 6 sauna sessions
    );

    expect(sim.circadianOde.circadianPhaseShiftHours).toBeGreaterThan(0);
    expect(sim.circadianOde.bmal1Per2OscillatorAmplitude).toBeGreaterThan(0.85);
    expect(sim.circadianOde.clinicalCircadianGrade).toBe('OPTIMAL_SOLAR_SYNC');
    expect(sim.toxicantPbpk.currentDepurationRatePct).toBeGreaterThan(30);
  });

  it('3. Simulates evening blue light exposure leading to phase delay', () => {
    const sim = service.simulateCircadianRhythm(
      800,
      21.0, // 21:00 late light
      11.0,
      14.0, // 14h broad window
      1
    );

    expect(sim.circadianOde.circadianPhaseShiftHours).toBeLessThan(0);
    expect(sim.circadianOde.clinicalCircadianGrade).toBe('MILD_PHASE_DELAY');
  });
});
