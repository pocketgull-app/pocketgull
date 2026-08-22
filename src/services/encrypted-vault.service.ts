import { Injectable, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { PatientManagementService } from './patient-management.service';

export interface IVaultArchiveHeader {
  format: 'POCKETGULL_ENCRYPTED_VAULT';
  version: '1.0.0';
  kdf: 'PBKDF2';
  kdfIterations: number;
  kdfHash: 'SHA-256';
  cipher: 'AES-GCM-256';
  saltHex: string;
  ivHex: string;
  createdAt: string;
  checksumSha256: string;
}

export interface IVaultArchiveContainer {
  header: IVaultArchiveHeader;
  ciphertextBase64: string;
}

export interface IDecryptedVaultPayload {
  version: string;
  exportedAt: string;
  patientId: string;
  patientData: Record<string, unknown>;
  issues: Record<string, unknown>;
  vitals: Record<string, unknown>;
  activePhilosophy: string;
  notes: Record<string, unknown>;
}

@Injectable({
  providedIn: 'root'
})
export class EncryptedVaultService {
  private patientState?: PatientStateService | null;
  private patientManagement?: PatientManagementService | null;

  constructor() {
    try {
      this.patientState = inject(PatientStateService, { optional: true });
    } catch {
      this.patientState = null;
    }
    try {
      this.patientManagement = inject(PatientManagementService, { optional: true });
    } catch {
      this.patientManagement = null;
    }
  }

  private readonly KDF_ITERATIONS = 100_000;

  /**
   * Derives an AES-GCM-256 key from a user passphrase using PBKDF2-SHA256.
   */
  async deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: this.KDF_ITERATIONS,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Computes a SHA-256 hex checksum of plaintext string.
   */
  async computeSha256(text: string): Promise<string> {
    const enc = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(text));
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Encrypts the active patient clinical dataset into an AES-GCM-256 container.
   */
  async exportEncryptedVault(passphrase: string, patientId?: string): Promise<IVaultArchiveContainer> {
    if (!passphrase || passphrase.length < 6) {
      throw new Error('Passphrase must be at least 6 characters.');
    }

    const pid = patientId || this.patientManagement?.selectedPatientId() || 'P001';
    const payload: IDecryptedVaultPayload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      patientId: pid,
      patientData: this.patientManagement?.patients().find(p => p.id === pid) as any || { id: pid },
      issues: this.patientState?.issues() || {},
      vitals: this.patientState?.vitals() || {},
      activePhilosophy: this.patientState?.activePhilosophy() || 'western',
      notes: this.patientState?.selectedNoteId() ? { activeNoteId: this.patientState.selectedNoteId() } : {}
    };

    const plaintext = JSON.stringify(payload);
    const checksum = await this.computeSha256(plaintext);

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(passphrase, salt);

    const enc = new TextEncoder();
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      enc.encode(plaintext)
    );

    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
    const ciphertextBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));

    return {
      header: {
        format: 'POCKETGULL_ENCRYPTED_VAULT',
        version: '1.0.0',
        kdf: 'PBKDF2',
        kdfIterations: this.KDF_ITERATIONS,
        kdfHash: 'SHA-256',
        cipher: 'AES-GCM-256',
        saltHex,
        ivHex,
        createdAt: new Date().toISOString(),
        checksumSha256: checksum
      },
      ciphertextBase64
    };
  }

  /**
   * Decrypts an encrypted vault container and verifies its cryptographic integrity.
   */
  async importEncryptedVault(container: IVaultArchiveContainer, passphrase: string): Promise<IDecryptedVaultPayload> {
    if (container.header.format !== 'POCKETGULL_ENCRYPTED_VAULT') {
      throw new Error('Invalid vault archive format.');
    }

    const salt = new Uint8Array(container.header.saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const iv = new Uint8Array(container.header.ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const key = await this.deriveKey(passphrase, salt);

    const ciphertextBinary = atob(container.ciphertextBase64);
    const ciphertextBytes = new Uint8Array(ciphertextBinary.length);
    for (let i = 0; i < ciphertextBinary.length; i++) {
      ciphertextBytes[i] = ciphertextBinary.charCodeAt(i);
    }

    let decryptedBuffer: ArrayBuffer;
    try {
      decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv as BufferSource },
        key,
        ciphertextBytes
      );
    } catch {
      throw new Error('Decryption failed. Incorrect passphrase or corrupted vault.');
    }

    const dec = new TextDecoder();
    const plaintext = dec.decode(decryptedBuffer);

    // Verify SHA-256 checksum
    const computedHash = await this.computeSha256(plaintext);
    if (computedHash !== container.header.checksumSha256) {
      throw new Error('Integrity check failed: Vault payload checksum mismatch.');
    }

    const payload: IDecryptedVaultPayload = JSON.parse(plaintext);

    // Hydrate into application state if available
    if (this.patientState && payload.issues) {
      this.patientState.issues.set(payload.issues as any);
    }
    if (this.patientState && payload.activePhilosophy) {
      this.patientState.selectPhilosophy(payload.activePhilosophy as any);
    }

    return payload;
  }
}
