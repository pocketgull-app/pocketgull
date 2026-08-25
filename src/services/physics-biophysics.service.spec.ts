import { PhysicsBiophysicsService } from './physics-biophysics.service';

describe('PhysicsBiophysicsService', () => {
  it('should compute Hamilton Least Action path and Friston Free Energy negentropy telemetry', () => {
    const mockState: any = {
      vitals: () => ({ hr: '72', temp: '98.6' }),
      issues: () => ({ head: [{ name: 'Mild Tension', description: 'Stress' }] })
    };

    const fn = PhysicsBiophysicsService.prototype.computePhysicsTelemetry;
    const telem = fn.call({} as any, mockState);

    expect(telem.leastActionPath.length).toBe(4);
    expect(telem.leastActionPath[0].habitName).toContain('0.1 Hz Vagal'); // Highest leverage ratio
    expect(telem.negentropicHomeostasisScore).toBeGreaterThan(0);
    expect(['Intact & Exporting', 'Moderate Noise', 'Leaky & Entropic']).toContain(telem.markovBlanketStatus);
    expect(telem.circadianNoetherSymmetryPercent).toBeGreaterThan(0);
    expect(telem.entangledVagalCoherencePercent).toBeGreaterThan(0);
  });
});
