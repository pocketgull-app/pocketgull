import { DoubleFlipStateMachineService } from './double-flip-state-machine.service';

describe('DoubleFlipStateMachineService', () => {
  it('1. Handles Double-Click Safety Interlock state transitions within 300ms window', () => {
    const service = new DoubleFlipStateMachineService();

    // First click transitions to PENDING_SECOND_CLICK
    const state1 = service.registerClick('organ_mesh_heart');
    expect(state1).toBe('PENDING_SECOND_CLICK');
    expect(service.doubleClickStatus().isConfirmed).toBe(false);

    // Second click on same target transitions to CONFIRMED_ACTION
    const state2 = service.registerClick('organ_mesh_heart');
    expect(state2).toBe('CONFIRMED_ACTION');
    expect(service.doubleClickStatus().isConfirmed).toBe(true);
  });

  it('2. Handles Double-Flip Biological Bistability toggles between Parasympathetic and Sympathetic states', () => {
    const service = new DoubleFlipStateMachineService();

    expect(service.doubleFlipTelemetry().currentState).toBe('STATE_A_DOMINANT');
    expect(service.doubleFlipTelemetry().vagalSympatheticBalance).toContain('Parasympathetic Coherent');

    // Trigger flip
    service.triggerDoubleFlip();
    expect(service.doubleFlipTelemetry().flipCount).toBe(1);
  });
});
