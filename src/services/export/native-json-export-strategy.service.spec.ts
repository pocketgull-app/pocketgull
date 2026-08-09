import { describe, it, expect, beforeEach } from 'vitest';
import { NativeJsonExportStrategyService } from './native-json-export-strategy.service';
import { IPatient } from '../patient.types';

describe('NativeJsonExportStrategyService', () => {
  let service: NativeJsonExportStrategyService;

  beforeEach(() => {
    service = new NativeJsonExportStrategyService();
  });

  it('should validate native export payloads', () => {
    const valid = {
      _format: 'pocket-gull-native',
      _version: 1,
      exportedAt: new Date().toISOString(),
      patient: { name: 'John Doe', age: 42, gender: 'Male' }
    };

    expect(service.isNativeExport(valid)).toBe(true);
    expect(service.isNativeExport({ invalid: true })).toBe(false);
  });
});
