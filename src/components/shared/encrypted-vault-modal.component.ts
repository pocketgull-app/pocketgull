import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EncryptedVaultService, IVaultArchiveContainer } from '../../services/encrypted-vault.service';

@Component({
  selector: 'app-encrypted-vault-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl font-sans relative">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">🔐</span>
              <div>
                <h3 class="text-base font-bold text-zinc-100">Zero-Knowledge Encrypted Vault</h3>
                <p class="text-[11px] text-zinc-400">Client-Side AES-GCM-256 + PBKDF2 (Zero Cloud Egress)</p>
              </div>
            </div>
            <button type="button" (click)="close()" class="text-zinc-400 hover:text-white text-lg font-bold cursor-pointer">✕</button>
          </div>

          <!-- Mode Tabs (Export vs Import) -->
          <div class="flex gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800 mb-5">
            <button
              type="button"
              (click)="activeTab.set('export')"
              [class]="activeTab() === 'export' ? 'flex-1 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-sm' : 'flex-1 py-1.5 text-zinc-400 hover:text-white text-xs font-medium'"
              class="cursor-pointer transition-all"
            >
              📤 Encrypt & Export
            </button>
            <button
              type="button"
              (click)="activeTab.set('import')"
              [class]="activeTab() === 'import' ? 'flex-1 py-1.5 bg-cyan-600 text-white font-bold text-xs rounded-lg shadow-sm' : 'flex-1 py-1.5 text-zinc-400 hover:text-white text-xs font-medium'"
              class="cursor-pointer transition-all"
            >
              📥 Decrypt & Restore
            </button>
          </div>

          <!-- Export Form -->
          @if (activeTab() === 'export') {
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-zinc-300 mb-1">Set Vault Passphrase:</label>
                <input
                  type="password"
                  [(ngModel)]="exportPassphrase"
                  placeholder="Enter secure master passphrase (min 6 chars)..."
                  class="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div class="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 space-y-1 font-mono">
                <div class="text-emerald-400 font-bold">🔒 Cryptographic Specifications:</div>
                <div>• Cipher: AES-GCM-256 with 96-bit unique IV</div>
                <div>• Key Derivation: PBKDF2 with 100,000 SHA-256 iterations</div>
                <div>• Checksum: SHA-256 tamper verification hash</div>
                <div>• Egress Policy: 100% On-Device Client-Side Execution</div>
              </div>

              <button
                type="button"
                (click)="handleExport()"
                [disabled]="isProcessing() || exportPassphrase.length < 6"
                class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                @if (isProcessing()) {
                  <span>⏳ Encrypting...</span>
                } @else {
                  <span>💾 Download Encrypted .pocketgull Vault</span>
                }
              </button>
            </div>
          }

          <!-- Import Form -->
          @if (activeTab() === 'import') {
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-zinc-300 mb-1">Select .pocketgull Vault File:</label>
                <input
                  type="file"
                  accept=".pocketgull,.json"
                  (change)="onFileSelected($event)"
                  class="w-full text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-zinc-300 mb-1">Enter Master Passphrase:</label>
                <input
                  type="password"
                  [(ngModel)]="importPassphrase"
                  placeholder="Enter the passphrase used during export..."
                  class="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="button"
                (click)="handleImport()"
                [disabled]="isProcessing() || !selectedFileContent || importPassphrase.length < 1"
                class="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                @if (isProcessing()) {
                  <span>⏳ Decrypting & Validating Checksum...</span>
                } @else {
                  <span>🔓 Decrypt & Restore Patient Vault</span>
                }
              </button>
            </div>
          }

          <!-- Feedback Status Banner -->
          @if (statusMessage()) {
            <div class="mt-4 p-3 rounded-xl text-xs flex items-center justify-between"
                 [class.bg-emerald-950]="statusType() === 'success'"
                 [class.text-emerald-300]="statusType() === 'success'"
                 [class.border-emerald-700]="statusType() === 'success'"
                 [class.bg-rose-950]="statusType() === 'error'"
                 [class.text-rose-300]="statusType() === 'error'"
                 [class.border-rose-700]="statusType() === 'error'"
                 class="border">
              <span>{{ statusMessage() }}</span>
              <button type="button" (click)="statusMessage.set(null)" class="text-xs font-bold ml-2">✕</button>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class EncryptedVaultModalComponent {
  private vaultService?: EncryptedVaultService | null;

  constructor() {
    try {
      this.vaultService = inject(EncryptedVaultService, { optional: true });
    } catch {
      this.vaultService = null;
    }
  }

  isOpen = signal<boolean>(false);
  activeTab = signal<'export' | 'import'>('export');
  isProcessing = signal<boolean>(false);
  statusMessage = signal<string | null>(null);
  statusType = signal<'success' | 'error'>('success');

  exportPassphrase = '';
  importPassphrase = '';
  selectedFileContent: string | null = null;

  open(): void {
    this.isOpen.set(true);
    this.statusMessage.set(null);
  }

  close(): void {
    this.isOpen.set(false);
    this.exportPassphrase = '';
    this.importPassphrase = '';
    this.selectedFileContent = null;
    this.statusMessage.set(null);
  }

  async handleExport(): Promise<void> {
    this.isProcessing.set(true);
    this.statusMessage.set(null);

    try {
      const container = await this.vaultService.exportEncryptedVault(this.exportPassphrase);
      const jsonStr = JSON.stringify(container, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `patient-vault-${Date.now()}.pocketgull`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.statusType.set('success');
      this.statusMessage.set('Vault encrypted and downloaded successfully with SHA-256 integrity seal.');
      this.exportPassphrase = '';
    } catch (err: unknown) {
      this.statusType.set('error');
      this.statusMessage.set((err as Error)?.message || 'Export failed.');
    } finally {
      this.isProcessing.set(false);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.selectedFileContent = reader.result as string;
    };
    reader.readAsText(file);
  }

  async handleImport(): Promise<void> {
    if (!this.selectedFileContent) return;
    this.isProcessing.set(true);
    this.statusMessage.set(null);

    try {
      const container: IVaultArchiveContainer = JSON.parse(this.selectedFileContent);
      const payload = await this.vaultService.importEncryptedVault(container, this.importPassphrase);

      this.statusType.set('success');
      this.statusMessage.set(`Successfully restored patient ${payload.patientId} vault with 0 cloud egress.`);
      this.importPassphrase = '';
    } catch (err: unknown) {
      this.statusType.set('error');
      this.statusMessage.set((err as Error)?.message || 'Import failed.');
    } finally {
      this.isProcessing.set(false);
    }
  }
}
