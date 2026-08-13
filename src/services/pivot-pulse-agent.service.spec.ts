import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { PivotPulseAgentService } from './pivot-pulse-agent.service';

describe('PivotPulseAgentService (Peregrine Agent)', () => {
  let service: PivotPulseAgentService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [PivotPulseAgentService]
    });
    service = runInInjectionContext(injector, () => injector.get(PivotPulseAgentService));
  });

  it('1. Initializes default pulse trajectory and active regimen', () => {
    const pulse = service.pulse();
    expect(pulse.pulseMomentum).toBeGreaterThan(0.5);
    expect(service.regimen()).toBe('ACTIVE_REHAB');
  });

  it('2. Triggers Peregrine Pivot to SOMATIC_AVS_RECOVERY when pulse momentum drops below threshold', () => {
    // Low HRV (15ms), high SIBI (0.8), high stress (0.85) -> low momentum (<0.40)
    const decision = service.evaluatePulseAndPivot(15, 0.8, 0.85);
    expect(decision.shouldPivot).toBe(true);
    expect(decision.pivotedRegimen).toBe('SOMATIC_AVS_RECOVERY');
    expect(service.regimen()).toBe('SOMATIC_AVS_RECOVERY');
  });

  it('3. Triggers Peregrine Pivot back to PROGRESSIVE_FUNCTIONAL_MOBILITY when recovery threshold achieved', () => {
    // Force current regimen to SOMATIC_AVS_RECOVERY
    service.evaluatePulseAndPivot(15, 0.8, 0.85);

    // High HRV (90ms), low SIBI (0.1), low stress (0.1) -> high momentum (>0.80)
    const decision = service.evaluatePulseAndPivot(90, 0.1, 0.1);
    expect(decision.shouldPivot).toBe(true);
    expect(decision.pivotedRegimen).toBe('PROGRESSIVE_FUNCTIONAL_MOBILITY');
    expect(service.regimen()).toBe('PROGRESSIVE_FUNCTIONAL_MOBILITY');
  });
});
