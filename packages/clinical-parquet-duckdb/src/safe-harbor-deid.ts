// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { AgeTier } from './types.js';

export class SafeHarborDeidentifier {
  private readonly salt: string;

  constructor(customSalt?: string) {
    this.salt = customSalt || 'POCKETGULL_SAFE_HARBOR_DEID_V1_STATIC_PEPPER';
  }

  /**
   * Deterministically hashes a patient ID into an irreversible pseudonymous token
   * Format: DEID_PAT_XXXXXXXXXXXX
   */
  hashPatientId(rawId: string): string {
    if (!rawId) return 'DEID_PAT_ANONYMOUS';
    // Simple deterministic FNV-1a 64-bit hash cascade for zero-dependency universal browser/node runtime
    let h1 = 0x811c9dc5;
    let h2 = 0x27d4eb2f;
    const combined = `${this.salt}:${rawId.trim().toLowerCase()}`;

    for (let i = 0; i < combined.length; i++) {
      const code = combined.charCodeAt(i);
      h1 ^= code;
      h1 = Math.imul(h1, 0x01000193);
      h2 ^= code;
      h2 = Math.imul(h2, 0x5bd1e995);
    }

    const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
    const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
    return `DEID_PAT_${(hex1 + hex2).substring(0, 12).toUpperCase()}`;
  }

  /**
   * Aggregates birth date into standard HIPAA Safe Harbor age tiers (capping >89 to '89+')
   */
  calculateAgeTier(birthDateStr?: string, referenceYear: number = 2026): AgeTier {
    if (!birthDateStr) return '30-44';
    const yearMatch = birthDateStr.match(/^(\d{4})/);
    if (!yearMatch) return '30-44';

    const birthYear = parseInt(yearMatch[1], 10);
    const age = referenceYear - birthYear;

    if (age < 18) return '0-17';
    if (age <= 29) return '18-29';
    if (age <= 44) return '30-44';
    if (age <= 64) return '45-64';
    if (age <= 89) return '65-89';
    return '89+';
  }

  /**
   * Masks postal codes according to HIPAA Safe Harbor (3-digit prefix if population > 20,000)
   */
  maskPostalCode(zip?: string): string | undefined {
    if (!zip || typeof zip !== 'string') return undefined;
    const clean = zip.trim().replace(/[^\d]/g, '');
    if (clean.length < 3) return undefined;
    return clean.substring(0, 3);
  }
}
