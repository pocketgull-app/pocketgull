import { EncryptedVaultModalComponent } from './encrypted-vault-modal.component';

describe('EncryptedVaultModalComponent Suite', () => {
  let component: EncryptedVaultModalComponent;
  let mockVaultService: any;

  beforeEach(() => {
    mockVaultService = {
      exportEncryptedVault: vi.fn().mockResolvedValue({
        header: {
          format: 'POCKETGULL_ENCRYPTED_VAULT',
          version: '1.0.0',
          cipher: 'AES-GCM-256'
        },
        ciphertextBase64: 'mock-base64'
      }),
      importEncryptedVault: vi.fn().mockResolvedValue({
        patientId: 'P001',
        issues: {}
      })
    };

    component = new EncryptedVaultModalComponent();
    (component as any).vaultService = mockVaultService;
  });

  it('1. Opens and closes modal cleanly', () => {
    expect(component.isOpen()).toBe(false);
    component.open();
    expect(component.isOpen()).toBe(true);
    component.close();
    expect(component.isOpen()).toBe(false);
  });

  it('2. Switches between Export and Import tabs', () => {
    component.activeTab.set('export');
    expect(component.activeTab()).toBe('export');

    component.activeTab.set('import');
    expect(component.activeTab()).toBe('import');
  });

  it('3. Successfully invokes export pipeline with passphrase', async () => {
    component.exportPassphrase = 'my-secure-password';
    await component.handleExport();

    expect(mockVaultService.exportEncryptedVault).toHaveBeenCalledWith('my-secure-password');
    expect(component.statusType()).toBe('success');
    expect(component.statusMessage()).toContain('Vault encrypted');
  });

  it('4. Successfully invokes import pipeline with passphrase and container payload', async () => {
    component.selectedFileContent = JSON.stringify({
      header: { format: 'POCKETGULL_ENCRYPTED_VAULT' },
      ciphertextBase64: 'abc'
    });
    component.importPassphrase = 'my-secure-password';

    await component.handleImport();

    expect(mockVaultService.importEncryptedVault).toHaveBeenCalled();
    expect(component.statusType()).toBe('success');
    expect(component.statusMessage()).toContain('Successfully restored');
  });
});
