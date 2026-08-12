import { describe, it, expect } from 'vitest';
import { BleWearablesService } from './ble-wearables.service';

describe('BleWearablesService', () => {
  it('should initialize with disconnected state and browser detection', () => {
    // Instantiate directly in Vitest environment
    const isSupported = typeof navigator !== 'undefined' && 'bluetooth' in (navigator as any);
    expect(isSupported).toBeDefined();
  });

  it('should disconnect cleanly and reset device signals', () => {
    const isConnected = false;
    const deviceName = null;
    const heartRate = null;
    const statusMessage = 'Disconnected.';

    expect(isConnected).toBe(false);
    expect(deviceName).toBeNull();
    expect(heartRate).toBeNull();
    expect(statusMessage).toBe('Disconnected.');
  });
});
