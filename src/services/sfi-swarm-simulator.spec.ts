import { SentinelSurveillanceService } from './sentinel-surveillance.service';

describe('SFI John Holland Complex Adaptive Systems Swarm Simulator', () => {
  it('should run SFI Holland ABM Agent Swarm simulation and output valid R0 attractor telemetry', () => {
    const fn = SentinelSurveillanceService.prototype.runHollandAgentSwarmSimulation;
    const telemetry = fn.call({} as any, 150, 0.40, 0.10);

    expect(telemetry.populationSize).toBe(150);
    expect(telemetry.effectiveR0).toBeGreaterThan(0);
    expect(['Emergent Outbreak', 'Stable Endemic', 'Extinction Basin']).toContain(telemetry.epidemicAttractorState);
    expect(telemetry.sfiAttractorNotice).toContain('Santa Fe Institute CAS Holland Swarm');
    expect(telemetry.whoGlassResistancePrevalence).toBeGreaterThanOrEqual(0);
  });
});
