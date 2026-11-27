// SPDX-License-Identifier: Apache-2.0
import { Firestore, Timestamp } from '@google-cloud/firestore';
import * as crypto from 'node:crypto';

// Lazy Firestore client for GCP backend.
// ADC (Application Default Credentials) will be loaded on demand.
let _db: Firestore | null = null;
function getDb(): Firestore {
  if (!_db) {
    _db = new Firestore();
  }
  return _db;
}

export interface ApiKeyDocument {
  tenantId: string;
  name: string;
  keyHash: string;
  prefix: string;
  createdAt: FirebaseFirestore.Timestamp;
  lastUsedAt?: FirebaseFirestore.Timestamp;
  status: 'active' | 'revoked';
}

export type SafeApiKeySummary = Omit<ApiKeyDocument, 'keyHash'> & { id: string };

let _ephemeralKeySalt: string | null = null;
let _warnedMissingApiKeySalt = false;

/**
 * Resolves the scrypt salt strictly from Secret Manager / `API_KEY_SALT` env var,
 * falling back to a per-boot 256-bit CSPRNG hex salt (zero static string literals).
 */
function getApiKeySalt(): string {
  const configured = process.env['API_KEY_SALT']?.trim();
  if (configured && configured.length >= 16) {
    return configured;
  }
  if (!_ephemeralKeySalt) {
    _ephemeralKeySalt = crypto.randomBytes(32).toString('hex');
    if ((process.env['NODE_ENV'] === 'production' || Boolean(process.env['K_SERVICE'])) && !_warnedMissingApiKeySalt) {
      _warnedMissingApiKeySalt = true;
      console.warn('[ApiKeyService] API_KEY_SALT env secret not configured; using ephemeral per-boot CSPRNG salt.');
    }
  }
  return _ephemeralKeySalt;
}

function hashApiKey(rawKey: string): string {
  // Memory-hard scrypt (N=16384, r=8, p=1, keylen=64) to satisfy CodeQL CWE-916 requirements
  return crypto.scryptSync(rawKey, getApiKeySalt(), 64, { N: 16384, r: 8, p: 1 }).toString('hex');
}

export class ApiKeyService {
  private get collection() {
    return getDb().collection('api_keys');
  }

  /**
   * Generates a new API key for a given tenant.
   * Returns the raw key (which MUST be shown to the user exactly once) and the document ID.
   */
  async generateKey(tenantId: string, name: string): Promise<{ rawKey: string; keyId: string }> {
    const rawKey = 'sk_live_' + crypto.randomBytes(32).toString('base64url');
    const keyHash = hashApiKey(rawKey);
    const prefix = rawKey.substring(0, 16) + '...';

    const docRef = this.collection.doc();
    const docData: ApiKeyDocument = {
      tenantId,
      name,
      keyHash,
      prefix,
      createdAt: Timestamp.now(),
      status: 'active',
    };

    await docRef.set(docData);

    return { rawKey, keyId: docRef.id };
  }

  /**
   * Validates a raw API key.
   * Returns the tenantId if valid, or null if invalid/revoked.
   */
  async validateKey(rawKey: string): Promise<string | null> {
    if (!rawKey || !rawKey.startsWith('sk_live_')) return null;

    const keyHash = hashApiKey(rawKey);
    const snapshot = await this.collection
      .where('keyHash', '==', keyHash)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data() as ApiKeyDocument;

    // Update lastUsedAt in the background (fire and forget)
    doc.ref.update({ lastUsedAt: Timestamp.now() }).catch(console.error);

    return data.tenantId;
  }

  /**
   * Lists all keys for a tenant (strictly omitting raw keys and cryptographic keyHash).
   */
  async listKeys(tenantId: string): Promise<SafeApiKeySummary[]> {
    const snapshot = await this.collection.where('tenantId', '==', tenantId).get();
    return snapshot.docs.map(doc => {
      const { keyHash: _omittedHash, ...safeFields } = doc.data() as ApiKeyDocument;
      return {
        id: doc.id,
        ...safeFields
      };
    });
  }

  /**
   * Revokes an API key.
   */
  async revokeKey(keyId: string, tenantId: string): Promise<boolean> {
    const docRef = this.collection.doc(keyId);
    const doc = await docRef.get();

    if (!doc.exists) return false;

    const data = doc.data() as ApiKeyDocument;
    if (data.tenantId !== tenantId) return false;

    await docRef.update({ status: 'revoked' });
    return true;
  }
}

export const apiKeyService = new ApiKeyService();
