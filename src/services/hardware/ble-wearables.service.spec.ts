import { Injector, runInInjectionContext } from '@angular/core';
import { BleWearablesService } from './ble-wearables.service';
import { PatientStateService } from '../patient-state.service';

describe('BleWearablesService', () => {
  let service: BleWearablesService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: { updateVital: () => {} } },
        BleWearablesService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(BleWearablesService));
  });

  it('1. Initializes with disconnected state and browser detection', () => {
    expect(service.isConnected()).toBe(false);
    expect(service.deviceName()).toBeNull();
    expect(service.heartRate()).toBeNull();
    expect(service.statusMessage()).toContain('Ready to pair');
  });

  it('2. Computes cardiac 0.10 Hz RSA resonance and autonomic coherence score', () => {
    expect(service.cardiacResonanceHz()).toBe(0.10);
    expect(service.autonomicCoherenceScore()).toBeGreaterThanOrEqual(20);
    expect(service.autonomicCoherenceScore()).toBeLessThanOrEqual(100);
  });

  it('3. Prescribes bio-adaptive brainwave entrainment frequencies based on autonomic state', () => {
    // Default / optimal resting state -> Schumann 7.83 Hz on 432 Hz
    const defaultRec = service.recommendedEntrainmentHz();
    expect(defaultRec.beatFreqHz).toBe(7.83);
    expect(defaultRec.carrierFreqHz).toBe(432);

    // Active moderate HR (80 bpm, RMSSD 32) -> Alpha 8.5 Hz on 528 Hz
    service.heartRate.set(80);
    service.hrvRmssd.set(32);
    service.rrIntervals.set([750, 760, 740, 755]);
    const balanceRec = service.recommendedEntrainmentHz();
    expect(balanceRec.beatFreqHz).toBe(8.5);
    expect(balanceRec.carrierFreqHz).toBe(528);
    expect(balanceRec.stateLabel).toContain('Autonomic Balance');

    // High HR / Sympathetic -> Theta 5.5 Hz on 528 Hz for vagal deceleration
    service.heartRate.set(96);
    service.hrvRmssd.set(20);
    const stressRec = service.recommendedEntrainmentHz();
    expect(stressRec.beatFreqHz).toBe(5.5);
    expect(stressRec.carrierFreqHz).toBe(528);
    expect(stressRec.stateLabel).toContain('Sympathetic Downregulation');

    // Low HR / Drowsy (< 55 bpm) -> Alpha 10.0 Hz on 432 Hz
    service.heartRate.set(52);
    service.hrvRmssd.set(45);
    const lowRec = service.recommendedEntrainmentHz();
    expect(lowRec.beatFreqHz).toBe(10.0);
    expect(lowRec.carrierFreqHz).toBe(432);
    expect(lowRec.stateLabel).toContain('Calm Alertness Flow');
  });

  it('4. Disconnects cleanly and resets device signals', () => {
    service.disconnect();
    expect(service.isConnected()).toBe(false);
    expect(service.deviceName()).toBeNull();
    expect(service.heartRate()).toBeNull();
    expect(service.statusMessage()).toBe('Disconnected.');
  });
});
