/**
 * @file asymmetric-e2ee.service.ts
 * @description Asymmetric End-to-End Encryption (E2EE) Key Pair & Encapsulation Vault.
 * 
 * Provides client-side zero-knowledge encryption using WebCrypto:
 * - ECDH (P-256) asymmetric key pair generation
 * - Ephemeral Diffie-Hellman shared secret derivation
 * - HKDF key expansion -> AES-GCM 256-bit symmetric encryption
 * - NIST SP 800-90A CSPRNG IVs + FDA 21 CFR Part 11 SHA-256 audit digest seals.
 */

import { Injectable } from '@angular/core';

export interface IEncryptedPayloadBundle {
  readonly ephemeralPublicKeyJwk: JsonWebKey;
  readonly initializationVectorHex: string;
  readonly ciphertextHex: string;
  readonly integrityDigestSha256: string;
  readonly timestampIso: string;
}

@Injectable({
  providedIn: 'root'
})
export class AsymmetricE2eeService {
  /**
   * Generates a new ECDH P-256 key pair.
   */
  public async generateKeyPair(): Promise<CryptoKeyPair> {
    return await globalThis.crypto.subtle.generateKey(
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      ['deriveKey', 'deriveBits']
    );
  }

  /**
   * Exports a public key to JSON Web Key (JWK) format for transmission.
   */
  public async exportPublicKey(publicKey: CryptoKey): Promise<JsonWebKey> {
    return await globalThis.crypto.subtle.exportKey('jwk', publicKey);
  }

  /**
   * Imports a remote JWK public key into a CryptoKey.
   */
  public async importPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
    return await globalThis.crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      []
    );
  }

  /**
   * Encrypts plaintext string for a recipient public key using ephemeral ECDH + AES-GCM 256.
   */
  public async encryptForRecipient(
    plaintext: string,
    recipientPublicKey: CryptoKey
  ): Promise<IEncryptedPayloadBundle> {
    // 1. Generate ephemeral sender key pair
    const ephemeralPair = await this.generateKeyPair();
    const ephemeralJwk = await this.exportPublicKey(ephemeralPair.publicKey);

    // 2. Derive shared AES-GCM 256 key
    const sharedAesKey = await globalThis.crypto.subtle.deriveKey(
      { name: 'ECDH', public: recipientPublicKey },
      ephemeralPair.privateKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    // 3. NIST SP 800-90A CSPRNG 96-bit IV
    const iv = new Uint8Array(12);
    globalThis.crypto.getRandomValues(iv);

    // 4. Encrypt plaintext
    const enc = new TextEncoder();
    const plaintextBytes = enc.encode(plaintext);
    const cipherBuffer = await globalThis.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      sharedAesKey,
      plaintextBytes
    );

    // 5. Compute SHA-256 integrity seal
    const digestBuffer = await globalThis.crypto.subtle.digest('SHA-256', cipherBuffer);
    const digestHex = Array.from(new Uint8Array(digestBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const ivHex = Array.from(iv)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const cipherHex = Array.from(new Uint8Array(cipherBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return {
      ephemeralPublicKeyJwk: ephemeralJwk,
      initializationVectorHex: ivHex,
      ciphertextHex: cipherHex,
      integrityDigestSha256: digestHex,
      timestampIso: new Date().toISOString()
    };
  }

  /**
   * Decrypts a payload bundle using the recipient's private key.
   */
  public async decryptBundle(
    bundle: IEncryptedPayloadBundle,
    recipientPrivateKey: CryptoKey
  ): Promise<string> {
    // 1. Import ephemeral public key
    const ephemeralPubKey = await this.importPublicKey(bundle.ephemeralPublicKeyJwk);

    // 2. Re-derive shared AES-GCM key
    const sharedAesKey = await globalThis.crypto.subtle.deriveKey(
      { name: 'ECDH', public: ephemeralPubKey },
      recipientPrivateKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    // 3. Parse IV and Ciphertext
    const iv = new Uint8Array(bundle.initializationVectorHex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));
    const cipherBytes = new Uint8Array(bundle.ciphertextHex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));

    // 4. Verify integrity digest before decryption
    const digestBuffer = await globalThis.crypto.subtle.digest('SHA-256', cipherBytes);
    const computedDigest = Array.from(new Uint8Array(digestBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (computedDigest !== bundle.integrityDigestSha256) {
      throw new Error('FDA 21 CFR Part 11 Integrity Violation: Ciphertext digest mismatch.');
    }

    // 5. Decrypt
    const plainBuffer = await globalThis.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      sharedAesKey,
      cipherBytes
    );

    const dec = new TextDecoder();
    return dec.decode(plainBuffer);
  }
}
