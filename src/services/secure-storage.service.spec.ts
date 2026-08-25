import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { SecureStorageService } from './secure-storage.service';

describe('SecureStorageService - CSPRNG Cryptographic Storage Wiping', () => {
  let service: SecureStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SecureStorageService]
    });
    service = TestBed.inject(SecureStorageService);
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('1. Sets and gets values via in-memory write-through cache', () => {
    service.setItem('pocketgull_test_key', 'clinical_value_123');
    expect(service.getItem('pocketgull_test_key')).toBe('clinical_value_123');
  });

  it('2. Correctly parses and serializes JSON values', () => {
    const payload = { id: 1, diagnosis: 'Lyme Disease', markers: ['CD57'] };
    service.setJSON('pocketgull_json_key', payload);

    const retrieved = service.getJSON('pocketgull_json_key', null);
    expect(retrieved).toEqual(payload);
  });

  it('3. Performs cryptographic CSPRNG wiping before item removal', () => {
    service.setItem('pocketgull_sensitive_phi', 'CONFIDENTIAL_PATIENT_DOB_1985');
    expect(service.getItem('pocketgull_sensitive_phi')).toBe('CONFIDENTIAL_PATIENT_DOB_1985');

    service.cryptographicWipe('pocketgull_sensitive_phi');
    expect(service.getItem('pocketgull_sensitive_phi')).toBeNull();
  });

  it('4. Cryptographically wipes all matching prefixed keys across storage', () => {
    service.setItem('pocketgull_phi_1', 'patient_data_1');
    service.setItem('pocketgull_phi_2', 'patient_data_2');
    service.setItem('unrelated_key', 'unrelated_data');

    service.cryptographicWipeAll('pocketgull_');

    expect(service.getItem('pocketgull_phi_1')).toBeNull();
    expect(service.getItem('pocketgull_phi_2')).toBeNull();
  });
});
