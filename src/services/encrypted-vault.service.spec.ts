import { EncryptedVaultService, IVaultArchiveContainer } from './encrypted-vault.service';
import { signal } from '@angular/core';

describe('EncryptedVaultService (AES-GCM-256 Zero-Knowledge Vault) Suite', () => {
  let service: EncryptedVaultService;
  let mockPatientState: any;
  let mockPatientManagement: any;

  beforeEach(() => {
    mockPatientState = {
      issues: signal({
        heart: [{ id: 'heart', name: 'Palpitations', painLevel: 5 }]
      }),
      vitals: signal({ hr: 72, bpSys: 120, bpDia: 80 }),
      activePhilosophy: signal('western'),
      selectedNoteId: signal('note-123'),
      selectPhilosophy: vi.fn()
    };

    mockPatientManagement = {
      selectedPatientId: signal('P001'),
      patients: signal([{ id: 'P001', name: 'Alex Mercer' }])
    };

    service = new EncryptedVaultService();
    (service as any).patientState = mockPatientState;
    (service as any).patientManagement = mockPatientManagement;
  });

  it('1. Encrypts patient state into an AES-GCM-256 container with valid header and checksum', async () => {
    const container = await service.exportEncryptedVault('super-secret-passphrase');

    expect(container.header.format).toBe('POCKETGULL_ENCRYPTED_VAULT');
    expect(container.header.cipher).toBe('AES-GCM-256');
    expect(container.header.kdf).toBe('PBKDF2');
    expect(container.header.kdfIterations).toBe(100_000);
    expect(container.header.saltHex.length).toBe(32); // 16 bytes = 32 hex chars
    expect(container.header.ivHex.length).toBe(24);   // 12 bytes = 24 hex chars
    expect(container.header.checksumSha256).toBeDefined();
    expect(container.ciphertextBase64.length).toBeGreaterThan(20);
  }, 15000);

  it('2. Successfully decrypts container with matching passphrase and restores state', async () => {
    const container = await service.exportEncryptedVault('correct-horse-battery-staple');
    const restored = await service.importEncryptedVault(container, 'correct-horse-battery-staple');

    expect(restored.patientId).toBe('P001');
    expect(restored.issues['heart']).toBeDefined();
    expect(mockPatientState.issues()['heart']).toBeDefined();
  }, 15000);

  it('3. Throws descriptive error on incorrect passphrase', async () => {
    const container = await service.exportEncryptedVault('secret123');

    await expect(service.importEncryptedVault(container, 'wrong-password'))
      .rejects.toThrow('Decryption failed');
  }, 15000);

  it('4. Rejects tampered ciphertext with checksum error', async () => {
    const container = await service.exportEncryptedVault('secret123');
    // Tamper with checksum in header
    const tampered: IVaultArchiveContainer = {
      ...container,
      header: {
        ...container.header,
        checksumSha256: '0000000000000000000000000000000000000000000000000000000000000000'
      }
    };

    await expect(service.importEncryptedVault(tampered, 'secret123'))
      .rejects.toThrow('Integrity check failed');
  });
});
